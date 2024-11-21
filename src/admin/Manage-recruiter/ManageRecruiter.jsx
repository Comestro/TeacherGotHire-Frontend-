// manage recruiter page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ManageRecruiter() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Recruiter
      </Typography>
      <Typography>
        Welcome to the Manage Recruiter page. Here you can manage recruiters.
      </Typography>
    </Layout>
  );
}
