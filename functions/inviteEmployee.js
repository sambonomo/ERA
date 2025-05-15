/**
 * inviteEmployee.js
 * A callable Cloud Function that allows an admin to invite a user into the organization.
 * Creates a new user in Firebase Auth, sets up Firestore docs, and sends an email link for password setup.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Make sure you've called admin.initializeApp() in your index.js
// e.g. admin.initializeApp();

exports.inviteEmployee = functions.https.onCall(async (data, context) => {
  // data should contain { email, name }
  // context has auth info about the caller
  const { email, name } = data;
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to invite an employee.'
    );
  }

  // Check that the caller is an admin (e.g., role stored in Firestore or custom claims)
  // For simplicity, we show a Firestore check:
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().doc(`users/${callerUid}`).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can invite users.'
    );
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
        displayName: name || '',
        emailVerified: false,
      });
    }

    const newUid = userRecord.uid;
    // Now link them to the caller's company
    const companyId = callerDoc.data().companyId;
    const role = 'user'; // default role for new invites

    // Create or merge a doc in 'users' collection
    await admin.firestore().doc(`users/${newUid}`).set(
      {
        email,
        displayName: name || '',
        role,
        companyId,
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Optionally, also create them in the employees subcollection
    await admin
      .firestore()
      .doc(`companies/${companyId}/employees/${newUid}`)
      .set(
        {
          name: name || '',
          email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // Generate a password reset link so they can set up their credentials
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: 'https://your-sparkblaze-app.com/welcome', // your app's URL
      handleCodeInApp: true,
    });

    // Send the invitation email using a third-party email service.
    // For demonstration, we just log the link. In production, you'd use, e.g., SendGrid, Mailgun, or nodemailer.
    console.log(`Invite link for ${email}: ${link}`);

    // Return success message
    return { result: `Invitation sent to ${email}`, link };
  } catch (err) {
    console.error('inviteEmployee error:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
