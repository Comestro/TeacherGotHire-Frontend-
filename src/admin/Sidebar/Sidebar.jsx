import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import { Badge, Collapse } from "@mui/material";
import { useDispatch } from "react-redux";
import { handleLogout } from "../../services/authUtils";
import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Groups as GroupsIcon,
  Key,
  VideoCall,
  BusinessCenter,
  Quiz,
  LibraryBooks,
  WorkOutline,
  Category,
  MenuBook,
  Psychology,
  Grade,
  WorkspacePremium,
  AssignmentInd,
  NotificationImportant,
  School,
  SupervisorAccount,
  QuestionMark,
  LocationOn,
  Report,
  FlagCircle,
} from "@mui/icons-material";

// Custom scrollbar styles
const ScrollbarStyle = styled('style')({
  children: `
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #888 #f1f1f1;
      overflow-y: auto;
      overflow-x: hidden !important;
    }
  `
});

const drawerWidth = 300;

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      overflowX: "hidden !important",
      backgroundColor: '#F8FAFC',
      boxShadow: '4px 0px 20px rgba(0,0,0,0.1)',
      borderRight: `1px solid #64748B`,
    },
  }),
  ...(!open && {
    "& .MuiDrawer-paper": {
      overflowX: "hidden !important",
      backgroundColor: '#F8FAFC',
      boxShadow: '4px 0px 20px rgba(0,0,0,0.1)',
      borderRight: `1px solid #64748B`,
    },
  }),
}));

export default function Sidebar({ open, handleDrawerClose, variant = 'permanent' }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapseOpen, setCollapseOpen] = useState(false);

  const handleCollapseToggle = () => {
    setCollapseOpen((prev) => !prev);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/admin/dashboard" },
    // data management
    { text: "Class category", icon: <Category />, link: "/admin/manage/class/category" },
    { text: "Subjects", icon: <MenuBook />, link: "/admin/manage/subject" },
    { text: "Skills", icon: <Psychology />, link: "/admin/manage/skills" },
    { text: "Level", icon: <Grade />, link: "/admin/manage/level" },
    { text: "Qualification", icon: <WorkspacePremium />, link: "/admin/manage/qualification" },
    { text: "Job Type", icon: <WorkOutline />, link: "/admin/manage/teacher/jobtype" },
    { text: "Exam", icon: <Quiz />, link: "/admin/manage/exam" },
    // manage request
    { text: "Hiring", icon: <BusinessCenter />, link: "/admin/manage/hiring" },
    { text: "Passkey", icon: <Key />, link: "/admin/manage/passkey" },
    { text: "Interview", icon: <VideoCall />, link: "/admin/manage/interview" },
    { text: "Job Applied", icon: <AssignmentInd />, link: "/admin/manage/teacher/applied/job" },
    { text: "Recruiter Enquiry", icon: <NotificationImportant />, link: "/admin/manage/recruiter/enquiry" },
    { text: "Question Report", icon: <FlagCircle />, link: "/admin/manage/question/report" },
    // manage users
    { text: "Teacher", icon: <School />, link: "/admin/manage/teacher" },
    { text: "Recruiter", icon: <SupervisorAccount />, link: "/admin/manage/recruiter" },
    { text: "Question Manager", icon: <QuestionAnswerIcon />, link: "/admin/manage/question/manager" },
    { text: "Exam Center", icon: <LocationOn />, link: "/admin/manage/exam/center" },
  ];

  return (
    <>
      <ScrollbarStyle />
      <Drawer
        anchor="left"
        variant={variant}
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          overflowX: "hidden !important",
          '& .MuiDrawer-paper': {
            width: variant === 'permanent' ? drawerWidth : undefined,
            overflowX: "hidden !important"
          }
        }}
        PaperProps={{
          className: "custom-scrollbar",
          sx: {
            overflowX: "hidden !important",
            width: variant === 'permanent' ? drawerWidth : undefined,
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: theme.spacing(2, 1), backgroundColor: '#0d9488', color: '#F8FAFC', ...theme.mixins.toolbar }}>
          <Box
            sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            PTPI
          </Box>
        </Box>
        <Divider />
        <List sx={{ py: 1, overflowX: "hidden !important" }}>
          {menuItems.slice(0, 1).map((item) => (
            <ListItem disablePadding sx={{ display: "block", py: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{
                  minHeight: 48,
                  justifyContent: "initial",
                  px: 3,
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: "center",
                    color: '#F8FAFC',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: 1, fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListSubheader sx={{ fontWeight: 'bold', position:"static", fontSize: '0.9rem', color: '#1E293B', backgroundColor: 'transparent', px: 3, py: 1 }}>
            Data Management
          </ListSubheader>
          {menuItems.slice(1, 8).map((item) => (
            <ListItem disablePadding sx={{ display: "block", py: 0.25 }}>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{
                  minHeight: 44,
                  justifyContent: "initial",
                  px: 3,
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: "center",
                    color: '#F8FAFC',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: 1 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListSubheader sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1E293B', backgroundColor: 'transparent', px: 3, py: 1 }}>
            Manage Requests
          </ListSubheader>
          {menuItems.slice(8, 14).map((item) => (
            <ListItem disablePadding sx={{ display: "block", py: 0.25 }}>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{
                  minHeight: 44,
                  justifyContent: "initial",
                  px: 3,
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: "center",
                    color: '#F8FAFC',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: 1 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListSubheader sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1E293B', backgroundColor: 'transparent', px: 3, py: 1 }}>
            Manage Users
          </ListSubheader>
          {menuItems.slice(14).map((item) => (
            <ListItem disablePadding sx={{ display: "block", py: 0.25 }}>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{
                  minHeight: 44,
                  justifyContent: "initial",
                  px: 3,
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    justifyContent: "center",
                    color: '#F8FAFC',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: 1 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          {/* Collapsible Settings Section */}
          <ListItem disablePadding onClick={handleCollapseToggle} sx={{ py: 0.5 }}>
            <ListItemButton sx={{ minHeight: 48, px: 3, borderRadius: 1, mx: 1, '&:hover': { backgroundColor: '#06B6D4' } }}>
              <ListItemIcon sx={{ color: '#F8FAFC', backgroundColor: '#0d9488', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 3, minWidth: 0 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" sx={{ fontWeight: 500 }} />
              {collapseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={collapseOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ py: 0, overflowX: "hidden !important" }}>
              {
                [{
                  text: "Change-Password",
                  icon: <LockIcon />,
                  link: "/admin/change/password",
                },
               ,
              ].map((item) => (
                <ListItem disablePadding sx={{ py: 0.25 }}>
                  <ListItemButton
                    component={Link}
                    to={item.link}
                    sx={{
                      pl: 6,
                      minHeight: 40,
                      justifyContent: "initial",
                      px: 3,
                      borderRadius: 1,
                      mx: 1,
                      '&:hover': {
                        backgroundColor: '#06B6D4',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 3,
                        justifyContent: "center",
                        color: '#F8FAFC',
                        backgroundColor: '#0d9488',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: 1 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
        <Divider sx={{ my: 0.5 }} />
        {/* Logout Button */}
        <List>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton onClick={() => handleLogout(dispatch, navigate)} sx={{ minHeight: 36 }}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: "error.main" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}