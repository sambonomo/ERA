// functions/stripeWebhook.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// 1) Retrieve your Stripe secret & webhook signing secret from functions config
const stripe = Stripe(functions.config().stripe.secret_key);
const endpointSecret = functions.config().stripe.webhook_secret;
// e.g. firebase functions:config:set stripe.webhook_secret="whsec_..."

module.exports.handleStripeWebhook = functions.https.onRequest((req, res) => {
  // 2) Verify the event came from Stripe using signature
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return res.status(400).send("Webhook Error");
  }

  // 3) Handle the event type
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // e.g. session.metadata or session.customer_email
      console.log("Checkout Session Completed for", session.customer_email);
      // Possibly set plan in Firestore
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      console.log("Subscription updated:", subscription.id);
      // Update Firestore doc with subscription details
      break;
    }
    // ... handle other event types if needed ...
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // 4) Return a response to acknowledge receipt
  res.json({received: true});
});
