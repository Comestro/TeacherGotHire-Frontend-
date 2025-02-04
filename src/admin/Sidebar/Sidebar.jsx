import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import SubjectIcon from "@mui/icons-material/Subject";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import BuildIcon from "@mui/icons-material/Build";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportIcon from "@mui/icons-material/Support";
import LockIcon from "@mui/icons-material/Lock";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ClassIcon from "@mui/icons-material/Class";
import LayersIcon from "@mui/icons-material/Layers";
import { Collapse, Tooltip } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from '@mui/icons-material/Groups';
import { Link } from "react-router-dom";
import { logout } from "../../services/authServices";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
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
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidebar({ open, handleDrawerClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [collapseOpen, setCollapseOpen] = useState(false);

  const handleCollapseToggle = () => {
    setCollapseOpen((prev) => !prev);
  };

  const handlelogout = () => {
    logout();
    navigate("/signin");
  };

  // custom scroll bar style

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/admin/dashboard" },
    { text: "Your profile", icon: <PersonIcon />, link: "/admin/profile" },
    { text: "Manage Subject", icon: <SubjectIcon />, link: "/admin/manage/subject" },
    { text: "Manage Teacher", icon: <GroupsIcon />, link: "/admin/manage/teacher" },
    { text: "Manage Recruiter", icon: <WorkIcon />, link: "/admin/manage/recruiter" },
    { text: "Manage Question", icon: <QuestionAnswerIcon />, link: "/admin/manage/question" },
    { text: "Manage Skills", icon: <BuildIcon />, link: "/admin/manage/skills" },
    { text: "Manage Qualification", icon: <SchoolIcon />, link: "/admin/manage/qualification" },
    { text: "Manage Class", icon: <ClassIcon />, link: "/admin/manage/class/category" },
    {
      text: "Manage Subject",
      icon: <SubjectIcon />,
      link: "/admin/manage/subject",
    },
    {
      text: "Manage Teacher",
      icon: <SchoolIcon />,
      link: "/admin/manage/teacher",
    },
    {
      text: "Manage Recruiter",
      icon: <WorkIcon />,
      link: "/admin/manage/recruiter",
    },
    {
      text: "Manage Question",
      icon: <QuestionAnswerIcon />,
      link: "/admin/manage/question",
    },
    {
      text: "Manage Skills",
      icon: <BuildIcon />,
      link: "/admin/manage/skills",
    },
    {
      text: "Manage Qualification",
      icon: <AssignmentIcon />,
      link: "/admin/manage/qualification",
    },
    {
      text: "Manage Class",
      icon: <ClassIcon />,
      link: "/admin/manage/class/category",
    },
    { text: "Manage Level", icon: <LayersIcon />, link: "/admin/manage/level" },
    { text: "Manage Exam", icon: <AssignmentIcon />, link: "/admin/manage/exam" },
];
  ];

  return (
    <Drawer variant="permanent" open={open}>
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
      <List>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={item.text} placement="right" arrow>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{
                  minHeight: 48,
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
        <Divider />
        {/* Collapsible Settings Section */}
        <ListItem disablePadding onClick={handleCollapseToggle}>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
            {collapseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={collapseOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
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
              <Tooltip
                key={item.text}
                title={item.text}
                placement="right"
                arrow
              >
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.link}
                    sx={{
                      pl: 4,
                      minHeight: 48,
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
      <Divider />
      {/* add logout button below */}
      <List className="">
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton onClick={handlelogout}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: "error.main" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
