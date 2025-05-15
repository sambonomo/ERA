// src/firebase/functions/sendAnniversaryTeams.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // or axios

// Store your MS Teams webhook in Firebase config for security
// e.g.  firebase functions:config:set teams.webhook_url="https://outlook.office.com/webhook/..." 
const TEAMS_WEBHOOK_URL = functions.config().teams
  ? functions.config().teams.webhook_url
  : null;

module.exports = functions.pubsub
  .schedule('0 9 * * MON') // Runs every Monday at 9 AM
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    if (!TEAMS_WEBHOOK_URL) {
      console.log('No Teams webhook URL found in functions config. Skipping.');
      return null;
    }

    const db = admin.firestore();
    const today = new Date();

    // We'll look 7 days ahead for upcoming anniversaries
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Convert to Firestore Timestamps if your field is a Firestore 'Timestamp'
    const todayTimestamp = admin.firestore.Timestamp.fromDate(today);
    const nextWeekTimestamp = admin.firestore.Timestamp.fromDate(nextWeek);

    // Query employees with hireDate between today and the next 7 days
    const snapshot = await db
      .collection('employees')
      .where('hireDate', '>=', todayTimestamp)
      .where('hireDate', '<', nextWeekTimestamp)
      .get();

    if (snapshot.empty) {
      console.log('No upcoming anniversaries this week!');
      return null;
    }

    const notificationPromises = [];

    // Helper function to calculate how many full years between two dates
    function calculateYearsOfService(hire, current) {
      let years = current.getFullYear() - hire.getFullYear();
      const currentMonthDay = (current.getMonth() + 1) * 100 + current.getDate();
      const hireMonthDay = (hire.getMonth() + 1) * 100 + hire.getDate();
      if (currentMonthDay < hireMonthDay) {
        years--;
      }
      return years;
    }

    snapshot.forEach((doc) => {
      const emp = doc.data();
      const employeeName = emp.name || 'A Team Member';
      const hireDate = emp.hireDate.toDate();
      const years = calculateYearsOfService(hireDate, today);

      console.log(`Preparing anniversary notification for ${employeeName} (Hire date: ${hireDate.toDateString()})`);

      // Example Adaptive Card / MessageCard for Teams
      const teamsPayload = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: '0076D7', 
        summary: 'Work Anniversary Notification',
        sections: [
          {
            activityTitle: `:tada: Celebrating ${employeeName}'s Work Anniversary!`,
            activitySubtitle: `Hire Date: ${hireDate.toLocaleDateString()}`,
            text: `They are celebrating **${years} year(s)** with us. Let's congratulate them!`,
          },
        ],
      };

      // Post to Teams webhook
      const requestPromise = fetch(TEAMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsPayload),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Teams webhook responded with status ${res.status}`);
          }
          console.log(`Anniversary message sent for ${employeeName}`);
        })
        .catch((err) => {
          console.error(`Error sending Teams message for ${employeeName}:`, err);
        });

      notificationPromises.push(requestPromise);
    });

    // Wait for all messages to send
    await Promise.all(notificationPromises);
    console.log('All anniversary notifications completed.');
    return null;
  });
