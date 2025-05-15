// src/pages/PricingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      <div className="pricing-table">
        <div className="plan-card">
          <h2>Free</h2>
          <p>$0/month</p>
          <ul>
            <li>Up to 20 employees</li>
            <li>Email notifications only</li>
          </ul>
          <Link to="/signup?plan=free" className="cta-button">Start Free</Link>
        </div>

        <div className="plan-card">
          <h2>Pro</h2>
          <p>$49/month</p>
          <ul>
            <li>Up to 100 employees</li>
            <li>Slack/Teams integration</li>
            <li>Calendar sync</li>
            <li>Kudos wall</li>
          </ul>
          <Link to="/signup?plan=pro" className="cta-button">Go Pro</Link>
        </div>

        <div className="plan-card">
          <h2>Enterprise</h2>
          <p>Contact us</p>
          <ul>
            <li>Unlimited employees</li>
            <li>Reward system & analytics</li>
            <li>HR integrations</li>
          </ul>
          <Link to="/contact-sales" className="cta-button">Contact Sales</Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
