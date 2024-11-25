// manage teacher page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ManageTeacher() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Teacher
      </Typography>
      <Typography>
        Welcome to the Manage Teacher page. Here you can manage teachers.
      </Typography>
    </Layout>
  );
}
