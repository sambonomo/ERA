// functions/createCheckoutSession.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// 1) Use environment variables for Stripe secret, or set them with Firebase functions config
//    e.g. firebase functions:config:set stripe.secret_key="sk_test_123" stripe.price_pro_monthly="price_abc" ...
const stripe = Stripe(functions.config().stripe.secret_key);

// Example: environment config for different prices
// firebase functions:config:set stripe.price_pro_monthly="price_ABC123"
// firebase functions:config:set stripe.price_pro_annual="price_ABC123_annual"
// firebase functions:config:set stripe.price_enterprise_monthly="price_ENTERPRISE_MONTHLY"
// etc.
const PRICE_PRO_MONTHLY = functions.config().stripe.price_pro_monthly;
const PRICE_PRO_ANNUAL = functions.config().stripe.price_pro_annual;
const PRICE_ENTERPRISE_MONTHLY = functions.config().stripe.price_enterprise_monthly; 
// Or price_enterprise_annual, etc.

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const uid = context.auth.uid;
  const { plan, billingCycle } = data; // e.g. plan = 'pro', billingCycle = 'monthly' or 'annual'

  // 2) If user chooses free plan, we might skip Stripe and just downgrade
  if (plan === 'free') {
    // Example: update Firestore doc to reflect free plan immediately
    await admin.firestore().collection('users').doc(uid).set({
      plan: 'free',
      subscriptionStatus: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { sessionId: null, message: 'Switched to Free plan (no checkout needed).' };
  }

  // 3) Determine the correct price ID
  let priceId = '';
  if (plan === 'pro') {
    if (billingCycle === 'annual') {
      priceId = PRICE_PRO_ANNUAL; // e.g. 'price_ABC123_annual'
    } else {
      priceId = PRICE_PRO_MONTHLY; // e.g. 'price_ABC123'
    }
  } else if (plan === 'enterprise') {
    // Possibly you handle enterprise differently, or have an enterprise price
    if (PRICE_ENTERPRISE_MONTHLY) {
      // If you do have an enterprise monthly price:
      priceId = PRICE_ENTERPRISE_MONTHLY;
    } else {
      // Or you might choose to just say "Contact Sales" for enterprise
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Enterprise plan requires contact with sales.'
      );
    }
  } else {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Unknown plan. Valid plans: free, pro, enterprise.'
    );
  }

  // 4) Create a Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // example success/cancel URLs (replace with your actual domain/routes)
      success_url: 'https://your-app.com/subscription-success',
      cancel_url: 'https://your-app.com/subscription-cancel',
      // Optional: capture email in checkout if not already known
      customer_email: context.auth.token.email,
      // If you want to store a reference to your user in Stripe, you can do it via metadata or pass `customer`
      // metadata: { firebaseUid: uid },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create checkout session. Please try again later.'
    );
  }
});
