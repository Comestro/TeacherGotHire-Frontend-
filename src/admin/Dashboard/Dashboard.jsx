import React from 'react';
import Typography from '@mui/material/Typography';
import Layout from '../Admin/Layout';

export default function AdminDashboard() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography>
        Welcome to the Admin Dashboard. Here you can manage your data, view
        analytics, and much more.
      </Typography>
    </Layout>
  );
}
