import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

// MUI imports
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import CelebrationIcon from '@mui/icons-material/Celebration';
import BarChartIcon from '@mui/icons-material/BarChart';

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

/**
 * AdminPortal - A component providing admin functionality
 * Only shown to users with the 'admin' role
 */
const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalKudos: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });
  const [systemSettings, setSystemSettings] = useState({
    kudosLimit: 3,
    allowPublicSignup: true,
    requireApproval: false,
    maintenanceMode: false
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setUsers(usersData);
        setStats(prev => ({ ...prev, totalUsers: usersData.length }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch kudos count
        const kudosRef = collection(db, 'kudos');
        const kudosSnapshot = await getDocs(kudosRef);
        const kudosCount = kudosSnapshot.size;
        
        // For the demo, we'll set some sample data
        // In a real app, you would calculate these values from actual data
        setStats({
          totalUsers: users.length,
          totalKudos: kudosCount,
          activeUsers: Math.floor(users.length * 0.8), // 80% of users are "active"
          pendingApprovals: 2 // Sample value
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    if (!loading && users.length > 0) {
      fetchStats();
    }
  }, [loading, users]);

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'system');
        const settingsSnapshot = await getDoc(settingsRef);
        
        if (settingsSnapshot.exists()) {
          setSystemSettings(settingsSnapshot.data());
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Save settings
  const saveSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'system');
      await updateDoc(settingsRef, systemSettings);
      
      // Show success message (would be implemented with a snackbar or alert)
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Stats data for the admin dashboard
  const adminStats = [
    { 
      value: stats.totalUsers, 
      label: 'Total Users', 
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-primary)' 
    },
    { 
      value: stats.totalKudos, 
      label: 'Total Kudos', 
      icon: <CelebrationIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-secondary)' 
    },
    { 
      value: stats.activeUsers, 
      label: 'Active Users', 
      icon: <BadgeIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-accent)' 
    },
    { 
      value: stats.pendingApprovals, 
      label: 'Pending Approvals', 
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />,
      color: 'var(--gradient-celebration)' 
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MotionPaper
        sx={{ 
          p: 4,
          borderRadius: 'var(--border-radius-lg)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-secondary-dark) 100%)',
            zIndex: 1
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              color: 'var(--color-primary-dark)', 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AdminPanelSettingsIcon fontSize="large" /> 
            Admin Portal
          </Typography>

          {/* Admin Stats */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {adminStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  >
                    <Box
                      className="stats-card card-common"
                      sx={{
                        background: stat.color,
                        height: 180
                      }}
                    >
                      <Box
                        className="stats-icon"
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h2"
                        className="stats-value"
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="h6"
                        className="stats-label"
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Admin Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'var(--color-primary)',
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: 'var(--color-primary)',
                }
              }
            }}
          >
            <Tab icon={<PersonIcon />} label="User Management" iconPosition="start" />
            <Tab icon={<AnalyticsIcon />} label="Analytics" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="System Settings" iconPosition="start" />
          </Tabs>

          {/* User Management */}
          {activeTab === 0 && (
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                User Management
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Search Users" 
                    variant="outlined" 
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'var(--color-primary-light)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--color-primary)',
                          boxShadow: '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)'
                        },
                        borderRadius: 'var(--border-radius-md)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                      label="Filter by Role"
                      defaultValue="all"
                      sx={{
                        '&.MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'var(--color-primary-light)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-primary)',
                          },
                          borderRadius: 'var(--border-radius-md)'
                        }
                      }}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box 
                sx={{ 
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  bgcolor: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  mb: 3 
                }}
              >
                {users.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: user.role === 'admin' ? 'var(--color-primary-dark)' : 'var(--color-primary)',
                            width: 40,
                            height: 40,
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {getInitials(user.displayName || user.email)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.displayName || user.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120 }}>
                          <Select
                            value={user.role || 'user'}
                            size="small"
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            sx={{
                              '& .MuiSelect-select': {
                                py: 1,
                                px: 1.5
                              },
                              bgcolor: user.role === 'admin' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                              borderRadius: 'var(--border-radius-sm)',
                              '&:hover': {
                                bgcolor: 'rgba(var(--color-primary-rgb), 0.05)'
                              }
                            }}
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <Box>
                          <Tooltip title="Edit User">
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: 'var(--color-primary)',
                                '&:hover': {
                                  bgcolor: 'rgba(var(--color-primary-rgb), 0.1)'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete User">
                            <IconButton 
                              size="small" 
                              sx={{ 
                                color: 'var(--color-error)',
                                '&:hover': {
                                  bgcolor: 'rgba(var(--color-error-rgb), 0.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                    {index < users.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
              
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: 'var(--color-primary)',
                  '&:hover': {
                    bgcolor: 'var(--color-primary-dark)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 'var(--shadow-md)',
                  fontWeight: 600
                }}
              >
                Add New User
              </Button>
            </MotionBox>
          )}

          {/* Analytics */}
          {activeTab === 1 && (
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                Analytics Dashboard
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MotionPaper
                    whileHover={{ y: -5 }}
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 'var(--border-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)' }}>
                      <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Recognition Activity
                    </Typography>
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Chart visualization would go here
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Shows recognition activity over time
                    </Typography>
                  </MotionPaper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MotionPaper
                    whileHover={{ y: -5 }}
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 'var(--border-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)' }}>
                      <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Top Recognition Badges
                    </Typography>
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Chart visualization would go here
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Shows most frequently used recognition badges
                    </Typography>
                  </MotionPaper>
                </Grid>
                
                <Grid item xs={12}>
                  <MotionPaper
                    whileHover={{ y: -5 }}
                    sx={{ 
                      p: 3, 
                      borderRadius: 'var(--border-radius-lg)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)' }}>
                      <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      User Engagement
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Chart visualization would go here
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Shows user engagement metrics over time
                    </Typography>
                  </MotionPaper>
                </Grid>
              </Grid>
            </MotionBox>
          )}

          {/* System Settings */}
          {activeTab === 2 && (
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                System Settings
              </Typography>
              
              <MotionPaper
                sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: 'var(--border-radius-lg)',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Recognition Settings</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" gutterBottom>Monthly Kudos Limit</Typography>
                      <TextField
                        type="number"
                        value={systemSettings.kudosLimit}
                        onChange={(e) => handleSettingChange('kudosLimit', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 100 } }}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 'var(--border-radius-md)'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Maximum number of recognitions a user can send per month
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>User Management</Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.allowPublicSignup}
                            onChange={(e) => handleSettingChange('allowPublicSignup', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Allow Public Signup"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                        When enabled, new users can register without an invitation
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.requireApproval}
                            onChange={(e) => handleSettingChange('requireApproval', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Require Admin Approval"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                        When enabled, new users require admin approval
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: 'var(--color-error)' }}>
                      Maintenance Options
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            color="error"
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                        When enabled, only administrators can access the system
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </MotionPaper>
              
              <Button 
                variant="contained" 
                onClick={saveSettings}
                sx={{ 
                  mr: 2,
                  bgcolor: 'var(--color-primary)',
                  '&:hover': {
                    bgcolor: 'var(--color-primary-dark)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 'var(--shadow-md)',
                  fontWeight: 600
                }}
              >
                Save Settings
              </Button>
              
              <Button 
                variant="outlined"
                sx={{ 
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-primary-dark)',
                    bgcolor: 'rgba(var(--color-primary-rgb), 0.05)'
                  }
                }}
              >
                Reset to Defaults
              </Button>
            </MotionBox>
          )}
        </Box>
      </MotionPaper>
    </MotionBox>
  );
};

export default AdminPortal; 