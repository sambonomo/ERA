// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="hero-section">
        <h1>Build a Culture of Recognition</h1>
        <p>Celebrate birthdays, anniversaries, and achievements in one platform.</p>
        <Link to="/pricing" className="cta-button">See Pricing</Link>
      </header>

      <section className="features-overview">
        <h2>Features at a Glance</h2>
        <div className="feature">
          <h3>Birthday Reminders</h3>
          <p>Automated greetings and celebrations to keep morale high.</p>
        </div>
        <div className="feature">
          <h3>Anniversary Milestones</h3>
          <p>Celebrate work anniversaries with Slack, Teams, or email notifications.</p>
        </div>
        <div className="feature">
          <h3>Kudos Wall</h3>
          <p>A real-time feed for peer-to-peer recognition, likes &amp; comments.</p>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <blockquote>
          “This platform completely transformed our company culture!”
        </blockquote>
        <p>– Lisa from TechCo</p>
      </section>

      <footer>
        <p>© 2025 SparkBlaze Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
