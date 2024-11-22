// manage qualification page

import React from 'react';
import Layout from '../Admin/Layout';
import Typography from '@mui/material/Typography';

export default function ManageQualification() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Qualification
      </Typography>
      <Typography>
        Welcome to the Manage Qualification page. Here you can manage qualifications.
      </Typography>
    </Layout>
  );
}