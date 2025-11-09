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
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setNewPassword(value);
    setPasswordRequirements({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      specialChar: /[!@#$%^&*]/.test(value),
    });
  };

  const handleSubmit = () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    // Add logic to handle password change
    setSuccessMessage("Your password has been updated successfully.");
    setErrorMessage("");
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Update your password to keep your account secure.
        </Typography>
        <Box mt={3}>
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={handlePasswordChange}
            helperText={
              <Box>
                <FormHelperText error={!passwordRequirements.length}>
                  At least 8 characters
                </FormHelperText>
                <FormHelperText error={!passwordRequirements.uppercase}>
                  Includes uppercase letter
                </FormHelperText>
                <FormHelperText error={!passwordRequirements.lowercase}>
                  Includes lowercase letter
                </FormHelperText>
                <FormHelperText error={!passwordRequirements.number}>
                  Includes number
                </FormHelperText>
                <FormHelperText error={!passwordRequirements.specialChar}>
                  Includes special character
                </FormHelperText>
              </Box>
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showConfirmNewPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    >
                      {showConfirmNewPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
          {errorMessage && (
            <Typography color="error" variant="body2" gutterBottom>
              {errorMessage}
            </Typography>
          )}
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
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword ||
                !passwordRequirements.length ||
                !passwordRequirements.uppercase ||
                !passwordRequirements.lowercase ||
                !passwordRequirements.number ||
                !passwordRequirements.specialChar
              }
            >
              Change Password
            </Button>
            <Button variant="outlined" color="secondary">
              Cancel
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" mt={2}>
            Choose a strong password that you haven’t used before to ensure
            account safety.
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}