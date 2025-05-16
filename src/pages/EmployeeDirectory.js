import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Components
import EmployeeProfile from '../components/EmployeeProfile';

// MUI imports
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  Chip,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const EmployeeDirectory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fetch all employees
  useEffect(() => {
    const employeesRef = collection(db, 'employees');
    
    const unsub = onSnapshot(
      employeesRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
        setLoading(false);
      }
    );
    
    return () => unsub();
  }, []);

  // Extract unique departments for filter
  const departments = ['all', ...new Set(employees.filter(emp => emp.department).map(emp => emp.department))];

  // Filter employees based on search term and department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle view employee profile
  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setProfileOpen(true);
  };

  // Handle recognize employee
  const handleRecognize = (employee) => {
    // Navigate to the dashboard with a pre-selected employee for recognition
    navigate('/dashboard', { state: { recognizeEmployee: employee } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header and Search */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Employee Directory
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse and search for colleagues to view their profiles or send recognition.
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Button 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Chip 
          label={`${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? 's' : ''} found`} 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No employees found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} sm={6} md={4} key={employee.id}>
              <Card 
                className="hover-lift" 
                sx={{ 
                  borderRadius: 'var(--border-radius-lg)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'var(--color-primary)',
                      fontSize: '1.75rem'
                    }}
                  >
                    {getInitials(employee.name)}
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {employee.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {employee.department || 'No Department'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {employee.email}
                  </Typography>
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  {employee.points > 0 && (
                    <Chip 
                      label={`${employee.points} points`} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'var(--color-accent-light)', 
                        color: 'var(--color-accent-dark)',
                        fontWeight: 'bold',
                        mb: 2
                      }} 
                    />
                  )}
                </Box>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1, flexGrow: 1 }}
                    onClick={() => handleViewProfile(employee)}
                  >
                    View Profile
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ flexGrow: 1 }}
                    onClick={() => handleRecognize(employee)}
                  >
                    Recognize
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Employee Profile Dialog */}
      <Dialog 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <Box sx={{ position: 'relative' }}>
          <Button 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              zIndex: 1,
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)'
              }
            }}
            onClick={() => setProfileOpen(false)}
          >
            <CloseIcon />
          </Button>
          
          <Box sx={{ p: 3 }}>
            {selectedEmployee && (
              <EmployeeProfile 
                employeeId={selectedEmployee.id}
                onRecognize={() => {
                  setProfileOpen(false);
                  handleRecognize(selectedEmployee);
                }}
              />
            )}
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default EmployeeDirectory; 