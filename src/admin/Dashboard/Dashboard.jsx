import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  IconButton,
  Chip,
  Switch,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Badge,
  Tooltip,
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
  Category,
  MenuBook,
  Psychology,
  Grade,
  WorkspacePremium,
  Quiz,
  BusinessCenter,
  Key,
  VideoCall,
  AssignmentInd,
  NotificationImportant,
  SupervisorAccount,
  QuestionAnswer as QuestionAnswerIcon,
  LocationOn,
  MoreHoriz,
  WorkOutline
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../Admin/Layout';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
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
    pendingResults: 18,
  },
  skills: {
    total: 195,
    pending: 12,
  },
  qualifications: {
    total: 85,
    pendingReview: 7,
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [darkMode, setDarkMode] = useState(false);
  const [chartTab, setChartTab] = useState(0);
  const [showAllActions, setShowAllActions] = useState(false);

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
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
          color: darkMode ? '#fff' : '#333',
          boxWidth: isMobile ? 10 : 40,
          font: {
            size: isMobile ? 10 : 12
          }
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
          font: {
            size: isMobile ? 8 : 12
          }
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? '#aaa' : '#666',
          font: {
            size: isMobile ? 8 : 12
          }
        }
      }
    }
  };

  // Statistics summary data
  const statsSummary = [
    { label: 'Pending Teachers', value: mockData.teachers.pending, color: '#ff9800', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Job Requests', value: mockData.jobs.pending, color: '#2196f3', icon: <JobIcon fontSize="small" /> },
    { label: 'Upcoming Interviews', value: mockData.interviews.upcoming, color: '#9c27b0', icon: <CalendarIcon fontSize="small" /> },
    { label: 'Pending Exam Results', value: mockData.exams.pendingResults, color: '#4caf50', icon: <AssessmentIcon fontSize="small" /> },
  ];

  // Using the menu items provided
  const quickActions = [
    { icon: <SchoolIcon />, text: "Teachers", color: "#ff9800", link: "/admin/manage/teacher" },
    { icon: <SupervisorAccount />, text: "Recruiters", color: "#2196f3", link: "/admin/manage/recruiter" },
    { icon: <BusinessCenter />, text: "Hiring", color: "#9c27b0", link: "/admin/manage/hiring" },
    { icon: <VideoCall />, text: "Interviews", color: "#f44336", link: "/admin/manage/interview" },
    { icon: <Quiz />, text: "Exams", color: "#4caf50", link: "/admin/manage/exam" },
    { icon: <MenuBook />, text: "Subjects", color: "#607d8b", link: "/admin/manage/subject" },
    { icon: <Category />, text: "Categories", color: "#795548", link: "/admin/manage/class/category" },
    { icon: <Key />, text: "Passkeys", color: "#009688", link: "/admin/manage/passkey" },
    { icon: <Psychology />, text: "Skills", color: "#e91e63", link: "/admin/manage/skills" },
    { icon: <Grade />, text: "Levels", color: "#673ab7", link: "/admin/manage/level" },
    { icon: <WorkspacePremium />, text: "Qualifications", color: "#3f51b5", link: "/admin/manage/qualification" },
    { icon: <AssignmentInd />, text: "Job Applications", color: "#00bcd4", link: "/admin/manage/teacher/applied/job" },
    { icon: <NotificationImportant />, text: "Enquiries", color: "#ff5722", link: "/admin/manage/recruiter/enquiry" },
    { icon: <QuestionAnswerIcon />, text: "Q&A Users", color: "#8bc34a", link: "/admin/manage/question/manager" },
    { icon: <LocationOn />, text: "Exam Centers", color: "#009688", link: "/admin/manage/exam/center" },
    { icon: <WorkOutline />, text: "Job Types", color: "#795548", link: "/admin/manage/teacher/jobtype" },
  ];

  // Display limited items for mobile or all if expanded
  const displayedQuickActions = showAllActions
    ? quickActions
    : quickActions.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  const handleActionClick = (link) => {
    navigate(link);
  };

  return (
    <Layout>
      <Box sx={{
        flexGrow: 1,
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        minHeight: '100vh',
        color: darkMode ? '#fff' : '#333',
        transition: 'all 0.3s ease',
        overflowX: 'hidden !important',
        width: '100%',
        maxWidth: '100%',
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
            <Typography variant="body2" color="text.secondary">
              Welcome back, Admin | {new Date().toLocaleDateString()}
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
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Key Metrics Summary - Responsive for all devices */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Key Metrics
          </Typography>
          <Grid container spacing={2}>
            {statsSummary.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                    borderLeft: `4px solid ${stat.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Avatar sx={{ bgcolor: stat.color, mr: 1.5, width: 40, height: 40 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {stat.label}
                    </Typography>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* KPI & Analytics Overview */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Analytics Overview
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Teachers Card */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Teachers</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.teachers.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.teachers.pending} pending`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`+${mockData.teachers.thisMonth} this month`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recruiters Card */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Recruiters</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.recruiters.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.recruiters.schools} schools`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.recruiters.institutes} institutes`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Job Requests Card */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Job Requests</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.jobs.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.jobs.pending} pending`}
                    sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#333', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.jobs.completed} completed`}
                    sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: '#333', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Interviews Card - shown on medium and larger screens, or as second row on mobile */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Upcoming Interviews</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.interviews.upcoming}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  mt: 'auto',
                  maxWidth: '100%'
                }}>
                  <Typography variant="caption" noWrap>Next interview:</Typography>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {mockData.interviews.next.teacher} - {mockData.interviews.next.position}
                  </Typography>
                  <Typography variant="caption" noWrap>
                    {mockData.interviews.next.time}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Exams Card */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Exams Conducted</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.exams.total}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.exams.passRate} pass rate`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${mockData.exams.avgScore} avg score`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Additional stats card */}
          <Grid item xs={12} sm={6} md={4}>
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
                  <Typography variant="h6" fontWeight="medium" noWrap>Platform Growth</Typography>
                </Box>
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
                  {mockData.teachers.thisMonth + Math.floor(mockData.recruiters.total / 10)}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Chip
                    size="small"
                    label={`${mockData.teachers.thisMonth} teachers`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                  <Chip
                    size="small"
                    label={`${Math.floor(mockData.recruiters.total / 10)} recruiters`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', maxWidth: '100%' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions Panel - Responsive for all devices */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="500">
              Quick Actions
            </Typography>
            {quickActions.length > displayedQuickActions.length && (
              <Button
                size="small"
                endIcon={<MoreHoriz />}
                onClick={() => setShowAllActions(!showAllActions)}
              >
                {showAllActions ? "Show Less" : "Show All"}
              </Button>
            )}
          </Box>

          <Grid container spacing={isMobile ? 1 : 2}>
            {displayedQuickActions.map((action, index) => (
              <Grid item xs={4} sm={3} md={2} key={index}>
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
                    overflow: 'hidden',
                    p: 1,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'white',
                    }
                  }}
                  onClick={() => handleActionClick(action.link)}
                >
                  <Box sx={{
                    color: action.color,
                    p: { xs: 0.5, sm: 1 },
                    borderRadius: '50%',
                    mb: { xs: 0.5, sm: 1 }
                  }}>
                    {action.icon}
                  </Box>
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    textAlign="center"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {action.text}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Analytics Charts - Responsive tabs for all devices */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Analytics & Growth
        </Typography>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            p: 2,
            mb: 3,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Tabs
            value={chartTab}
            onChange={handleChartTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            sx={{ mb: 2 }}
            scrollButtons="auto"
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

          <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mt: 2, width: '100%' }}>
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
                height: '100%',
                width: '100%'
              }}>
                <Box sx={{ flex: 1, height: '100%', p: 1 }}>
                  <Doughnut options={chartOptions} data={mockData.chartData.recruiterTypes} />
                </Box>
                <Box sx={{ flex: 1, height: '100%', p: 1 }}>
                  <Bar options={chartOptions} data={mockData.chartData.jobsData} />
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}