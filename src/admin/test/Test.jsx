import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  WorkOutline as JobIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';

// Mock data for the dashboard
const mockData = {
  teachers: {
    total: 1248,
    pending: 37,
    thisMonth: 124,
  },
  recruiters: {
    total: 456,
    schools: 312,
    institutes: 98,
    individual: 46,
  },
  jobs: {
    total: 875,
    pending: 112,
    inProgress: 245,
    completed: 518,
  },
  interviews: {
    upcoming: 42,
    next: {
      teacher: "Sarah Johnson",
      position: "Science Teacher",
      school: "Westfield High",
      time: "Tomorrow, 10:00 AM",
    }
  },
  exams: {
    total: 342,
    passRate: "78%",
    avgScore: 82,
  },
  recentActivity: [
    { type: 'teacher', name: 'Michael Brown', action: 'registered', time: '2 hours ago', status: 'pending' },
    { type: 'recruiter', name: 'Greenwood Academy', action: 'posted a job', time: '3 hours ago', status: 'active' },
    { type: 'interview', name: 'Emily Clark', action: 'scheduled interview', time: '5 hours ago', status: 'upcoming' },
    { type: 'exam', name: 'Physics Proficiency Test', action: 'results published', time: 'Yesterday', status: 'complete' },
    { type: 'teacher', name: 'James Wilson', action: 'verified', time: 'Yesterday', status: 'approved' },
  ]
};

export default function Test() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [darkMode, setDarkMode] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800';
      case 'active': return '#2196f3';
      case 'upcoming': return '#9c27b0';
      case 'complete':
      case 'approved': return '#4caf50';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      color: darkMode ? '#fff' : '#333',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={darkMode ? 'primary.light' : 'primary.dark'}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color={darkMode ? '#aaa' : '#666'}>
            Monitor platform performance, manage teachers, recruiters, and job requests
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <MailIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit">
            <AccountIcon />
          </IconButton>
        </Box>
      </Box>

      {/* KPI & Analytics Overview */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Analytics Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Teachers Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #4a6572, #336699)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Teachers</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.teachers.total}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={`${mockData.teachers.pending} pending`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  size="small" 
                  label={`+${mockData.teachers.thisMonth} this month`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recruiters Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #5d4157, #a8caba)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Recruiters</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.recruiters.total}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={`${mockData.recruiters.schools} schools`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', mr: 1 }}
                />
                <Chip 
                  size="small" 
                  label={`${mockData.recruiters.institutes} institutes`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Job Requests Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #8e9eab, #eef2f3)',
              color: '#333',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <JobIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Job Requests</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.jobs.total}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={`${mockData.jobs.pending} pending`} 
                  sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#333' }}
                />
                <Chip 
                  size="small" 
                  label={`${mockData.jobs.completed} completed`} 
                  sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#333' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Interviews Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #3a6186, #89253e)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Upcoming Interviews</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.interviews.upcoming}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 'auto' }}>
                <Typography variant="caption">Next interview:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {mockData.interviews.next.teacher} - {mockData.interviews.next.position}
                </Typography>
                <Typography variant="caption">
                  {mockData.interviews.next.time}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Exams Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #134e5e, #71b280)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Exams Conducted</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.exams.total}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={`${mockData.exams.passRate} pass rate`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  size="small" 
                  label={`${mockData.exams.avgScore} avg score`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* New Signups Card */}
        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              height: '100%',
              background: 'linear-gradient(to right, #4b6cb7, #182848)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">New Signups This Month</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {mockData.teachers.thisMonth + Math.floor(mockData.recruiters.total / 10)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                <Chip 
                  size="small" 
                  label={`${mockData.teachers.thisMonth} teachers`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  size="small" 
                  label={`${Math.floor(mockData.recruiters.total / 10)} recruiters`} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions Panel */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 500 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { icon: <CheckCircleIcon />, text: "Approve Pending Teachers", color: "#ff9800" },
          { icon: <JobIcon />, text: "Manage Job Requests", color: "#2196f3" },
          { icon: <ScheduleIcon />, text: "Schedule Interviews", color: "#9c27b0" },
          { icon: <SchoolIcon />, text: "View Recruiter Interests", color: "#f44336" },
          { icon: <AssessmentIcon />, text: "Manage Exam Scores", color: "#4caf50" },
          { icon: <NotificationsIcon />, text: "Send Notifications", color: "#607d8b" },
        ].map((action, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Button 
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                width: '100%',
                textTransform: 'none',
                borderRadius: 2,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                color: darkMode ? 'white' : '#333',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                }
              }}
            >
              <Box sx={{ 
                color: action.color,
                p: 1,
                borderRadius: '50%',
                mb: 1
              }}>
                {action.icon}
              </Box>
              <Typography variant="body2" textAlign="center">{action.text}</Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity & Notifications */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 500 }}>
        Recent Activity
      </Typography>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
        }}
      >
        <List sx={{ p: 0 }}>
          {mockData.recentActivity.map((activity, index) => (
            <React.Fragment key={index}>
              <ListItem 
                button
                secondaryAction={
                  <IconButton edge="end">
                    <ArrowRightIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {activity.type === 'teacher' ? <PeopleIcon /> :
                   activity.type === 'recruiter' ? <SchoolIcon /> :
                   activity.type === 'interview' ? <CalendarIcon /> :
                   <AssessmentIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {activity.name}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={activity.status} 
                        sx={{ 
                          ml: 1,
                          backgroundColor: `${getStatusColor(activity.status)}22`,
                          color: getStatusColor(activity.status),
                          fontWeight: 500,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {activity.action} • {activity.time}
                    </Typography>
                  } 
                />
              </ListItem>
              {index < mockData.recentActivity.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ textAlign: 'center', py: 1, borderTop: '1px solid', borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <Button color="primary" size="small">
            View All Activities
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}