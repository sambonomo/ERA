// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // or axios if you prefer

admin.initializeApp();

// TEAMS WEBHOOK from Firebase config (optional fallback to an empty string)
const TEAMS_WEBHOOK_URL = functions.config().teams ?
  functions.config().teams.webhook_url :
  null;

// Scheduled / Trigger-based functions
exports.sendBirthdayNotification = require("./sendBirthdayNotification");
exports.sendAnniversaryTeams = require("./sendAnniversaryTeams");
exports.generateKudosSummary = require("./generateKudosSummary");

// Callable functions (e.g. Stripe Checkout)
exports.createCheckoutSession = require("./createCheckoutSession").createCheckoutSession;

/**
 * 2) Real-Time Kudos Notifications (Firestore Trigger)
 *    Listens for new kudos docs, then posts to Microsoft Teams
 *    as a simple “MessageCard”.
 */
exports.onKudosCreated = functions.firestore
    .document("kudos/{kudoId}")
    .onCreate(async (snap, context) => {
      if (!TEAMS_WEBHOOK_URL) {
        console.log("No TEAMS_WEBHOOK_URL in config. Skipping Teams kudos notifications.");
        return null;
      }

      const kudo = snap.data() || {};
      const {senderId, receiverId, message, badge} = kudo;

      // Optionally fetch employees to show real names
      let senderName = senderId;
      let receiverName = receiverId;

      try {
        const db = admin.firestore();

        // Sender
        if (senderId) {
          const senderDoc = await db.collection("employees").doc(senderId).get();
          if (senderDoc.exists) {
            senderName = senderDoc.data().name || senderId;
          }
        }

        // Receiver
        if (receiverId) {
          const receiverDoc = await db.collection("employees").doc(receiverId).get();
          if (receiverDoc.exists) {
            receiverName = receiverDoc.data().name || receiverId;
          }
        }
      } catch (err) {
        console.error("Error fetching sender/receiver name:", err);
      }

      // Build a simple Teams MessageCard
      const cardPayload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": "New Kudos",
        "sections": [
          {
            activityTitle: `👏 ${senderName} recognized ${receiverName}!`,
            text: `**Message**: ${message || "No message provided."}${
            badge ? `\n\n**Badge**: ${badge}` : ""
            }`,
          },
        ],
      };

      // Post to Teams
      try {
        const res = await fetch(TEAMS_WEBHOOK_URL, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(cardPayload),
        });

        if (!res.ok) {
          throw new Error(`Teams webhook responded with status ${res.status}`);
        }
        console.log(`Kudos posted to Teams successfully! [ID: ${context.params.kudoId}]`);
      } catch (error) {
        console.error("Error posting kudos to Teams:", error);
      }

      return null;
    });
