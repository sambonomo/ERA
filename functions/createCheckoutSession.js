// functions/createCheckoutSession.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Load Stripe credentials and price IDs from functions config
// e.g. firebase functions:config:set stripe.secret_key="sk_test_123" ...
const stripe = Stripe(functions.config().stripe.secret_key);
const PRICE_PRO_MONTHLY = functions.config().stripe.price_pro_monthly;
const PRICE_PRO_ANNUAL = functions.config().stripe.price_pro_annual;
const PRICE_ENTERPRISE_MONTHLY = functions.config().stripe.price_enterprise_monthly;
// etc.

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Must be logged in
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in.",
    );
  }

  const uid = context.auth.uid;
  const {plan, billingCycle} = data;

  // If user chooses free
  if (plan === "free") {
    await admin.firestore().collection("users").doc(uid).set(
        {
          plan: "free",
          subscriptionStatus: "active",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
    );
    return {sessionId: null, message: "Switched to Free plan (no checkout needed)."};
  }

  // Determine Stripe price ID
  let priceId = "";
  if (plan === "pro") {
    if (billingCycle === "annual") {
      priceId = PRICE_PRO_ANNUAL;
    } else {
      priceId = PRICE_PRO_MONTHLY;
    }
  } else if (plan === "enterprise") {
    if (PRICE_ENTERPRISE_MONTHLY) {
      priceId = PRICE_ENTERPRISE_MONTHLY;
    } else {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Enterprise plan requires contact with sales.",
      );
    }
  } else {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Unknown plan. Valid plans: free, pro, enterprise.",
    );
  }

  try {
    // Replace with your actual domain (local dev or production):
    const domain = "http://localhost:3000";
    // or e.g. 'https://sparkblaze.yourdomain.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${domain}/subscription-success`,
      cancel_url: `${domain}/subscription-cancel`,
      customer_email: context.auth.token.email,
      // metadata: { firebaseUid: uid },
    });

    return {sessionId: session.id};
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Unable to create checkout session. Please try again later.",
    );
  }
});
