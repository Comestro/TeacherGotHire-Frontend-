import React, { useState, useEffect } from "react";
import {
  Box,
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
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
  WorkOutline,
} from "@mui/icons-material";
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
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import Layout from "../Admin/Layout";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../services/adminDashboardApi";

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

export default function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [chartTab, setChartTab] = useState(0);
  const [showAllActions, setShowAllActions] = useState(false);
  const [mockData, setMockData] = useState({
    teachers: { total: 0, pending: 0, thisMonth: 0 },
    recruiters: { total: 0, pending: 0, thisMonth: 0 },
    interviews: { upcoming: 0, completed: 0 },
    passkeys: { total: 0, pending: 0, approved: 0 },
    examcenters: { total_examcenter: 0 },
    QuestioReports: { total: 0 },
    HireRequests: { total: 0, requested: 0, approved: 0, rejected: 0 },
    TeacherApply: { total: 0, pending: 0, approved: 0 },
    RecruiterEnquiryForm: { total: 0 },
    subjects: { total: 0 },
    class_categories: { total: 0 },
    assignedquestionusers: { total: 0 },
    skills: { total: 0 },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setMockData(response);
      } catch (error) {}
    };

    fetchDashboardData();
  }, []);

  const handleChartTabChange = (event, newValue) => {
    setChartTab(newValue);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "top",
        labels: {
          color: "#333",
          boxWidth: isMobile ? 8 : 30,
          font: {
            size: isMobile ? 8 : 10,
          },
          padding: isMobile ? 5 : 8,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          display: !isMobile,
        },
        ticks: {
          color: "#666",
          font: {
            size: isMobile ? 8 : 10,
          },
          maxRotation: isMobile ? 45 : 0,
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          font: {
            size: isMobile ? 8 : 10,
          },
          callback: function (value) {
            if (isMobile && value > 100) {
              return value.toString().substring(0, 1) + "00";
            }
            return value;
          },
        },
      },
    },
  };

  const statsSummary = [
    {
      label: "Teachers",
      value: mockData.teachers?.total,
      color: "#0d9488",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    },
    {
      label: "Recruiters",
      value: mockData.recruiters?.total,
      color: "#06B6D4",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    },
    {
      label: "Interviews",
      value: mockData.interviews?.completed,
      color: "#14b8a6",
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
    },
    {
      label: "Hiring",
      value: mockData.HireRequests?.total,
      color: "#0891b2",
      icon: <BusinessCenter sx={{ fontSize: 40 }} />,
    },
    {
      label: "Center",
      value: mockData.examcenters?.total_examcenter,
      color: "#0d9488",
      icon: <Quiz sx={{ fontSize: 40 }} />,
    },
    {
      label: "Applications",
      value: mockData.TeacherApply?.total,
      color: "#14b8a6",
      icon: <AssignmentInd sx={{ fontSize: 40 }} />,
    },
  ];

  const quickActions = [
    {
      icon: <SchoolIcon />,
      text: "Teachers",
      color: "#0d9488",
      link: "/admin/manage/teacher",
    },
    {
      icon: <SupervisorAccount />,
      text: "Recruiters",
      color: "#06B6D4",
      link: "/admin/manage/recruiter",
    },
    {
      icon: <BusinessCenter />,
      text: "Hiring",
      color: "#14b8a6",
      link: "/admin/manage/hiring",
    },
    {
      icon: <VideoCall />,
      text: "Interviews",
      color: "#0891b2",
      link: "/admin/manage/interview",
    },
    {
      icon: <Quiz />,
      text: "Exams",
      color: "#0d9488",
      link: "/admin/manage/exam",
    },
    {
      icon: <MenuBook />,
      text: "Subjects",
      color: "#14b8a6",
      link: "/admin/manage/subject",
    },
    {
      icon: <Category />,
      text: "Categories",
      color: "#2dd4bf",
      link: "/admin/manage/class/category",
    },
    {
      icon: <Key />,
      text: "Passkeys",
      color: "#06B6D4",
      link: "/admin/manage/passkey",
    },
    {
      icon: <Psychology />,
      text: "Skills",
      color: "#0d9488",
      link: "/admin/manage/skills",
    },
    {
      icon: <Grade />,
      text: "Levels",
      color: "#14b8a6",
      link: "/admin/manage/level",
    },
    {
      icon: <WorkspacePremium />,
      text: "Qualifications",
      color: "#0891b2",
      link: "/admin/manage/qualification",
    },
    {
      icon: <AssignmentInd />,
      text: "Job Applications",
      color: "#06B6D4",
      link: "/admin/manage/teacher/applied/job",
    },
    {
      icon: <NotificationImportant />,
      text: "Enquiries",
      color: "#0d9488",
      link: "/admin/manage/recruiter/enquiry",
    },
    {
      icon: <QuestionAnswerIcon />,
      text: "Question manager",
      color: "#14b8a6",
      link: "/admin/manage/question/manager",
    },
    {
      icon: <LocationOn />,
      text: "Exam Centers",
      color: "#2dd4bf",
      link: "/admin/manage/exam/center",
    },
    {
      icon: <WorkOutline />,
      text: "Job Types",
      color: "#0891b2",
      link: "/admin/manage/teacher/jobtype",
    },
  ];

  const displayedQuickActions = showAllActions
    ? quickActions
    : quickActions.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  const handleActionClick = (link) => {
    navigate(link);
  };

  return (
    <Layout>
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          color: "#1E293B",
          transition: "all 0.3s ease",
          overflowX: "hidden !important",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* Compact Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            pb: 1,
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              fontWeight="600"
              sx={{ color: "#0d9488", mb: 0.25, fontSize: "1rem" }}
            >
              Teacher Assessment & Hiring Portal
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.7rem",
              }}
            >
              <DashboardIcon sx={{ fontSize: 14 }} />
              Dashboard Overview •{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>

        {/* Compact Key Metrics */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          {statsSummary.map((stat, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(13,148,136,0.1)",
                    borderColor: stat.color,
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h4"
                      fontWeight="700"
                      sx={{
                        color: "#1E293B",
                        lineHeight: 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", fontSize: "0.7rem" }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={2}>
          {/* Left Column - Analytics Cards */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Charts Section */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
              }}
            >
              <Tabs
                value={chartTab}
                onChange={handleChartTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 1.5,
                  minHeight: 36,
                  "& .MuiTab-root": {
                    minHeight: 36,
                    py: 0.5,
                    px: 1.5,
                    fontSize: "0.75rem",
                    minWidth: "auto",
                  },
                }}
              >
                <Tab
                  icon={<ShowChartIcon sx={{ fontSize: 20 }} />}
                  label="Trends"
                  iconPosition="start"
                />
                <Tab
                  icon={<BarChartIcon sx={{ fontSize: 20 }} />}
                  label="Comparison"
                  iconPosition="start"
                />
                <Tab
                  icon={<PieChartIcon sx={{ fontSize: 20 }} />}
                  label="Distribution"
                  iconPosition="start"
                />
              </Tabs>

              <Box sx={{ height: { xs: 180, sm: 220, md: 250 } }}>
                {chartTab === 0 && (
                  <Line
                    options={chartOptions}
                    data={{
                      labels: [
                        "Teachers",
                        "Recruiters",
                        "Interviews",
                        "Hiring",
                        "Applications",
                      ],
                      datasets: [
                        {
                          label: "Total Count",
                          data: [
                            mockData.teachers?.total || 0,
                            mockData.recruiters?.total || 0,
                            mockData.interviews?.upcoming +
                              mockData.interviews?.completed || 0,
                            mockData.HireRequests?.total || 0,
                            mockData.TeacherApply?.total || 0,
                          ],
                          borderColor: "#0d9488",
                          backgroundColor: "rgba(13, 148, 136, 0.1)",
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                  />
                )}
                {chartTab === 1 && (
                  <Bar
                    options={chartOptions}
                    data={{
                      labels: [
                        "Teachers",
                        "Recruiters",
                        "Interviews",
                        "Hiring",
                      ],
                      datasets: [
                        {
                          label: "Active",
                          data: [
                            mockData.teachers?.total || 0,
                            mockData.recruiters?.total || 0,
                            mockData.interviews?.upcoming || 0,
                            mockData.HireRequests?.total || 0,
                          ],
                          backgroundColor: "#0d9488",
                        },
                        {
                          label: "Pending",
                          data: [
                            mockData.teachers?.pending || 0,
                            mockData.recruiters?.pending || 0,
                            0,
                            mockData.HireRequests?.requested || 0,
                          ],
                          backgroundColor: "#06B6D4",
                        },
                      ],
                    }}
                  />
                )}
                {chartTab === 2 && (
                  <Doughnut
                    options={{ ...chartOptions, maintainAspectRatio: false }}
                    data={{
                      labels: [
                        "Teachers",
                        "Recruiters",
                        "Exam Centers",
                        "Applications",
                      ],
                      datasets: [
                        {
                          data: [
                            mockData.teachers?.total || 0,
                            mockData.recruiters?.total || 0,
                            mockData.examcenters?.total_examcenter || 0,
                            mockData.TeacherApply?.total || 0,
                          ],
                          backgroundColor: [
                            "#0d9488",
                            "#06B6D4",
                            "#14b8a6",
                            "#2dd4bf",
                          ],
                          borderWidth: 2,
                          borderColor: "#fff",
                        },
                      ],
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Quick Access & Resources */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Quick Actions */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.9rem",
                }}
              >
                <SettingsIcon sx={{ fontSize: 22, color: "#0d9488" }} />
                Quick Actions
              </Typography>

              <Grid container spacing={1}>
                {quickActions.map((action, index) => (
                  <Grid size={6} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleActionClick(action.link)}
                      sx={{
                        py: 0.75,
                        px: 0.75,
                        flexDirection: "column",
                        gap: 0.5,
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#fafafa",
                        color: "#1E293B",
                        textTransform: "none",
                        minHeight: "auto",
                        "&:hover": {
                          borderColor: action.color,
                          backgroundColor: `${action.color}10`,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: action.color,
                          fontSize: 28,
                          "& svg": { fontSize: 28 },
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.75rem",
                          lineHeight: 1.2,
                          textAlign: "center",
                        }}
                      >
                        {action.text}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {quickActions.length > 8 && (
                <Button
                  fullWidth
                  size="small"
                  onClick={() => setShowAllActions(!showAllActions)}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontSize: "0.75rem",
                    py: 0.5,
                  }}
                >
                  {showAllActions
                    ? "Show Less"
                    : `Show All (${quickActions.length - 8} more)`}
                </Button>
              )}
            </Paper>

            {/* System Resources */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.9rem",
                }}
              >
                <AssessmentIcon sx={{ fontSize: 22, color: "#0d9488" }} />
                Resources
              </Typography>

              {[
                {
                  icon: <MenuBook sx={{ fontSize: 20 }} />,
                  label: "Subjects",
                  count: mockData.subjects?.total,
                  color: "#0d9488",
                },
                {
                  icon: <Category sx={{ fontSize: 20 }} />,
                  label: "Categories",
                  count: mockData.class_categories?.total,
                  color: "#06B6D4",
                },
                {
                  icon: <Psychology sx={{ fontSize: 20 }} />,
                  label: "Skills",
                  count: mockData.skills?.total,
                  color: "#14b8a6",
                },
                {
                  icon: <Key sx={{ fontSize: 20 }} />,
                  label: "Passkeys",
                  count: mockData.passkeys?.total,
                  color: "#0891b2",
                },
                {
                  icon: <QuestionAnswerIcon sx={{ fontSize: 20 }} />,
                  label: "Questions",
                  count: mockData.assignedquestionusers?.total,
                  color: "#0d9488",
                },
                {
                  icon: <LocationOn sx={{ fontSize: 20 }} />,
                  label: "Centers",
                  count: mockData.examcenters?.total_examcenter,
                  color: "#14b8a6",
                },
              ].map((resource, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.75,
                    px: 1,
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: "#fafafa",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: `${resource.color}10`,
                      borderColor: resource.color,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: `${resource.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: resource.color,
                      }}
                    >
                      {resource.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight="500"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {resource.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={resource.count}
                    size="small"
                    sx={{
                      bgcolor: `${resource.color}20`,
                      color: resource.color,
                      fontWeight: 600,
                      height: 22,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
