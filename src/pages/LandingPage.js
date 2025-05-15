// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">SparkBlaze</div>
        <ul className="nav-links">
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/demo">Book a Demo</Link></li>
          <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Revolutionize Employee Recognition</h1>
          <p className="hero-subtitle">
            SparkBlaze is the <strong>best-in-class</strong> platform for celebrating birthdays,
            work anniversaries, and peer recognition—all from a single hub.
          </p>
          <p className="hero-subtitle-secondary">
            Unleash a culture of appreciation with AI-powered messages,
            automated reminders, and real-time kudos feeds.
          </p>
          <div className="hero-cta-buttons">
            <Link to="/signup" className="cta-primary">Get Started for Free</Link>
            <Link to="/pricing" className="cta-secondary">View Pricing</Link>
          </div>
          <div className="hero-extra-button">
            <Link to="/how-it-works" className="cta-tertiary">See How It Works</Link>
          </div>
        </div>
        {/* Optional hero image or illustration */}
        <div className="hero-image">
          {/* <img src="/assets/hero-illustration.png" alt="Employee recognition illustration" /> */}
        </div>
      </header>

      {/* Core Features Overview */}
      <section className="features-overview">
        <h2>Why SparkBlaze?</h2>
        <p className="section-description">
          Our mission is to ignite employee happiness by blending automated milestones
          with a real-time recognition feed. Track birthdays, service anniversaries,
          kudos, and more—effortlessly.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Automated Birthday Reminders</h3>
            <p>
              Never miss a birthday again. SparkBlaze sends Slack, Teams, or email 
              notifications so everyone can celebrate together.
            </p>
          </div>
          <div className="feature-card">
            <h3>Service Anniversaries</h3>
            <p>
              Recognize milestones like 1-year, 5-year, or 10-year anniversaries with 
              heartfelt messages. SparkBlaze keeps track automatically.
            </p>
          </div>
          <div className="feature-card">
            <h3>Peer-to-Peer Kudos</h3>
            <p>
              Foster a culture of collaboration and appreciation. Public shoutouts, badges, 
              and comments light up your Kudos Wall—instantly.
            </p>
          </div>
          <div className="feature-card">
            <h3>AI-Powered Suggestions</h3>
            <p>
              Unsure what to say? Let SparkBlaze craft a thoughtful note or 
              congratulations message—personalize and send with one click.
            </p>
          </div>
          <div className="feature-card">
            <h3>Reward Marketplace</h3>
            <p>
              Offer points for each kudos received and redeem them for gift cards, company 
              swag, or charitable donations (Pro & Enterprise tiers).
            </p>
          </div>
          <div className="feature-card">
            <h3>Advanced Analytics</h3>
            <p>
              Monitor morale and engagement with real-time dashboards. Identify top 
              contributors, highlight achievements, and spot burnout early.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations / Advanced Section */}
      <section className="integrations-section">
        <h2>Seamless Integrations</h2>
        <p>
          Stay in the flow of work with built-in Slack, Microsoft Teams, and Google Calendar sync.
          Export data to your existing HR tools or intranet with ease.
        </p>
        <div className="integration-logos">
          {/* Example placeholders for logos */}
          <img src="/assets/slack-logo.png" alt="Slack" />
          <img src="/assets/teams-logo.png" alt="Teams" />
          <img src="/assets/google-calendar-logo.png" alt="Google Calendar" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <blockquote className="testimonial-item">
            “SparkBlaze completely transformed our company culture! Everyone loves
            seeing birthdays and kudos in real time—and it’s a breeze to set up.”
            <cite>– Lisa, HR Manager at TechCo</cite>
          </blockquote>
          <blockquote className="testimonial-item">
            “In just a few months, morale went through the roof. Our employees feel 
            recognized and appreciated every day.”
            <cite>– Mark, CEO of InnovateCorp</cite>
          </blockquote>
          <blockquote className="testimonial-item">
            “The AI-powered message suggestions saved me so much time. I can send 
            thoughtful notes without worrying about writer’s block!”
            <cite>– Ashley, Team Lead at GrowthSpark</cite>
          </blockquote>
        </div>
      </section>

      {/* FAQ / Additional Info (Optional) */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h4>How easy is it to set up SparkBlaze?</h4>
          <p>
            Incredibly easy! You can have your entire organization onboarded within minutes.
            No special IT knowledge required.
          </p>
        </div>
        <div className="faq-item">
          <h4>Do you offer a free plan?</h4>
          <p>
            Yes! Our Free tier accommodates up to 20 employees with email notifications only.
            Upgrade anytime for advanced features.
          </p>
        </div>
        <div className="faq-item">
          <h4>What if I need customized integrations?</h4>
          <p>
            Our Enterprise plan supports custom integrations and VIP support.
            <Link to="/contact"> Contact us</Link> for more info.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Spark Engagement?</h2>
        <p>
          Get started in under 5 minutes—no complex setup, no hassle. 
          Join SparkBlaze today and let the recognition begin!
        </p>
        <Link to="/signup" className="cta-big-button">Sign Up Now</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-links">
          <Link to="/pricing">Pricing</Link>
          <Link to="/features">Features</Link>
          <Link to="/demo">Book a Demo</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} SparkBlaze Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
