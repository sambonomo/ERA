// src/components/NavBar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const NavBar = () => {
  const { user, logOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logOut();
      // Possibly redirect to "/"
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SparkBlaze</Link>
      </div>
      <ul className="navbar-links">
        {!user && (
          <>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
            </li>
            <li>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/rewards">Rewards</Link>
            </li>
            <li>
              <Link to="/subscription">Subscription</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-secondary">
                Log Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
