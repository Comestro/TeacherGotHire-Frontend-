import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../Sidebar/Sidebar";
import { useLocation } from "react-router-dom";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: 'linear-gradient(90deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.12)',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  overflowX: "hidden",
}));

const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // AppBar height
  width: '100%',
  overflowX: 'hidden', // Prevent horizontal overflow in main content
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const location = useLocation();
  const path = location.pathname
    .replace(/\//g, " ") // Replace all slashes with spaces
    .replace("-", " ")
    .trim() // Remove any leading/trailing spaces
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Box sx={{
      display: "flex",
      width: "100%",
      position: "relative",
      overflow: "hidden" // This prevents horizontal scrollbar on the whole layout
    }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {path}
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <Main
        component="main"
        sx={{
          width: '100%',
          overflowX: 'hidden !important',
          maxWidth: '100%',
        }}
      >
        <Box sx={{
          overflowX: 'hidden !important',
          width: '100%',
          maxWidth: '100%',
        }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
}