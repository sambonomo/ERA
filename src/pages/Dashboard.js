// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Example components you might already have:
// import BirthdayCard from '../components/BirthdayCard';
// import KudosFeed from '../components/KudosFeed';

const Dashboard = () => {
  const { user } = useContext(AuthContext); 
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [kudosCount, setKudosCount] = useState(0);
  const [anniversaries, setAnniversaries] = useState([]);

  // Optional: Fetch upcoming birthdays
  useEffect(() => {
    // Example approach: if you store birthdays as full timestamps in an "employees" collection,
    // you can filter employees whose birthday is in the next X days. 
    // For demonstration, we’ll just limit the results.
    const today = new Date();
    const employeesRef = collection(db, 'employees');
    const q = query(
      employeesRef,
      orderBy('birthday', 'asc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bdayData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingBirthdays(bdayData);
    });
    return () => unsubscribe();
  }, []);

  // Optional: Fetch total kudos or recent kudos
  useEffect(() => {
    const kudosRef = collection(db, 'kudos');
    const q = query(kudosRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // If you just want the total count:
      setKudosCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // Optional: Fetch upcoming anniversaries
  useEffect(() => {
    // Similar approach for employees with hireDate approaching
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, orderBy('hireDate', 'asc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const annData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnniversaries(annData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Dashboard Header / Welcome Section */}
      <header className="dashboard-header">
        <h1>Welcome, {user ? user.displayName || user.email : 'Guest'}!</h1>
        <p>Here’s what’s happening today at SparkBlaze.</p>
      </header>

      {/* Statistics / Quick Info Cards */}
      <section className="dashboard-stats">
        <div className="stats-card">
          <h3>Total Kudos</h3>
          <p>{kudosCount}</p>
        </div>
        <div className="stats-card">
          <h3>Birthdays Soon</h3>
          <p>{upcomingBirthdays.length}</p>
        </div>
        <div className="stats-card">
          <h3>Anniversaries Soon</h3>
          <p>{anniversaries.length}</p>
        </div>
      </section>

      {/* Upcoming Birthdays */}
      <section className="dashboard-section birthdays-section">
        <h2>Upcoming Birthdays</h2>
        <div className="birthdays-list">
          {upcomingBirthdays.map((emp) => (
            // If you have a BirthdayCard component, use it:
            // <BirthdayCard key={emp.id} employee={emp} />
            // Or just inline:
            <div key={emp.id} className="birthday-item">
              <h4>{emp.name}</h4>
              <p>{new Date(emp.birthday.seconds * 1000).toLocaleDateString()}</p>
            </div>
          ))}
          {upcomingBirthdays.length === 0 && (
            <p>No upcoming birthdays in the next few days.</p>
          )}
        </div>
      </section>

      {/* Work Anniversaries */}
      <section className="dashboard-section anniversaries-section">
        <h2>Upcoming Anniversaries</h2>
        <div className="anniversaries-list">
          {anniversaries.map((emp) => (
            <div key={emp.id} className="anniversary-item">
              <h4>{emp.name}</h4>
              <p>Hire Date: {new Date(emp.hireDate.seconds * 1000).toLocaleDateString()}</p>
            </div>
          ))}
          {anniversaries.length === 0 && (
            <p>No upcoming anniversaries in the next few weeks.</p>
          )}
        </div>
      </section>

      {/* Kudos Feed */}
      <section className="dashboard-section kudos-section">
        <h2>Recent Kudos</h2>
        {/* If you already have a KudosFeed component, you can import and use it here: */}
        {/* <KudosFeed /> */}
        <p>
          {/* If you prefer a simple inline list: */}
          Here you might embed a KudosFeed component or a quick list of recent kudos.
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
