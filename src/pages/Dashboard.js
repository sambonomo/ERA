// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [kudosCount, setKudosCount] = useState(0);
  const [anniversaries, setAnniversaries] = useState([]);

  // Example: fetch upcoming birthdays (limiting results)
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, orderBy('birthday', 'asc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingBirthdays(data);
    });
    return () => unsubscribe();
  }, []);

  // Example: fetch kudos count
  useEffect(() => {
    const kudosRef = collection(db, 'kudos');
    const q = query(kudosRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setKudosCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // Example: fetch upcoming anniversaries
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, orderBy('hireDate', 'asc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnniversaries(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard container">
      {/* Header Section */}
      <section className="section" style={{ textAlign: 'center' }}>
        <h1>
          Welcome, {user ? user.displayName || user.email : 'Guest'}!
        </h1>
        <p>Here’s what’s happening today at SparkBlaze.</p>
      </section>

      {/* Stats Section */}
      <section className="section">
        <h2>Quick Stats</h2>
        <div className="card-grid">
          <div className="card stats-card">
            <h3>Total Kudos</h3>
            <p style={{ fontSize: '2rem' }}>{kudosCount}</p>
          </div>
          <div className="card stats-card">
            <h3>Birthdays Soon</h3>
            <p style={{ fontSize: '2rem' }}>{upcomingBirthdays.length}</p>
          </div>
          <div className="card stats-card">
            <h3>Anniversaries Soon</h3>
            <p style={{ fontSize: '2rem' }}>{anniversaries.length}</p>
          </div>
        </div>
      </section>

      {/* Upcoming Birthdays */}
      <section className="section">
        <h2>Upcoming Birthdays</h2>
        <div className="card-grid">
          {upcomingBirthdays.map((emp) => (
            // If you have <BirthdayCard /> replace the card below with it
            <div key={emp.id} className="card birthday-card">
              <h4>{emp.name}</h4>
              {emp.birthday?.seconds ? (
                <p>
                  {new Date(emp.birthday.seconds * 1000).toLocaleDateString()}
                </p>
              ) : (
                <p>No birthday info</p>
              )}
            </div>
          ))}
          {upcomingBirthdays.length === 0 && (
            <p>No upcoming birthdays in the next few days.</p>
          )}
        </div>
      </section>

      {/* Work Anniversaries */}
      <section className="section">
        <h2>Upcoming Anniversaries</h2>
        <div className="card-grid">
          {anniversaries.map((emp) => (
            <div key={emp.id} className="card anniversary-card">
              <h4>{emp.name}</h4>
              {emp.hireDate?.seconds ? (
                <p>
                  Hire Date:{' '}
                  {new Date(emp.hireDate.seconds * 1000).toLocaleDateString()}
                </p>
              ) : (
                <p>No hire date info</p>
              )}
            </div>
          ))}
          {anniversaries.length === 0 && (
            <p>No upcoming anniversaries in the next few weeks.</p>
          )}
        </div>
      </section>

      {/* Kudos Feed */}
      <section className="section">
        <h2>Recent Kudos</h2>
        {/* If you have a <KudosFeed /> component, you can just <KudosFeed /> here */}
        <div className="card">
          <p>Embed or display recent kudos here.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
