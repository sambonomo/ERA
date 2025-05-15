// src/pages/AdminPanel.js
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Example data sets
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', email: '' });
  const [kudosStats, setKudosStats] = useState({ totalKudos: 0 });
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({ name: '', cost: 0 });

  // Check if the current user is admin (adjust logic as needed)
  useEffect(() => {
    // For example, you might store an 'admin' field in a users collection:
    // db.collection('users').doc(user.uid).get().then(doc => setIsAdmin(doc.data().admin));
    // Or maybe in the AuthContext itself
    // For now, we'll simulate with a simple condition:
    if (user && user.email === 'admin@yourcompany.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch Employees
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  // Fetch Kudos Stats (for example, total kudos or advanced analytics)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'kudos'), (snapshot) => {
      // Example: just total count
      setKudosStats({ totalKudos: snapshot.size });
    });
    return () => unsub();
  }, []);

  // Fetch Rewards (if you have a reward store)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRewards(data);
    });
    return () => unsub();
  }, []);

  // Handle New Employee Form Submit
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'employees'), {
        ...newEmployee,
        createdAt: serverTimestamp(),
      });
      setNewEmployee({ name: '', department: '', email: '' });
    } catch (err) {
      console.error('Error adding new employee:', err);
    }
  };

  // Update Employee Department (example)
  const handleUpdateDepartment = async (employeeId, department) => {
    try {
      const ref = doc(db, 'employees', employeeId);
      await updateDoc(ref, { department });
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  // Handle New Reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'rewards'), {
        ...newReward,
        cost: Number(newReward.cost), // ensure numeric
        createdAt: serverTimestamp(),
      });
      setNewReward({ name: '', cost: 0 });
    } catch (err) {
      console.error('Error adding reward:', err);
    }
  };

  if (!user) {
    return <p>Please log in to view the Admin Panel.</p>;
  }

  if (!isAdmin) {
    return <p>Access Denied. You need admin privileges to view this page.</p>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <p>Welcome, {user.email}. Manage employees, rewards, and see kudos stats here.</p>

      {/* Quick Stats */}
      <section className="admin-stats">
        <div className="stats-card">
          <h3>Total Employees</h3>
          <p>{employees.length}</p>
        </div>
        <div className="stats-card">
          <h3>Total Kudos</h3>
          <p>{kudosStats.totalKudos}</p>
        </div>
      </section>

      {/* Employee Management */}
      <section className="admin-employees">
        <h2>Manage Employees</h2>

        {/* Add New Employee */}
        <form className="add-employee-form" onSubmit={handleAddEmployee}>
          <h4>Add New Employee</h4>
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            required
          />
          <button type="submit">Add Employee</button>
        </form>

        {/* Existing Employees List */}
        <div className="employee-list">
          <h4>Current Employees</h4>
          {employees.map((emp) => (
            <div key={emp.id} className="employee-item">
              <p><strong>{emp.name}</strong> ({emp.department})</p>
              <p>{emp.email}</p>
              <div className="employee-actions">
                <select
                  value={emp.department}
                  onChange={(e) => handleUpdateDepartment(emp.id, e.target.value)}
                >
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Engineering">Engineering</option>
                </select>
                <button onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards Management */}
      <section className="admin-rewards">
        <h2>Manage Rewards</h2>

        {/* Add New Reward */}
        <form className="add-reward-form" onSubmit={handleAddReward}>
          <h4>Add Reward</h4>
          <input
            type="text"
            placeholder="Reward Name"
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Cost in points"
            value={newReward.cost}
            onChange={(e) => setNewReward({ ...newReward, cost: e.target.value })}
            required
          />
          <button type="submit">Add Reward</button>
        </form>

        {/* Rewards List */}
        <div className="rewards-list">
          <h4>Available Rewards</h4>
          {rewards.map((rwd) => (
            <div key={rwd.id} className="reward-item">
              <p><strong>{rwd.name}</strong> - {rwd.cost} pts</p>
              {/* If you want to edit or delete a reward, do so similarly with updateDoc/deleteDoc */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
