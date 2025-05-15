// src/pages/SubscriptionPage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, functions } from '../firebase/config'; // <-- Import here
import { useStripe } from '@stripe/react-stripe-js';

const SubscriptionPage = () => {
  const { user } = useContext(AuthContext);
  const stripe = useStripe();

  const [currentPlan, setCurrentPlan] = useState('free'); // default
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Real-time subscription status from Firestore
  useEffect(() => {
    if (!user) return;

    // Since we imported 'db', it is now defined
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plan) {
          setCurrentPlan(data.plan);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Toggle billing cycle
  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  // Create a Stripe Checkout session via our Cloud Function
  const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

  const handleSubscribe = async (plan) => {
    if (!user) {
      setMessage('Please log in to subscribe.');
      return;
    }
    if (!stripe) {
      setMessage('Stripe has not loaded yet. Please try again in a moment.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data } = await createCheckoutSession({ plan, billingCycle });
      // data.sessionId is your Stripe checkout session
      const { sessionId } = data;

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        setMessage(result.error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="subscription-page">
        <h2>Subscription</h2>
        <p>You must be logged in to manage subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <h1>Manage Your Subscription</h1>
      <p>Your current plan: <strong>{currentPlan}</strong></p>

      {message && <p className="subscription-message">{message}</p>}

      {/* If user is already on Pro or Enterprise, you might show them a cancel/downgrade option */}
      {currentPlan !== 'pro' && currentPlan !== 'enterprise' && (
        <div className="subscription-billing-toggle">
          <span className={billingCycle === 'monthly' ? 'toggle-active' : ''}>
            Monthly
          </span>
          <label className="switch">
            <input
              type="checkbox"
              onChange={handleToggle}
              checked={billingCycle === 'annual'}
            />
            <span className="slider"></span>
          </label>
          <span className={billingCycle === 'annual' ? 'toggle-active' : ''}>
            Annual (Save 10%)
          </span>
        </div>
      )}

      <div className="subscription-plans">
        {/* FREE plan */}
        <div className="plan-card">
          <h2>Free</h2>
          <p>$0 / month</p>
          <ul>
            <li>Up to 20 employees</li>
            <li>Email notifications only</li>
          </ul>
          {currentPlan === 'free' ? (
            <button disabled>Current Plan</button>
          ) : (
            <button onClick={() => handleSubscribe('free')} disabled={loading}>
              Downgrade to Free
            </button>
          )}
        </div>

        {/* PRO plan */}
        {currentPlan !== 'enterprise' && (
          <div className="plan-card">
            <h2>Pro</h2>
            <p>
              {billingCycle === 'monthly'
                ? '$49 / month'
                : '$529 / year' /* 10% off for annual */}
            </p>
            <ul>
              <li>Up to 100 employees</li>
              <li>Slack/Teams integration</li>
              <li>Calendar sync, kudos wall, AI messages</li>
            </ul>
            {currentPlan === 'pro' ? (
              <button disabled>Current Plan</button>
            ) : (
              <button onClick={() => handleSubscribe('pro')} disabled={loading}>
                {currentPlan === 'free' ? 'Upgrade to Pro' : 'Switch to Pro'}
              </button>
            )}
          </div>
        )}

        {/* ENTERPRISE plan */}
        <div className="plan-card">
          <h2>Enterprise</h2>
          <p>Contact us</p>
          <ul>
            <li>Unlimited employees</li>
            <li>Full reward system & analytics</li>
            <li>HR integrations, 24/7 support</li>
          </ul>
          {currentPlan === 'enterprise' ? (
            <button disabled>Current Plan</button>
          ) : (
            <button onClick={() => handleSubscribe('enterprise')} disabled={loading}>
              {currentPlan === 'free' || currentPlan === 'pro'
                ? 'Upgrade to Enterprise'
                : 'Contact Sales'
              }
            </button>
          )}
        </div>
      </div>

      {/* Cancel or Downgrade if user is on Pro/Enterprise */}
      {(currentPlan === 'pro' || currentPlan === 'enterprise') && (
        <div className="cancel-subscription">
          <h3>Need to cancel?</h3>
          <button disabled={loading} onClick={() => handleSubscribe('free')}>
            Cancel Subscription / Downgrade to Free
          </button>
          <p>Note: You will immediately lose Pro/Enterprise features upon cancellation.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
