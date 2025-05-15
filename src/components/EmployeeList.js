// src/components/EmployeeList.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1) Set up a real-time subscription to 'employees' collection
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, orderBy('name', 'asc')); // or orderBy('createdAt')

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const empData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(empData);
        setFilteredEmployees(empData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2) Filter employees by search term (name/department)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = employees.filter((emp) => {
        const nameMatch = emp.name?.toLowerCase().includes(lowerTerm);
        const deptMatch = emp.department?.toLowerCase().includes(lowerTerm);
        const locMatch = emp.location?.toLowerCase().includes(lowerTerm);
        return nameMatch || deptMatch || locMatch;
      });
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // 3) Optional: Delete employee
  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteDoc(doc(db, 'employees', empId));
      console.log('Employee deleted:', empId);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    }
  };

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="employee-list">
      <h2>Employee Directory</h2>

      {/* Search / Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name, dept, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Department</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{emp.name}</td>
                <td style={{ padding: '0.5rem' }}>{emp.department}</td>
                <td style={{ padding: '0.5rem' }}>{emp.location}</td>
                <td style={{ padding: '0.5rem' }}>
                  {/* Example: delete employee */}
                  <button onClick={() => handleDelete(emp.id)}>Delete</button>
                  {/* Or link to an edit page: 
                    <Link to={`/employees/${emp.id}/edit`}>Edit</Link> 
                  */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
