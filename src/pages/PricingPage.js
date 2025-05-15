// src/pages/PricingPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PricingPage.css'; // optional external CSS

const PricingPage = () => {
  // Optional: Toggle between monthly & annual billing
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
  };

  // Example monthly vs annual costs
  const freePrice = '$0';
  const proMonthlyPrice = '$49';
  const proAnnualPrice = '$529';  // e.g. $529/year for a small discount
  const enterprisePrice = 'Contact Us';

  return (
    <div className="pricing-page">
      <header className="pricing-header">
        <h1 className="pricing-title">Choose Your Plan</h1>
        <p className="pricing-subtitle">
          Simple, transparent pricing. No hidden fees—cancel anytime.
        </p>
      </header>

      {/* Billing Toggle (Monthly / Annual) */}
      <div className="billing-toggle">
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
          Annual (Save ~10%)
        </span>
      </div>

      <div className="pricing-table">
        {/* Free Plan */}
        <div className="plan-card">
          <h2>Free</h2>
          <p className="plan-price">{freePrice}/month</p>
          <ul className="plan-features">
            <li>Up to 20 employees</li>
            <li>Email notifications only</li>
            <li>Basic recognition feed</li>
            <li>Community support</li>
          </ul>
          <Link to="/signup?plan=free" className="cta-button">
            Start Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="plan-card plan-popular">
          <div className="plan-popular-ribbon">Most Popular</div>
          <h2>Pro</h2>
          <p className="plan-price">
            {billingCycle === 'monthly' ? proMonthlyPrice : proAnnualPrice}
            {billingCycle === 'annual' ? '/year' : '/month'}
          </p>
          <ul className="plan-features">
            <li>Up to 100 employees</li>
            <li>Slack/Teams integration</li>
            <li>Calendar sync (Google, Outlook)</li>
            <li>Kudos wall & AI message suggestions</li>
            <li>Priority email support</li>
          </ul>
          <Link to="/signup?plan=pro" className="cta-button">
            Go Pro
          </Link>
        </div>

        {/* Enterprise Plan */}
        <div className="plan-card">
          <h2>Enterprise</h2>
          <p className="plan-price">{enterprisePrice}</p>
          <ul className="plan-features">
            <li>Unlimited employees</li>
            <li>Full reward system & analytics</li>
            <li>HR integrations (BambooHR, Workday, etc.)</li>
            <li>Dedicated success manager</li>
            <li>24/7 phone & chat support</li>
          </ul>
          <Link to="/contact-sales" className="cta-button">
            Contact Sales
          </Link>
        </div>
      </div>

      {/* Additional Info / FAQ */}
      <section className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-item">
          <h4>Do you offer a trial period for Pro?</h4>
          <p>
            Yes. When you sign up for Pro, you’ll have a 14-day free trial with 
            full access to Pro features—no credit card required upfront.
          </p>
        </div>
        <div className="faq-item">
          <h4>Can I switch between monthly and annual billing?</h4>
          <p>
            Absolutely. You can update your billing preference at any time in your 
            account settings.
          </p>
        </div>
        <div className="faq-item">
          <h4>What if I need a custom solution?</h4>
          <p>
            Enterprise clients often require custom integrations or security features. 
            <Link to="/contact-sales"> Contact our sales team</Link> to discuss your specific needs.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="pricing-cta">
        <h2>Still Not Sure?</h2>
        <p>
          Book a demo call to see SparkBlaze in action. We’ll tailor a 
          walkthrough to your team’s unique needs.
        </p>
        <Link to="/demo" className="cta-big-button">
          Book a Demo
        </Link>
      </section>
    </div>
  );
};

export default PricingPage;
