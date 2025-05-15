// src/pages/AdminPanel.js
import React, { useEffect, useState, useContext } from 'react';
import Papa from 'papaparse'; // for CSV parsing (npm install papaparse)
import { AuthContext } from '../contexts/AuthContext';
import { db, functions } from '../firebase/config';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// Material UI
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
} from '@mui/material';

/**
 * AdminPanel - Central management panel for employees, rewards, 
 * and quick kudos stats. Only accessible to admins.
 * 
 * Features:
 *  1) Invite Employee via inviteEmployee callable function.
 *  2) Bulk CSV import of employees using PapaParse and Firestore writes.
 *  3) Basic create/update/delete for employees and rewards.
 *  4) Quick stats on total employees and kudos.
 */
const AdminPanel = () => {
  const { user, userData, isAdmin } = useContext(AuthContext);

  // For verifying admin. If using userData.role, we can just do: if (!isAdmin()) ...
  const [adminError, setAdminError] = useState('');

  // Example data sets
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: '',
    email: '',
  });
  const [kudosStats, setKudosStats] = useState({ totalKudos: 0 });
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({ name: '', cost: 0 });

  // For invite single employee
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteResult, setInviteResult] = useState('');

  // For CSV import
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  // 1) Check if user is admin
  // If you're storing role in userData, you can do: isAdmin() from context
  // or do a custom check below. We'll rely on isAdmin() here.
  useEffect(() => {
    if (!user) {
      setAdminError('Please log in to view the Admin Panel.');
      return;
    }
    if (!isAdmin()) {
      setAdminError('Access Denied. You need admin privileges to view this page.');
    }
  }, [user, isAdmin]);

  // 2) Real-time subscribe to employees
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  // 3) Kudos stats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'kudos'), (snapshot) => {
      setKudosStats({ totalKudos: snapshot.size });
    });
    return () => unsub();
  }, []);

  // 4) Rewards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRewards(data);
    });
    return () => unsub();
  }, []);

  // Add new employee doc directly (not using invite flow)
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

  // Update department for an existing employee
  const handleUpdateDepartment = async (employeeId, department) => {
    try {
      const ref = doc(db, 'employees', employeeId);
      await updateDoc(ref, { department });
    } catch (err) {
      console.error('Error updating department:', err);
    }
  };

  // Delete an employee doc
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  // Add a new reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'rewards'), {
        ...newReward,
        cost: Number(newReward.cost),
        createdAt: serverTimestamp(),
      });
      setNewReward({ name: '', cost: 0 });
    } catch (err) {
      console.error('Error adding reward:', err);
    }
  };

  // 5) Invite single employee with name/email via the 'inviteEmployee' callable function
  const handleInviteEmployee = async () => {
    setInviteResult('');
    const inviteFn = httpsCallable(functions, 'inviteEmployee');
    try {
      const res = await inviteFn({ email: inviteEmail, name: inviteName });
      // res.data.result or link
      setInviteResult(`Success! Invitation sent to ${inviteEmail}`);
      // Reset fields
      setInviteEmail('');
      setInviteName('');
    } catch (err) {
      console.error('inviteEmployee error', err);
      setInviteResult(err.message || 'Error inviting employee.');
    }
  };

  // 6) CSV Import
  const handleCsvUpload = (file) => {
    setCsvError('');
    setCsvSuccess('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // results.data is an array of objects
        const rows = results.data;
        if (!rows.length) {
          setCsvError('CSV has no rows.');
          return;
        }
        // Validate required columns
        for (const row of rows) {
          if (!row.name || !row.email) {
            setCsvError('Each row must have at least "name" and "email" columns.');
            return;
          }
        }

        try {
          // Create a batch to write employees
          const batch = writeBatch(db);
          rows.forEach((r) => {
            const docRef = doc(collection(db, 'employees')); // auto ID
            batch.set(docRef, {
              name: r.name,
              department: r.department || '',
              email: r.email,
              createdAt: serverTimestamp(),
            });
          });
          await batch.commit();
          setCsvSuccess(`Imported ${rows.length} employees successfully!`);
        } catch (err) {
          console.error('Batch CSV import error:', err);
          setCsvError(`Import failed: ${err.message}`);
        }
      },
      error: (err) => {
        console.error('PapaParse error:', err);
        setCsvError(err.message);
      },
    });
  };

  // 7) If not admin or not logged in, show a message
  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{adminError || 'Please log in to view the Admin Panel.'}</Typography>
      </Box>
    );
  }
  if (!isAdmin()) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>
          {adminError || 'Access Denied. You need admin privileges to view this page.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Welcome, {user.email}. Manage employees, rewards, and see kudos stats here.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Employees</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {employees.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Kudos</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {kudosStats.totalKudos}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Invite Single Employee */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Invite Employee
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
          <TextField
            label="Employee Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <TextField
            label="Employee Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button variant="contained" onClick={handleInviteEmployee} sx={{ alignSelf: 'center' }}>
            Invite
          </Button>
        </Box>
        {inviteResult && <Alert severity="info">{inviteResult}</Alert>}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Bulk CSV Import */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Import Employees via CSV
        </Typography>
        <Button
          variant="outlined"
          component="label"
        >
          Select CSV File
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCsvUpload(e.target.files[0]);
              }
            }}
          />
        </Button>
        {csvError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {csvError}
          </Alert>
        )}
        {csvSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {csvSuccess}
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Employee Management */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Manage Employees
      </Typography>

      {/* Add New Employee Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add Employee (Direct, No Invite)
        </Typography>
        <Box
          component="form"
          onSubmit={handleAddEmployee}
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
        >
          <TextField
            label="Name"
            variant="outlined"
            required
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Department"
            variant="outlined"
            required
            value={newEmployee.department}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, department: e.target.value })
            }
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            required
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            sx={{ minWidth: 220 }}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }}>
            Add Employee
          </Button>
        </Box>
      </Paper>

      {/* Existing Employees List */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Employees
        </Typography>
        {employees.map((emp) => (
          <Box
            key={emp.id}
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid #eee',
              borderRadius: 2,
            }}
          >
            <Typography>
              <strong>{emp.name}</strong> ({emp.department})
            </Typography>
            <Typography variant="body2">{emp.email}</Typography>

            <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl variant="outlined" size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={emp.department}
                  onChange={(e) => handleUpdateDepartment(emp.id, e.target.value)}
                  sx={{ width: 150 }}
                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteEmployee(emp.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Rewards Management */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Manage Rewards
      </Typography>

      {/* Add New Reward */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add Reward
        </Typography>
        <Box
          component="form"
          onSubmit={handleAddReward}
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
        >
          <TextField
            label="Reward Name"
            variant="outlined"
            required
            value={newReward.name}
            onChange={(e) =>
              setNewReward({ ...newReward, name: e.target.value })
            }
            sx={{ minWidth: 220 }}
          />
          <TextField
            label="Cost in points"
            variant="outlined"
            type="number"
            required
            value={newReward.cost}
            onChange={(e) =>
              setNewReward({ ...newReward, cost: e.target.value })
            }
            sx={{ width: 150 }}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }}>
            Add Reward
          </Button>
        </Box>
      </Paper>

      {/* Rewards List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Rewards
        </Typography>
        {rewards.map((rwd) => (
          <Box
            key={rwd.id}
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid #eee',
              borderRadius: 2,
            }}
          >
            <Typography>
              <strong>{rwd.name}</strong> — {rwd.cost} pts
            </Typography>
            {/* If you want to allow editing or deleting a reward, you'd do so similarly here */}
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default AdminPanel;
