// change password page

import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function ChangePassword() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Change Password
      </Typography>
      <Typography>
        Welcome to the Change Password page. Here you can change your password.
      </Typography>
    </Layout>
  );
}
