// functions/sendAnniversaryTeams.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Read Teams Webhook from Firebase Functions config
const TEAMS_WEBHOOK_URL = functions.config().teams
  ? functions.config().teams.webhook_url
  : null;

/**
 * Runs every Monday at 9 AM Pacific (or specified timeZone).
 * Finds employees with hireDate in the next 7 days, calculates
 * years of service, then sends a Microsoft Teams message card
 * to congratulate them on their upcoming anniversary.
 */
module.exports = functions.pubsub
  .schedule('0 9 * * MON') // every Monday at 9 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    if (!TEAMS_WEBHOOK_URL) {
      console.log('No TEAMS_WEBHOOK_URL found in config. Skipping Teams notification.');
      return null;
    }

    const db = admin.firestore();
    const today = new Date();

    // We'll look 7 days ahead for upcoming anniversaries
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Convert JS dates to Firestore Timestamps
    const todayTimestamp = admin.firestore.Timestamp.fromDate(today);
    const nextWeekTimestamp = admin.firestore.Timestamp.fromDate(nextWeek);

    // Query employees whose hireDate is between today and next 7 days
    const snapshot = await db
      .collection('employees')
      .where('hireDate', '>=', todayTimestamp)
      .where('hireDate', '<', nextWeekTimestamp)
      .get();

    if (snapshot.empty) {
      console.log('No upcoming work anniversaries this week!');
      return null;
    }

    // Helper: Calculate full years of service
    function calculateYearsOfService(hireDate, currentDate) {
      let years = currentDate.getFullYear() - hireDate.getFullYear();
      // Convert month/day to a numeric "MMDD" for easier comparison
      const currentMonthDay = (currentDate.getMonth() + 1) * 100 + currentDate.getDate();
      const hireMonthDay = (hireDate.getMonth() + 1) * 100 + hireDate.getDate();

      // If we haven't reached the hire month/day yet this year, subtract one
      if (currentMonthDay < hireMonthDay) {
        years--;
      }
      return years;
    }

    const notificationPromises = [];

    snapshot.forEach((doc) => {
      const emp = doc.data();
      const employeeName = emp.name || 'A Team Member';
      const hireDateObj = emp.hireDate.toDate(); // from Firestore Timestamp
      const years = calculateYearsOfService(hireDateObj, today);

      console.log(`Preparing anniversary notification for ${employeeName} - hire date: ${hireDateObj.toDateString()} (Years: ${years})`);

      // Build the Teams MessageCard payload
      const cardPayload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7',
        summary: 'Work Anniversary Notification',
        sections: [
          {
            activityTitle: `🎉 Celebrating ${employeeName}'s Work Anniversary!`,
            activitySubtitle: `Hire Date: ${hireDateObj.toLocaleDateString()}`,
            text: `They are celebrating **${years}** year(s) with us. Let's congratulate them!`,
          },
        ],
      };

      // Post to Teams webhook
      const sendRequest = fetch(TEAMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardPayload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Teams webhook responded with ${res.status}`);
          }
          console.log(`Anniversary message sent for ${employeeName}`);
        })
        .catch((err) => {
          console.error(`Error sending Teams message for ${employeeName}`, err);
        });

      notificationPromises.push(sendRequest);
    });

    // Wait for all fetch calls to complete
    await Promise.all(notificationPromises);
    console.log('All anniversary notifications sent to Teams.');
    return null;
  });
