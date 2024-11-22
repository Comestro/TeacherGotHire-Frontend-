// contact page
import React from "react";
import Layout from "../Admin/Layout";
import { Typography } from "@mui/material";

export default function Contact() {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Contact
      </Typography>
      <Typography>
        Welcome to the Contact page. Here you can contact us.
      </Typography>
    </Layout>
  );
}
