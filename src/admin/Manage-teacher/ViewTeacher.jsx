import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  GetApp as ExportIcon,
  Delete as DeleteIcon,
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
import { getTeacherProfile, getTeacherSkills } from "../../services/adminTeacherApi";


const ViewTeacherAdmin = () => {
  const { id } = useParams();
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await getTeacherProfile(id);
        setTeacherData(response);
        console.log("Teacher data:", teacherData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setTeacherData(null);
      }
    };

    fetchTeacherData();
  }, [id]);
  

  const handleDownloadProfile = () => {
    setOpenDownloadModal(true);
    setTimeout(() => {
      const content = document.querySelector("#pdf-content");
      if (!content) {
        console.error("PDF content not found");
        setOpenDownloadModal(false);
        return;
      }

      html2canvas(content, { scale: 2, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("teacher-profile.pdf");
          setOpenDownloadModal(false);
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setOpenDownloadModal(false);
        });
    }, 100);
  };

  const handleDeactivate = () => {
    setOpenDeactivateModal(false);
    setOpenSnackbar(true);
    console.log("Account deactivated");
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Layout>
      <Box p={3}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#3f51b5", fontWeight: "bold", marginBottom: "20px" }}
        >
          Teacher Information
        </Typography>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExportIcon />}
            style={{ marginRight: 8 }}
            onClick={handleDownloadProfile}
          >
            Download Profile
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDeactivateModal(true)}
          >
            Deactivate Account
          </Button>
        </Box>
        <TeacherCard teacherData={teacherData} />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          style={{ marginTop: 20 }}
        >
          <Tab label="Skills" />
          <Tab label="Qualifications" />
          <Tab label="Experience" />
          <Tab label="Test Scores" />
        </Tabs>
        {tabValue === 0 && <SkillsCard userId={teacherData?.id || 3} />}
        {/* {tabValue === 1 && (
          <QualificationsCard qualifications={teacherData.qualifications} />
        )} */}
        {/* {tabValue === 2 && (
          <ExperienceCard experience={teacherData.experiences} />
        )} */}
        {/* {tabValue === 3 && (
          <TeacherTestScorePage teacherData={teacherData} />
        )} */}

        <Modal
          open={openDeactivateModal}
          onClose={() => setOpenDeactivateModal(false)}
        >
          <Box
            p={3}
            bgcolor="background.paper"
            style={{
              width: "90%",
              maxWidth: "400px",
              margin: "auto",
              marginTop: "10%",
            }}
          >
            <Typography variant="h6">Confirm Deactivation</Typography>
            <Typography variant="body1">
              Are you sure you want to deactivate this account?
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeactivate}
                style={{ marginRight: 8 }}
              >
                Confirm
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenDeactivateModal(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message="Account deactivated successfully"
        />

        {teacherData && (
          <TeacherModal
            open={openDownloadModal}
            onClose={() => { }}
            teacherData={teacherData}
          />
        )}
      </Box>
    </Layout>
  );
};

export default ViewTeacherAdmin;
