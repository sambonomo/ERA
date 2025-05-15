// src/firebase/functions/generateKudosSummary.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Example usage: firebase functions:config:set slack.webhook_url="https://hooks.slack.com/services/xxx/yyy"
const SLACK_WEBHOOK_URL = functions.config().slack
  ? functions.config().slack.webhook_url
  : null;

module.exports = functions.pubsub
  .schedule('0 16 * * FRI') // Example: runs every Friday at 16:00 (4 PM)
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    if (!SLACK_WEBHOOK_URL) {
      console.log('No Slack webhook URL found in functions config. Skipping...');
      return null;
    }

    const db = admin.firestore();

    // 1) Identify the date range for the past 7 days
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    // Convert to Firestore Timestamps
    const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
    const weekAgoTimestamp = admin.firestore.Timestamp.fromDate(oneWeekAgo);

    // 2) Query kudos created within the last 7 days
    const kudosSnapshot = await db
      .collection('kudos')
      .where('createdAt', '>=', weekAgoTimestamp)
      .where('createdAt', '<=', nowTimestamp)
      .get();

    if (kudosSnapshot.empty) {
      console.log('No kudos this week!');
      // Still might want to post a Slack message that says "0 kudos..."
      // or you can just return.
      return null;
    }

    // 3) Aggregate stats: total kudos, top receivers, top givers, etc.
    let totalKudos = 0;
    const receiverCountMap = {};
    const senderCountMap = {};

    kudosSnapshot.forEach((doc) => {
      totalKudos++;
      const kudo = doc.data();
      const receiver = kudo.receiverId;
      const sender = kudo.senderId;

      // Count how many kudos each receiver got
      if (!receiverCountMap[receiver]) receiverCountMap[receiver] = 0;
      receiverCountMap[receiver]++;

      // Count how many kudos each sender gave
      if (!senderCountMap[sender]) senderCountMap[sender] = 0;
      senderCountMap[sender]++;
    });

    // Sort by highest kudos received
    const topReceivers = Object.entries(receiverCountMap)
      .sort((a, b) => b[1] - a[1]) // descending
      .slice(0, 3);

    // Sort by highest kudos given
    const topGivers = Object.entries(senderCountMap)
      .sort((a, b) => b[1] - a[1]) // descending
      .slice(0, 3);

    // 4) Prepare a Slack message summary
    const startDate = oneWeekAgo.toLocaleDateString();
    const endDate = now.toLocaleDateString();

    let text = `:sparkles: *Weekly Kudos Summary* :sparkles:\n`;
    text += `Date Range: ${startDate} - ${endDate}\n`;
    text += `*Total Kudos Given:* ${totalKudos}\n\n`;

    // List top 3 receivers
    text += `*Top 3 Receivers:*\n`;
    if (topReceivers.length === 0) {
      text += `_No kudos received this week._\n`;
    } else {
      topReceivers.forEach(([receiverId, count], idx) => {
        text += `${idx + 1}. <@${receiverId}> with ${count} kudos\n`;
      });
    }
    text += `\n`;

    // List top 3 givers
    text += `*Top 3 Givers:*\n`;
    if (topGivers.length === 0) {
      text += `_No kudos given this week._\n`;
    } else {
      topGivers.forEach(([senderId, count], idx) => {
        text += `${idx + 1}. <@${senderId}> gave ${count} kudos\n`;
      });
    }

    // 5) Post to Slack
    try {
      await axios.post(SLACK_WEBHOOK_URL, { text });
      console.log('Weekly kudos summary posted to Slack successfully!');
    } catch (error) {
      console.error('Error posting kudos summary to Slack:', error);
    }

    return null;
  });
