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
  serverTimestamp,
} from 'firebase/firestore';

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
} from '@mui/material';

/**
 * AdminPanel - Central management panel for employees, rewards, 
 * and quick kudos stats. Only accessible to admins.
 */
const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Check if user is admin
  useEffect(() => {
    // Basic check. Adjust to your real logic (e.g., Firestore role field)
    if (user && user.email === 'admin@yourcompany.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch Employees
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  // Fetch Kudos Stats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'kudos'), (snapshot) => {
      setKudosStats({ totalKudos: snapshot.size });
    });
    return () => unsub();
  }, []);

  // Fetch Rewards
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rewards'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(data);
    });
    return () => unsub();
  }, []);

  // Handle new employee form
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

  // Update Employee Department
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

  // Handle new reward form
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

  // Auth checks
  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Please log in to view the Admin Panel.</Typography>
      </Box>
    );
  }
  if (!isAdmin) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Access Denied. You need admin privileges to view this page.</Typography>
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

      {/* Employee Management */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Manage Employees
      </Typography>

      {/* Add New Employee Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Employee
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
            {/* If you want to edit/delete, do so similarly */}
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default AdminPanel;
