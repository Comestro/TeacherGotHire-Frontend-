// manage question page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ManageQuestion() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Manage Question
      </Typography>
      <Typography>
        Welcome to the Manage Question page. Here you can manage questions.
      </Typography>
    </Layout>
  );
}
