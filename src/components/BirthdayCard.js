import React from 'react';

const BirthdayCard = ({ employee }) => {
  return (
    <div className="birthday-card">
      <h3>{employee.name}</h3>
      <p>Department: {employee.department}</p>
      <p>Birthday: {employee.birthday.toDate().toLocaleDateString()}</p>
    </div>
  );
};

export default BirthdayCard;
