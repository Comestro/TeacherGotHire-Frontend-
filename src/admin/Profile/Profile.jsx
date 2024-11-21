import React from 'react';
import Typography from '@mui/material/Typography';
import Layout from '../Admin/Layout';

export default function AdminProfile() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography>
        Welcome to the Admin Profile. Here you can manage your profile.
      </Typography>
    </Layout>
  );
}