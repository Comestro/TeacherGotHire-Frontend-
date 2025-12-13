import React, { useEffect } from 'react';
import { Box, Typography, Modal, Grid, Divider, Avatar, Paper } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

const TeacherModal = ({ open, onClose, teacherData }) => {
  if (!teacherData) return null;
  const firstName = teacherData.firstName || teacherData.Fname || "Teacher";
  const lastName = teacherData.lastName || teacherData.Lname || "Profile";
  const email = teacherData.email || "No email provided";
  const isActive = teacherData.isActive || teacherData.is_verified || false;
  const phone = teacherData.phone || "No phone provided";
  const address = teacherData.address || "No address provided";
  const currentPosition = teacherData.currentPosition || "Not specified";
  const highestQualification = teacherData.highestQualification || "Not specified";
  const bio = teacherData.bio || "No bio information available.";
  const profilePicture = teacherData.profilePicture || "";
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const content = document.getElementById('teacher-pdf-content');
        if (content) {
          content.style.transform = 'translateZ(0)';
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="teacher-profile-modal"
      aria-describedby="teacher-profile-details"
    >
      <Box
        id="teacher-pdf-content"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, // Fixed width for PDF consistency
          maxWidth: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'white', // Use plain white for PDF
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          mx: 2,
          '@media print': {
            position: 'static',
            transform: 'none',
            width: '100%',
            boxShadow: 'none',
            p: 0,
          }
        }}
      >
        {/* Header with logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #f0f0f0',
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#2a41e8' }}>
            TEACHER PROFILE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {teacherData.id || 'N/A'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            mb: 4,
          }}
        >
          <Avatar
            src={profilePicture}
            alt={`${firstName} ${lastName}`}
            sx={{
              width: 120,
              height: 120,
              mb: { xs: 2, sm: 0 },
              mr: { xs: 0, sm: 3 },
              border: '3px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              bgcolor: 'primary.main',
              fontSize: 48,
            }}
          >
            {firstName.charAt(0)}{lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {firstName} {lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {email}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1 
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: isActive ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid',
                  borderColor: isActive ? 'success.main' : 'error.main',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">{email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">{phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">
                  {address}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
                Professional Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">
                  {currentPosition}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Typography variant="body1">
                  {highestQualification}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2, mt: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {bio}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            textAlign: 'center',
            borderTop: '1px dashed',
            borderColor: 'divider',
            pt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            This document contains confidential information about {firstName} {lastName} and is intended for internal use only.
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default TeacherModal;