// src/components/EmployeeForm.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// If you want to parse JS dates, you could also install date-fns or moment.

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const EmployeeForm = ({ employeeId, onSuccess }) => {
  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('');
  const [hireDate, setHireDate] = useState('');  // same approach

  // Loading / error / success states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1) If editing an existing employee, fetch data
  useEffect(() => {
    if (!employeeId) return; // If no ID, we're in "create" mode
    setLoading(true);

    const docRef = doc(db, 'employees', employeeId);
    getDoc(docRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setName(data.name || '');
          setDepartment(data.department || '');
          setLocation(data.location || '');
          setEmail(data.email || '');
          if (data.birthdayMonth) setBirthdayMonth(data.birthdayMonth);
          if (data.birthdayDay) setBirthdayDay(data.birthdayDay);
          if (data.hireDate && data.hireDate.toDate) {
            const hDate = data.hireDate.toDate();
            setHireDate(hDate.toISOString().split('T')[0]); 
          }
        } else {
          setError('Employee not found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching employee:', err);
        setError('Failed to load employee data.');
        setLoading(false);
      });
  }, [employeeId]);

  // 2) Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let hireDateObj = null;
      if (hireDate) {
        hireDateObj = new Date(hireDate + 'T00:00:00');
      }

      // Build employee object
      const employeeData = {
        name,
        department,
        location,
        email,
        updatedAt: serverTimestamp(),
        ...(birthdayMonth && { birthdayMonth }),
        ...(birthdayDay && { birthdayDay }),
        ...(hireDate && { hireDate: hireDateObj }),
      };

      // If editing an existing employee
      if (employeeId) {
        await setDoc(doc(db, 'employees', employeeId), employeeData, { merge: true });
        setSuccessMsg('Employee updated successfully!');
      } else {
        // If creating a new employee
        const newData = {
          ...employeeData,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'employees'), newData);
        setSuccessMsg('Employee added successfully!');
      }

      if (onSuccess) {
        onSuccess(); // optional callback if parent wants to refresh or close modal
      }

      // Clear form
      setName('');
      setDepartment('');
      setLocation('');
      setEmail('');
      setBirthdayMonth('');
      setBirthdayDay('');
      setHireDate('');
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Failed to save employee data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !employeeId) {
    // Show loading only if we're actively fetching data for edit mode
    return <p>Loading...</p>;
  }

  return (
    <div className="employee-form">
      <h2>{employeeId ? 'Edit Employee' : 'Add Employee'}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Department:</label>
          <input 
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div>
          <label>Location:</label>
          <input 
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Birthday Section */}
        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <strong>Birthday (Month and Day):</strong>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>Month:</label>
          <select value={birthdayMonth} onChange={e => setBirthdayMonth(e.target.value)} required>
            <option value="">Month</option>
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <label>Day:</label>
          <select value={birthdayDay} onChange={e => setBirthdayDay(e.target.value)} required>
            <option value="">Day</option>
            {days.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Service Anniversary Section */}
        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <strong>Service Anniversary (Date):</strong>
        </div>
        <div>
          <input 
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '2rem' }}>
          {loading ? 'Saving...' : employeeId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
