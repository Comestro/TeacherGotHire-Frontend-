import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "../Sidebar/Sidebar";
import { useLocation } from "react-router-dom";

const drawerWidth = 280;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
  boxShadow: '0 4px 20px 0 rgba(13, 148, 136, 0.25)',
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
  padding: theme.spacing(0),
  marginTop: 64, // AppBar height
  width: '100%',
  overflowX: 'hidden', // Prevent horizontal overflow in main content
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);

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
      paddingRight:"10px",
      paddingLeft:"10px",
      position: "relative",
      overflow: "hidden" // This prevents horizontal scrollbar on the whole layout
    }}>
      <CssBaseline />
      <AppBar position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ marginRight: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 500,
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              flexGrow: 1
            }}
          >
            {path}
          </Typography>
        </Toolbar>
      </AppBar>
      {isMobile ? (
        <Sidebar
          open={open}
          handleDrawerClose={handleDrawerClose}
          variant="temporary"
        />
      ) : (
        open && (
          <Sidebar
            open={true}
            handleDrawerClose={handleDrawerClose}
            variant="permanent"
          />
        )
      )}
      <Main
        component="main"
        sx={{
          ml: 0,
          width: '100%',
          overflowX: 'hidden !important',
          maxWidth: '100%',
        }}
      >
        <Box sx={{
          overflowX: 'hidden !important',
          width: '100%',
          maxWidth: '100%',
          p: { xs: 1, sm: 2 },
        }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
}