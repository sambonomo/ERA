/**
 * onKudosCreate.js
 * A Firestore trigger that runs when a new kudos doc is created.
 * Enforces a monthly quota, updates points for sender/receiver, and creates a notification for the receiver.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Timestamp} = require("firebase-admin/firestore");

// For demonstration, set a monthly limit of 3 kudos per user:
const KUDOS_MONTHLY_LIMIT = 3;

exports.onKudosCreate = functions.firestore
    .document("companies/{companyId}/kudos/{kudoId}")
    .onCreate(async (snap, context) => {
      const kudo = snap.data();
      const {senderId, receiverId, createdAt, message} = kudo;
      const {companyId, kudoId} = context.params;

      // If 'createdAt' not set, set it now
      if (!createdAt) {
        await snap.ref.update({createdAt: admin.firestore.FieldValue.serverTimestamp()});
      }

      try {
        const db = admin.firestore();
        const kudosRef = db.collection(`companies/${companyId}/kudos`);

        // 1) Enforce monthly limit:
        // Determine start of this month
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstOfMonthTimestamp = Timestamp.fromDate(firstOfMonth);

        // Count how many kudos this sender has made since firstOfMonth
        const querySnap = await kudosRef
            .where("senderId", "==", senderId)
            .where("createdAt", ">=", firstOfMonthTimestamp)
            .get();

        if (querySnap.size >= KUDOS_MONTHLY_LIMIT) {
        // Exceeded limit (since doc is created, size includes this kudo)
          console.log(
              `User ${senderId} exceeded monthly kudos limit: found ${querySnap.size}`,
          );
          // Delete this kudo to revert
          await snap.ref.delete();
          return null;
        }

        // 2) Update points and fetch sender name
        const senderRef = db.doc(`companies/${companyId}/employees/${senderId}`);
        const receiverRef = db.doc(`companies/${companyId}/employees/${receiverId}`);
        let senderName = "Someone";
        await db.runTransaction(async (txn) => {
        // Sender
          const senderDoc = await txn.get(senderRef);
          if (senderDoc.exists) {
            senderName = senderDoc.data().name || "Someone";
            txn.update(senderRef, {
              points: admin.firestore.FieldValue.increment(1),
            });
          }
          // Receiver
          const receiverDoc = await txn.get(receiverRef);
          if (receiverDoc.exists) {
            txn.update(receiverRef, {
              points: admin.firestore.FieldValue.increment(5),
            });
          }
        });

        // 3) Create notification for receiver
        try {
          const notificationRef = db.collection("notifications");
          await notificationRef.add({
            userId: receiverId,
            type: "kudo_received",
            message: `You received a kudo from ${senderName}: "${message}"`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            relatedId: kudoId,
            companyId: companyId,
          });
          console.log(`Notification created for kudo ${kudoId} to user ${receiverId}`);
        } catch (notificationErr) {
          console.error(`Failed to create notification for kudo ${kudoId}:`, notificationErr);
        }

        console.log(
            `Kudos ${kudoId} in company ${companyId} processed. senderId ${senderId} => receiverId ${receiverId}`,
        );
        return null;
      } catch (err) {
        console.error("onKudosCreate error:", err);
        return null;
      }
    });
