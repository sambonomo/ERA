// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// MUI imports
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
} from '@mui/material';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [kudosCount, setKudosCount] = useState(0);
  const [anniversaries, setAnniversaries] = useState([]);

  // Fetch upcoming birthdays (limit 5)
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const qBday = query(employeesRef, orderBy('birthday', 'asc'), limit(5));
    const unsub = onSnapshot(qBday, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingBirthdays(data);
    });
    return () => unsub();
  }, []);

  // Fetch total kudos count
  useEffect(() => {
    const kudosRef = collection(db, 'kudos');
    const unsub = onSnapshot(kudosRef, (snapshot) => {
      setKudosCount(snapshot.size);
    });
    return () => unsub();
  }, []);

  // Fetch upcoming anniversaries (limit 5)
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    const qHire = query(employeesRef, orderBy('hireDate', 'asc'), limit(5));
    const unsub = onSnapshot(qHire, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnniversaries(data);
    });
    return () => unsub();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user ? user.displayName || user.email : 'Guest'}!
        </Typography>
        <Typography variant="body1">
          Here’s what’s happening today at SparkBlaze.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Quick Stats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Total Kudos</Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {kudosCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Birthdays Soon</Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {upcomingBirthdays.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Anniversaries Soon</Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {anniversaries.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Upcoming Birthdays */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Upcoming Birthdays
        </Typography>
        <Grid container spacing={2}>
          {upcomingBirthdays.map((emp) => (
            <Grid item xs={12} sm={6} md={4} key={emp.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{emp.name}</Typography>
                {emp.birthday?.seconds ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {new Date(emp.birthday.seconds * 1000).toLocaleDateString()}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    No birthday info
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
          {upcomingBirthdays.length === 0 && (
            <Grid item xs={12}>
              <Typography>No upcoming birthdays in the next few days.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Work Anniversaries */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Upcoming Anniversaries
        </Typography>
        <Grid container spacing={2}>
          {anniversaries.map((emp) => (
            <Grid item xs={12} sm={6} md={4} key={emp.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{emp.name}</Typography>
                {emp.hireDate?.seconds ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Hire Date:{' '}
                    {new Date(emp.hireDate.seconds * 1000).toLocaleDateString()}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    No hire date info
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
          {anniversaries.length === 0 && (
            <Grid item xs={12}>
              <Typography>No upcoming anniversaries in the next few weeks.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Kudos Feed Placeholder */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent Kudos
        </Typography>
        {/* If you have a <KudosFeed /> component, you can place it here. */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            Embed or display recent kudos here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
