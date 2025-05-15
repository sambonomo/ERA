// src/pages/SubscriptionPage.js
import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const SubscriptionPage = ({ plan }) => {
  const stripe = useStripe();

  const handleCheckout = async () => {
    const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
    const { data } = await createCheckoutSession({ plan });
    // data.sessionId is your Stripe Checkout session
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <button onClick={handleCheckout}>
      Subscribe to {plan === 'pro' ? 'Pro' : 'Enterprise'}
    </button>
  );
};

export default SubscriptionPage;
