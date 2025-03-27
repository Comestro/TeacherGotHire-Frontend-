import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Snackbar,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Backdrop,
  IconButton,
  Breadcrumbs,
  Divider,
  Card,
  Link as MuiLink,
  Tooltip,
} from "@mui/material";
import {
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../Admin/Layout";
import TeacherCard from "./TeacherCard";
import SkillsCard from "./SkillCard";
import QualificationsCard from "./QualificationsCard";
import ExperienceCard from "./ExperienceCard";
import TeacherModal from "../TeacherInfoModal/TeacherModal";
import TeacherTestScorePage from "./TeacherTestScore";
import { getTeacherProfile } from "../../services/adminTeacherApi";

const ViewTeacherAdmin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { id } = useParams();
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTeacherProfile(id);
        console.log("API Response:", response);

        // Map the API field names to the expected property names
        const mappedData = {
          ...response,
          firstName: response.Fname, // Map Fname to firstName
          lastName: response.Lname,  // Map Lname to lastName
          id: response.id,
          email: response.email,
          isActive: response.is_verified, // Map is_verified to isActive
          // Add default values for other fields that might be needed
          phone: response.phone || "Not provided",
          address: response.address || "Not provided",
          currentPosition: response.position || "Not specified",
          highestQualification: response.qualification || "Not specified",
          bio: response.bio || "No bio information available."
        };

        setTeacherData(mappedData);

        // Set page title with teacher name if available
        if (response?.Fname && response?.Lname) {
          document.title = `${response.Fname} ${response.Lname} | Profile`;
        } else {
          document.title = "Teacher Profile";
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError("Failed to load teacher data. Please try again later.");
        setTeacherData(null);
        document.title = "Error | Teacher Profile";
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();

    // Reset title on unmount
    return () => {
      document.title = "Teacher Management";
    };
  }, [id]);

  const handleDownloadProfile = () => {
    if (!teacherData) {
      setNotificationMessage({
        type: "error",
        text: "No teacher data available to download"
      });
      setOpenSnackbar(true);
      return;
    }

    console.log("Teacher data for PDF:", teacherData);

    // Make sure we have name data - check both mapped and original fields
    const firstName = teacherData.firstName || teacherData.Fname || "Teacher";
    const lastName = teacherData.lastName || teacherData.Lname || "Profile";

    setOpenDownloadModal(true);
    setDownloadLoading(true);

    // Longer delay to allow modal to fully render
    setTimeout(() => {
      const contentElement = document.getElementById("teacher-pdf-content");
      if (!contentElement) {
        console.error("PDF content element not found");
        setDownloadLoading(false);
        setOpenDownloadModal(false);

        setNotificationMessage({
          type: "error",
          text: "Failed to generate PDF. Please try again."
        });
        setOpenSnackbar(true);
        return;
      }

      // Use html2canvas with better settings for quality
      html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging to debug issues
        backgroundColor: "#ffffff",
        allowTaint: true, // Allow cross-origin images
        foreignObjectRendering: false, // Disable foreignObject rendering which can cause issues
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          // Calculate dimensions
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10; // Small margin at top

          // Add image and metadata at the bottom
          pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

          const currentDate = new Date().toLocaleDateString();
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Generated on ${currentDate}`, 10, pdfHeight - 10);

          // Use our safely-extracted name variables
          pdf.text(`Teacher Profile: ${firstName} ${lastName}`, pdfWidth - 10, pdfHeight - 10, {
            align: "right"
          });

          // Generate safe filename
          const safeFileName = `${firstName}_${lastName}_Profile.pdf`.replace(/\s+/g, '_');

          // Save with a proper filename
          pdf.save(safeFileName);

          setNotificationMessage({
            type: "success",
            text: "Profile downloaded successfully!"
          });
          setOpenSnackbar(true);
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setNotificationMessage({
            type: "error",
            text: "Failed to generate PDF. Please try again."
          });
          setOpenSnackbar(true);
        })
        .finally(() => {
          setDownloadLoading(false);
          setOpenDownloadModal(false);
        });
    }, 1000); // Increased delay to 1000ms (1 second)
  };


  const [notificationMessage, setNotificationMessage] = useState({
    type: "success",
    text: "Account deactivated successfully"
  });

  const handleDeactivate = () => {
    // Here you would add the actual API call to deactivate the account
    setOpenDeactivateModal(false);
    setNotificationMessage({
      type: "success",
      text: "Account deactivated successfully"
    });
    setOpenSnackbar(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate("/admin/manage/teacher");
  };

  return (
    <Layout>
      <Box
        p={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{
          backgroundColor: "#f9fafc",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Breadcrumbs Navigation */}
        <Box
          mb={{ xs: 2, sm: 3 }}
        >
          <Button
            onClick={handleBackClick}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              mb: 2,
              textTransform: 'none',
              borderRadius: 1.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
              }
            }}
          >
            Back to Teacher List
          </Button>

          <Breadcrumbs
            aria-label="breadcrumb"
            separator="›"
            sx={{
              mt: 1,
              '& .MuiBreadcrumbs-separator': {
                mx: 1,
                color: 'text.secondary'
              }
            }}
          >
            <MuiLink
              component={Link}
              to="/admin/dashboard"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Dashboard
            </MuiLink>
            <MuiLink
              component={Link}
              to="/admin/manage/teacher"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Manage Teachers
            </MuiLink>
            <Typography
              color="text.primary"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 500
              }}
            >
              {loading ? 'Loading...' :
                (teacherData && (teacherData.firstName || teacherData.Fname)) ?
                  `${teacherData.firstName || teacherData.Fname} ${teacherData.lastName || teacherData.Lname}` :
                  'Teacher Profile'}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Main content card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3,
            backgroundColor: 'white',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header section with title and action buttons */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(to right, #f5f7fa, #ffffff)',
            }}
          >
            <Box
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              gap={{ xs: 1.5, sm: 2 }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                    mb: 0.5,
                    lineHeight: 1.2
                  }}
                >
                  Teacher Information
                </Typography>
                {teacherData && (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {teacherData.firstName || teacherData.Fname} {teacherData.lastName || teacherData.Lname} {(teacherData.isActive || teacherData.is_verified) ?
                      <Typography component="span" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.8rem', ml: 1, border: '1px solid', borderColor: 'success.main', px: 1, py: 0.25, borderRadius: 10 }}>
                        ACTIVE
                      </Typography> :
                      <Typography component="span" sx={{ color: 'error.main', fontWeight: 600, fontSize: '0.8rem', ml: 1, border: '1px solid', borderColor: 'error.main', px: 1, py: 0.25, borderRadius: 10 }}>
                        INACTIVE
                      </Typography>
                    }
                  </Typography>
                )}
              </Box>

              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 1.5, sm: 2 }}
                width={{ xs: '100%', md: 'auto' }}
                mt={{ xs: 2, md: 0 }}
              >
                <Tooltip title="Download teacher profile as PDF">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ExportIcon />}
                    onClick={handleDownloadProfile}
                    disabled={loading || !teacherData}
                    fullWidth={isMobile}
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      borderRadius: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: '160px' },
                      py: { xs: 1, sm: 1 },
                      '&:hover': {
                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Download Profile
                  </Button>
                </Tooltip>
                <Tooltip title="Deactivate this teacher's account">
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDeactivateModal(true)}
                    disabled={loading || !teacherData}
                    fullWidth={isMobile}
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      borderRadius: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: '160px' },
                      py: { xs: 1, sm: 1 },
                      '&:hover': {
                        boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Deactivate Account
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Content area */}
          <Box p={{ xs: 2, sm: 3 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px" flexDirection="column">
                <CircularProgress size={40} />
                <Typography mt={2} color="text.secondary">Loading teacher information...</Typography>
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                {error}
              </Alert>
            ) : !teacherData ? (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                No teacher data available.
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    backgroundColor: "#f9fbfd",
                    borderRadius: 2,
                    p: { xs: 1.5, sm: 2 },
                    mb: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <TeacherCard teacherData={teacherData} />
                </Box>

                <Paper
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    mt: { xs: 2, sm: 3 },
                    mb: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons={isMobile ? "auto" : true}
                    allowScrollButtonsMobile={true}
                    aria-label="teacher information tabs"
                    sx={{
                      backgroundColor: 'background.paper',
                      minHeight: { xs: 48, sm: 'auto' },
                      '& .MuiTabs-flexContainer': {
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                      },
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: { xs: 'auto', sm: '160px' },
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        minHeight: { xs: 48, sm: 'auto' },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 2, sm: 3 },
                        color: 'text.secondary',
                        '&.Mui-selected': {
                          color: 'primary.main',
                          fontWeight: 700,
                        }
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderTopLeftRadius: 3,
                        borderTopRightRadius: 3,
                      }
                    }}
                  >
                    <Tab label="Skills" />
                    <Tab label="Qualifications" />
                    <Tab label="Experience" />
                    <Tab label="Test Scores" />
                  </Tabs>

                  <Box p={{ xs: 2, sm: 3 }}>
                    {tabValue === 0 && <SkillsCard userId={teacherData.id} />}
                    {tabValue === 1 && <QualificationsCard userId={teacherData.id} />}
                    {tabValue === 2 && <ExperienceCard userId={teacherData.id} />}
                    {tabValue === 3 && <TeacherTestScorePage userId={teacherData.id} />}
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        </Card>

        {/* Deactivation Modal */}
        <Modal
          open={openDeactivateModal}
          onClose={() => setOpenDeactivateModal(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '400px' },
              maxWidth: '95%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                Confirm Deactivation
              </Typography>

              <IconButton
                size="small"
                onClick={() => setOpenDeactivateModal(false)}
                sx={{ ml: 1 }}
                aria-label="close"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, backgroundColor: 'error.lighter', borderRadius: 1.5 }}>
              <InfoIcon color="error" sx={{ mr: 1.5, fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 500 }}>
                This action permanently removes this teacher's access to the platform.
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to deactivate <strong>{teacherData?.firstName} {teacherData?.lastName}'s</strong> account? This action cannot be undone.
            </Typography>

            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1.5, sm: 2 }}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                onClick={() => setOpenDeactivateModal(false)}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 2, sm: 1 },
                  minWidth: { xs: '100%', sm: 'auto' },
                  borderRadius: 1.5,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeactivate}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  order: { xs: 1, sm: 2 },
                  minWidth: { xs: '100%', sm: 'auto' },
                  borderRadius: 1.5,
                }}
              >
                Deactivate
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{
            vertical: isMobile ? 'top' : 'bottom',
            horizontal: 'center'
          }}
          sx={{ bottom: { xs: 70, sm: 24 }, zIndex: theme.zIndex.snackbar }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={notificationMessage.type}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: 3,
              borderRadius: 1.5,
            }}
          >
            {notificationMessage.text}
          </Alert>
        </Snackbar>

        {/* Download Modal & Loading Backdrop */}
        {teacherData && (
          <TeacherModal
            open={openDownloadModal}
            onClose={() => {
              if (!downloadLoading) setOpenDownloadModal(false);
            }}
            teacherData={teacherData}
          />
        )}

        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(4px)'
          }}
          open={downloadLoading}
        >
          <Box sx={{
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            maxWidth: '80%'
          }}>
            <CircularProgress color="inherit" size={36} thickness={4} />
            <Typography sx={{ mt: 2, color: 'white', fontWeight: 500, letterSpacing: '0.5px' }}>
              Generating professional PDF...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ViewTeacherAdmin;