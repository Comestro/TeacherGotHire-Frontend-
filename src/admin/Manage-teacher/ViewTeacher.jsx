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
} from "@mui/material";
import {
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Layout from "../Admin/Layout";
import TeacherCard from "./TeacherCard";
import SkillsCard from "./SkillCard";
import QualificationsCard from "./QualificationsCard";
import ExperienceCard from "./ExperienceCard";
import TeacherModal from "../TeacherInfoModal/TeacherModal";
import TeacherTestScorePage from "./TeacherTestScore";
import { useParams } from "react-router-dom";
import { getTeacherProfile } from "../../services/adminTeacherApi";

const ViewTeacherAdmin = () => {
  const theme = useTheme();
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
        setTeacherData(response);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setError("Failed to load teacher data. Please try again later.");
        setTeacherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  const handleDownloadProfile = () => {
    setOpenDownloadModal(true);
    setDownloadLoading(true);

    setTimeout(() => {
      const content = document.querySelector("#pdf-content");
      if (!content) {
        console.error("PDF content not found");
        setOpenDownloadModal(false);
        setDownloadLoading(false);

        setOpenSnackbar(true);
        setNotificationMessage({
          type: "error",
          text: "Failed to generate PDF. Please try again."
        });
        return;
      }

      html2canvas(content, { scale: 2, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`teacher-profile-${teacherData?.id || 'download'}.pdf`);

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
    }, 500);
  };

  const [notificationMessage, setNotificationMessage] = useState({
    type: "success",
    text: "Account deactivated successfully"
  });

  const handleDeactivate = () => {
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

  return (
    <Layout>
      <Box p={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Header section with title and action buttons in same row */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={{ xs: 1.5, sm: 2 }}
          mb={{ xs: 2, sm: 3 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              mb: { xs: 1, md: 0 },
              lineHeight: 1.2
            }}
          >
            Teacher Information
          </Typography>

          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 1.5, sm: 2 }}
            width={{ xs: '100%', md: 'auto' }}
          >
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ExportIcon />}
              onClick={handleDownloadProfile}
              disabled={loading || !teacherData}
              fullWidth={isMobile}
              size={isMobile ? "medium" : "large"}
              sx={{
                boxShadow: 2,
                textTransform: 'none',
                minWidth: { xs: '100%', sm: 'auto' },
                py: { xs: 1, sm: 'auto' }
              }}
            >
              Download Profile
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeactivateModal(true)}
              disabled={loading || !teacherData}
              fullWidth={isMobile}
              size={isMobile ? "medium" : "large"}
              sx={{
                boxShadow: 2,
                textTransform: 'none',
                minWidth: { xs: '100%', sm: 'auto' },
                py: { xs: 1, sm: 'auto' }
              }}
            >
              Deactivate Account
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : !teacherData ? (
          <Alert severity="info" sx={{ mb: 3 }}>No teacher data available.</Alert>
        ) : (
          <>
            <TeacherCard teacherData={teacherData} />

            <Paper
              elevation={3}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                overflow: "hidden",
                mt: { xs: 2, sm: 3 },
                mb: 2
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
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    minWidth: { xs: 'auto', sm: '160px' },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 48, sm: 'auto' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 3 }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3
                  }
                }}
              >
                <Tab label="Skills" />
                <Tab label="Qualifications" />
                <Tab label="Experience" />
                <Tab label="Test Scores" />
              </Tabs>
            </Paper>

            <Box mt={{ xs: 2, sm: 3 }}>
              {tabValue === 0 && <SkillsCard userId={teacherData.id} />}
              {tabValue === 1 && <QualificationsCard userId={teacherData.id} />}
              {tabValue === 2 && <ExperienceCard userId={teacherData.id} />}
              {tabValue === 3 && <TeacherTestScorePage userId={teacherData.id} />}
            </Box>
          </>
        )}

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
              borderRadius: { xs: 2, sm: 2 },
              boxShadow: 24,
              p: { xs: 2.5, sm: 4 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600 }}>
                Confirm Deactivation
              </Typography>

              {isMobile && (
                <IconButton
                  size="small"
                  onClick={() => setOpenDeactivateModal(false)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to deactivate this account? This action cannot be undone.
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
                  minWidth: { xs: '100%', sm: 'auto' }
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
                  minWidth: { xs: '100%', sm: 'auto' }
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
          sx={{ bottom: { xs: 70, sm: 'auto' } }} // Position above bottom nav on mobile
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={notificationMessage.type}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: 3
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
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={downloadLoading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 2, color: 'white' }}>
              Generating PDF...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
};

export default ViewTeacherAdmin;