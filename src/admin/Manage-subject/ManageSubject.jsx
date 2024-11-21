// manage subject page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ManageSubject() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Subject
      </Typography>
      <Typography>
        Welcome to the Manage Subject page. Here you can manage subjects.
      </Typography>
    </Layout>
  );
}
