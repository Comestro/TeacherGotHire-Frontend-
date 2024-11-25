import React, { useState } from "react";
import Layout from "../Admin/Layout";
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AttachFile as AttachFileIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    // Add logic to handle form submission
    setSuccessMessage("Thank you! Your message has been sent. We’ll get back to you soon.");
  };

  const handleClear = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setFile(null);
    setSuccessMessage("");
  };

  const toggleFaq = () => {
    setFaqOpen(!faqOpen);
  };

  return (
    <Layout>
      <Container>
        <Box mb={3}>
          <img
            src="https://plus.unsplash.com/premium_photo-1661763911173-f2f7becc70b0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Replace with your banner image URL
            alt="Contact Us Banner"
            style={{ width: "100%", height: "450px" }}
          />
        </Box>
        <Typography variant="h4" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Get in touch with our support team for assistance.
        </Typography>
        <Box mt={3}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon color="primary" />
              <Typography variant="body1" ml={1}>
                support@portalname.com
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <PhoneIcon color="primary" />
              <Typography variant="body1" ml={1}>
                +1 234 567 8900
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body1" ml={1}>
                Monday to Friday, 9 AM - 6 PM (EST)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationOnIcon color="primary" />
              <Typography variant="body1" ml={1}>
                123 Main Street, City, Country
              </Typography>
            </Box>
            {/* Optional: Add an embedded map showing the office location */}
          </Paper>
        </Box>
        <Box mt={3}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>
              Send Us a Message
            </Typography>
            <TextField
              label="Name"
              fullWidth
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <MenuItem value="general inquiry">General Inquiry</MenuItem>
                <MenuItem value="technical issue">Technical Issue</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Message"
              fullWidth
              variant="outlined"
              margin="normal"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${message.length}/500`}
            />
            <Box display="flex" alignItems="center" mb={2}>
              <input
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<AttachFileIcon />}
                >
                  Upload File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" ml={2}>
                  {file.name}
                </Typography>
              )}
            </Box>
            {successMessage && (
              <Typography color="primary" variant="body2" gutterBottom>
                {successMessage}
              </Typography>
            )}
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Send Message
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleClear}>
                Clear
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box mt={3}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <List>
              <ListItem button onClick={toggleFaq}>
                <ListItemText primary="How can I reset my password?" />
                {faqOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={faqOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem>
                    <ListItemText primary="To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions to reset your password." />
                  </ListItem>
                </List>
              </Collapse>
              <ListItem button onClick={toggleFaq}>
                <ListItemText primary="How do I update my profile information?" />
                {faqOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={faqOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem>
                    <ListItemText primary="To update your profile information, go to your account settings and edit your profile details." />
                  </ListItem>
                </List>
              </Collapse>
            </List>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}