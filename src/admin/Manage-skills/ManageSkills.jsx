// manage skills page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ManageSkills() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Skills
      </Typography>
      <Typography>
        Welcome to the Manage Skills page. Here you can manage skills.
      </Typography>
    </Layout>
  );
}
