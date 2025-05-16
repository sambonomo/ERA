/**
 * inviteEmployee.js
 * A callable Cloud Function that allows an admin to invite a user into the organization.
 * Creates a new user in Firebase Auth, sets up Firestore docs, and sends an email link for password setup.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Make sure you've called admin.initializeApp() in your index.js
// e.g. admin.initializeApp();

exports.inviteEmployee = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // data should contain { email, name }
    const {email, name} = req.body;

    if (!req.auth) {
      res.status(401).json({error: "Must be authenticated to invite an employee."});
      return;
    }

    // Check that the caller is an admin (e.g., role stored in Firestore or custom claims)
    // For simplicity, we show a Firestore check:
    const callerUid = req.auth.uid;
    const callerDoc = await admin.firestore().doc(`users/${callerUid}`).get();
    if (!callerDoc.exists || callerDoc.data().role !== "admin") {
      res.status(403).json({error: "Only admins can invite users."});
      return;
    }

    try {
      // Try to get an existing user by email
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`User already exists: ${userRecord.uid}`);
      } catch (getErr) {
        // If not found, create new
        console.log(`User not found, creating new user with email ${email}`);
        userRecord = await admin.auth().createUser({
          email,
          displayName: name || "",
          emailVerified: false,
        });
      }

      const newUid = userRecord.uid;
      // Now link them to the caller's company
      const companyId = callerDoc.data().companyId;
      const role = "user"; // default role for new invites

      // Create or merge a doc in 'users' collection
      await admin.firestore().doc(`users/${newUid}`).set(
          {
            email,
            displayName: name || "",
            role,
            companyId,
            invitedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
      );

      // Optionally, also create them in the employees subcollection
      await admin
          .firestore()
          .doc(`companies/${companyId}/employees/${newUid}`)
          .set(
              {
                name: name || "",
                email,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              {merge: true},
          );

      // Generate a password reset link so they can set up their credentials
      const link = await admin.auth().generatePasswordResetLink(email, {
        url: "https://your-sparkblaze-app.com/welcome", // your app's URL
        handleCodeInApp: true,
      });

      // Send the invitation email using a third-party email service.
      // For demonstration, we just log the link. In production, you'd use, e.g., SendGrid, Mailgun, or nodemailer.
      console.log(`Invite link for ${email}: ${link}`);

      // Return success message
      res.status(200).json({result: `Invitation sent to ${email}`, link});
    } catch (err) {
      console.error("inviteEmployee error:", err);
      res.status(500).json({error: err.message});
    }
  });
});
