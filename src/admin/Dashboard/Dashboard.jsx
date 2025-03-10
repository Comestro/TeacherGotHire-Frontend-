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
  Tab,
  Tabs,
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
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../Admin/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  // Chart data
  chartData: {
    signups: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Teachers',
          data: [65, 78, 90, 124, 156, 170],
          borderColor: '#4a6572',
          backgroundColor: 'rgba(74, 101, 114, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Recruiters',
          data: [28, 32, 39, 46, 57, 62],
          borderColor: '#8e9eab',
          backgroundColor: 'rgba(142, 158, 171, 0.5)',
          tension: 0.3,
        }
      ]
    },
    jobsData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Jobs Posted',
          data: [45, 59, 80, 81, 103, 125],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Jobs Filled',
          data: [30, 42, 65, 70, 85, 98],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    },
    recruiterTypes: {
      labels: ['Schools', 'Institutes', 'Individual'],
      datasets: [
        {
          data: [312, 98, 46],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    }
  }
};

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [darkMode, setDarkMode] = useState(false);
  const [chartTab, setChartTab] = useState(0);

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#fff' : '#333'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#aaa' : '#666',
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#aaa' : '#666',
        }
      }
    }
  };

  // Statistics summary data
  const statsSummary = [
    { label: 'Pending Teachers', value: mockData.teachers.pending, color: '#ff9800' },
    { label: 'Job Requests', value: mockData.jobs.pending, color: '#2196f3' },
    { label: 'Upcoming Interviews', value: mockData.interviews.upcoming, color: '#9c27b0' },
    { label: 'Avg Exam Score', value: mockData.exams.avgScore, color: '#4caf50' },
  ];

  return (
    <Layout>
      <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 1, sm: 2, md: 3 }, 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      color: darkMode ? '#fff' : '#333',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        mb: 3, 
        alignItems: isMobile ? 'flex-start' : 'center' 
      }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color={darkMode ? 'primary.light' : 'primary.dark'}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color={darkMode ? '#aaa' : '#666'}>
            {isMobile ? 'Platform overview' : 'Monitor platform performance, manage teachers, recruiters, and job requests'}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mt: isMobile ? 2 : 0,
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
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

      {/* Quick Stats Summary - Mobile Optimized */}
      {isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Key Metrics
          </Typography>
          <Grid container spacing={2}>
            {statsSummary.map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                    borderLeft: `4px solid ${stat.color}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* KPI & Analytics Overview */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Analytics Overview
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
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

        {/* Only show these cards on larger screens */}
        {!isMobile && (
          <>
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
          </>
        )}
      </Grid>

      {/* Quick Actions Panel - Mobile Optimized */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 500 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 4 }}>
        {[
          { icon: <CheckCircleIcon />, text: "Approve Teachers", color: "#ff9800" },
          { icon: <JobIcon />, text: "Manage Jobs", color: "#2196f3" },
          { icon: <ScheduleIcon />, text: "Schedule Interviews", color: "#9c27b0" },
          { icon: <SchoolIcon />, text: "View Recruiters", color: "#f44336" },
          { icon: <AssessmentIcon />, text: "Manage Exams", color: "#4caf50" },
          { icon: <NotificationsIcon />, text: "Notifications", color: "#607d8b" },
        ].map((action, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Button 
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 80, sm: 100 },
                width: '100%',
                textTransform: 'none',
                borderRadius: 2,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                color: darkMode ? 'white' : '#333',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                }
              }}
            >
              <Box sx={{ 
                color: action.color,
                p: { xs: 0.5, sm: 1 },
                borderRadius: '50%',
                mb: { xs: 0.5, sm: 1 }
              }}>
                {action.icon}
              </Box>
              <Typography variant={isMobile ? "caption" : "body2"} textAlign="center">{action.text}</Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Charts - Replacing Recent Activity */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 500 }}>
        Analytics & Growth
      </Typography>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
          p: 2
        }}
      >
        <Tabs 
          value={chartTab} 
          onChange={handleChartTabChange} 
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{ mb: 2 }}
          scrollButtons={isMobile}
          allowScrollButtonsMobile
        >
          <Tab 
            icon={<ShowChartIcon />} 
            label={isMobile ? undefined : "Growth"} 
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab 
            icon={<BarChartIcon />} 
            label={isMobile ? undefined : "Jobs"} 
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab 
            icon={<PieChartIcon />} 
            label={isMobile ? undefined : "Distribution"} 
            iconPosition={isMobile ? "top" : "start"}
          />
        </Tabs>

        <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mt: 2 }}>
          {chartTab === 0 && (
            <Line options={chartOptions} data={mockData.chartData.signups} />
          )}
          {chartTab === 1 && (
            <Bar options={chartOptions} data={mockData.chartData.jobsData} />
          )}
          {chartTab === 2 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              height: '100%'
            }}>
              <Box sx={{ 
                height: isMobile ? '200px' : '100%', 
                width: isMobile ? '100%' : '50%',
                position: 'relative'
              }}>
                <Doughnut 
                  data={mockData.chartData.recruiterTypes}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: darkMode ? '#fff' : '#333'
                        }
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ 
                width: isMobile ? '100%' : '50%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h6" fontWeight="medium">Recruiter Distribution</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Schools make up {Math.round(mockData.recruiters.schools / mockData.recruiters.total * 100)}% of our recruiter base
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {[
                    { type: 'Schools', count: mockData.recruiters.schools, color: 'rgba(54, 162, 235, 0.7)' },
                    { type: 'Institutes', count: mockData.recruiters.institutes, color: 'rgba(255, 159, 64, 0.7)' },
                    { type: 'Individual', count: mockData.recruiters.individual, color: 'rgba(255, 99, 132, 0.7)' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 1 }} />
                      <Typography variant="body2">
                        {item.type}: <strong>{item.count}</strong>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ 
          textAlign: 'right', 
          pt: 2, 
          mt: 2,
          borderTop: '1px solid', 
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
        }}>
          <Button 
            color="primary" 
            variant="contained" 
            startIcon={<AssessmentIcon />}
            size={isMobile ? "small" : "medium"}
          >
            Full Analytics Report
          </Button>
        </Box>
      </Paper>

      {/* Upcoming Tasks/Important Reminders - Mobile Focused */}
      {isMobile && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Important Reminders
          </Typography>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 2, 
              p: 2,
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            }}
          >
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 28, height: 28 }}>
                    <PeopleIcon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="Approve new teachers (37)"
                  secondary="Action needed within 24 hours"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 28, height: 28 }}>
                    <CalendarIcon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="Next interview: Tomorrow, 10:00 AM"
                  secondary="Sarah Johnson - Science Teacher"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 28, height: 28 }}>
                    <AssessmentIcon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                  primary="Publish exam results"
                  secondary="Physics Proficiency Test"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
    </Box>
    </Layout>
  );
}