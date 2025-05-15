// src/components/BirthdayCard.js
import React from 'react';

const BirthdayCard = ({ employee, showDepartment = true }) => {
  // Safely extract fields
  const { name, department, birthday } = employee;

  // Check if birthday is a Firestore Timestamp or a regular JS date/string
  let birthdayDate = null;
  if (birthday && birthday.toDate) {
    // If Firestore Timestamp
    birthdayDate = birthday.toDate();
  } else if (birthday instanceof Date) {
    // If plain JS date
    birthdayDate = birthday;
  } else if (typeof birthday === 'string') {
    // If stored as a string (YYYY-MM-DD)
    birthdayDate = new Date(birthday + 'T00:00:00');
  }

  // Format date
  const formattedDate = birthdayDate
    ? birthdayDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : 'No birthday available';

  return (
    <div className="birthday-card" style={styles.cardContainer}>
      <div style={styles.infoContainer}>
        <div style={styles.header}>
          <span role="img" aria-label="birthday-cake" style={styles.cakeEmoji}>
            🎂
          </span>
          <h3 style={styles.name}>{name}</h3>
        </div>

        {showDepartment && department && (
          <p style={styles.department}>
            <strong>Dept:</strong> {department}
          </p>
        )}

        <p style={styles.date}>
          <strong>Birthday:</strong> {formattedDate}
        </p>
      </div>
    </div>
  );
};

// Example inline styles (you can move to BirthdayCard.css)
const styles = {
  cardContainer: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  cakeEmoji: {
    fontSize: '1.5rem',
    marginRight: '0.5rem',
  },
  name: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#ff6b6b', // example brand color
  },
  department: {
    margin: '0.25rem 0',
    color: '#555',
  },
  date: {
    margin: '0.25rem 0',
    color: '#333',
  },
};

export default BirthdayCard;
