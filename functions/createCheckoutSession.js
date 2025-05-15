const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const stripe = Stripe(functions.config().stripe.secret_key);

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Please log in');
  }

  // data.plan could be "pro" or "enterprise"
  const { plan } = data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan === 'pro' ? 'price_ABC123' : 'price_DEF456', // use your Stripe price IDs
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: 'https://your-app.com/subscription-success',
    cancel_url: 'https://your-app.com/subscription-cancel',
  });

  return { sessionId: session.id };
});
