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

const EmployeeForm = ({ employeeId, onSuccess }) => {
  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');  // storing as a string (YYYY-MM-DD) for simplicity
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
          // If data.birthday is a Timestamp, convert to YYYY-MM-DD
          if (data.birthday && data.birthday.toDate) {
            const bDate = data.birthday.toDate();
            setBirthday(bDate.toISOString().split('T')[0]); 
          }
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
      // Convert YYYY-MM-DD to Firestore Timestamps if you want, or store as a plain date string
      let birthdayObj = null;
      let hireDateObj = null;
      if (birthday) {
        birthdayObj = new Date(birthday + 'T00:00:00');
      }
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
        ...(birthday && { birthday: birthdayObj }), 
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
      setBirthday('');
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

        <div>
          <label>Birthday:</label>
          <input 
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>

        <div>
          <label>Hire Date:</label>
          <input 
            type="date"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : employeeId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
