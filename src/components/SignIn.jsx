import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Link, IconButton, InputAdornment, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import logInservice from '../services/apiService'; 

const BackgroundBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    background: 'url(/signin.jpeg) no-repeat center center',
    backgroundSize: 'cover',
    opacity: 0.8,
  },
}));

const LeftSide = styled(Box)(({ theme }) => ({
  flex: 1,
  background: 'url(/signin.jpeg) no-repeat center center',
  backgroundSize: 'cover',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const RightSide = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.common.white,
  boxShadow: theme.shadows[5],
  [theme.breakpoints.down('sm')]: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
}));

const FormContainer = styled(Container)(({ theme }) => ({
  maxWidth: '400px',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    padding: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); // Clear any previous error messages
    try {
      const result = await logInservice.logInservice(email, password);
      console.log('Login successful:', result);
      navigate('/admin-dashboard');
      navigate(0); // Refresh the page
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your email and password.'); // Set error message
    }
  };

  return (
    <BackgroundBox>
      <LeftSide />  
      <RightSide>
        <FormContainer>
          <Box textAlign="center" mb={4}>
            <Typography variant="h5" component="h1" gutterBottom>
              PRIVATE TEACHER PROVIDER INSTITUTE
            </Typography>
            <Typography variant="subtitle1">
              Connect with top teachers and great teaching jobs.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" noValidate autoComplete="off" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="Enter your email"
              variant="outlined"
              margin="normal"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              placeholder="Enter your password"
              variant="outlined"
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
            >
              Login
            </Button>
            <Box display="flex" justifyContent="space-between">
              <Link href="#" variant="body2">
                Forgot Password?
              </Link>
              <Link href="#" variant="body2">
                Contact Support
              </Link>
            </Box>
          </Box>
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              © 2024 PTPI. All rights reserved.
            </Typography>
            <Link href="#" variant="body2">
              Terms of Service
            </Link>
            {' | '}
            <Link href="#" variant="body2">
              Privacy Policy
            </Link>
          </Box>
        </FormContainer>
      </RightSide>
    </BackgroundBox>
  );
};

export default SignIn;