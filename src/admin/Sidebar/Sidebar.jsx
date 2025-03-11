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
import Divider from "@mui/material/Divider";
import { Badge, Collapse, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { handleLogout } from "../../services/authUtils";
import {
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
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
  Support as SupportIcon,
  Lock as LockIcon,
  ContactMail as ContactMailIcon,
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

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden !important",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden !important",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  overflowX: "hidden !important",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      overflowX: "hidden !important",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      overflowX: "hidden !important",
    },
  }),
}));

export default function Sidebar({ open, handleDrawerClose }) {
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
    // manage users
    { text: "Teacher", icon: <School />, link: "/admin/manage/teacher" },
    { text: "Recruiter", icon: <SupervisorAccount />, link: "/admin/manage/recruiter" },
    { text: "Question User", icon: <QuestionAnswerIcon />, link: "/admin/manage/question/manager" },
    { text: "Exam Center", icon: <LocationOn />, link: "/admin/manage/exam/center" },
  ];

  return (
    <>
      <ScrollbarStyle />
      <Drawer 
        variant="permanent" 
        open={open}
        sx={{
          overflowX: "hidden !important",
          width: open ? drawerWidth : theme.spacing(7),
          [theme.breakpoints.up("sm")]: {
            width: open ? drawerWidth : theme.spacing(8),
          },
          '& .MuiDrawer-paper': {
            overflowX: "hidden !important"
          }
        }}
        PaperProps={{
          className: "custom-scrollbar",
          sx: {
            overflowX: "hidden !important",
            width: open ? drawerWidth : theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
              width: open ? drawerWidth : theme.spacing(8),
            },
            boxShadow: open ? '2px 0px 10px rgba(0,0,0,0.1)' : 'none',
          }
        }}
      >
        <DrawerHeader>
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
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ py: 0.2, overflowX: "hidden !important" }}>
          {menuItems.slice(0, 1).map((item) => (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              <ListItem disablePadding sx={{ display: "block", py: 0 }}>
                <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={{
                    minHeight: 38,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
          <Divider textAlign="center" sx={{ my: 0.5 }}>Data Management</Divider>
          {menuItems.slice(1, 8).map((item) => (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              <ListItem disablePadding sx={{ display: "block", py: 0 }}>
                <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={{
                    minHeight: 36,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
          <Divider textAlign="center" sx={{ my: 0.5 }}>Manage Request</Divider>
          {menuItems.slice(8, 13).map((item) => (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              <ListItem disablePadding sx={{ display: "block", py: 0 }}>
                <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={{
                    minHeight: 36,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
          <Divider textAlign="center" sx={{ my: 0.5 }}>Manage Users</Divider>
          {menuItems.slice(13).map((item) => (
            <Tooltip key={item.text} title={item.text} placement="right" arrow>
              <ListItem disablePadding sx={{ display: "block", py: 0 }}>
                <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={{
                    minHeight: 36,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
          <Divider sx={{ my: 0.5 }} />
          {/* Collapsible Settings Section */}
          <ListItem disablePadding onClick={handleCollapseToggle} sx={{ py: 0 }}>
            <ListItemButton sx={{ minHeight: 36 }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
              {collapseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={collapseOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ py: 0, overflowX: "hidden !important" }}>
              {[
                {
                  text: "Support",
                  icon: <SupportIcon />,
                  link: "/admin/support",
                },
                {
                  text: "Change-Password",
                  icon: <LockIcon />,
                  link: "/admin/change/password",
                },
                {
                  text: "Contact",
                  icon: <ContactMailIcon />,
                  link: "/admin/contact",
                },
              ].map((item) => (
                <Tooltip key={item.text} title={item.text} placement="right" arrow>
                  <ListItem disablePadding sx={{ py: 0 }}>
                    <ListItemButton
                      component={Link}
                      to={item.link}
                      sx={{
                        pl: 4,
                        minHeight: 32,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
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