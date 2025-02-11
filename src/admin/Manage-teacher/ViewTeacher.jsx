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
import { getTeacherById } from "../../services/adminTeacherApi";
import { useParams } from "react-router-dom";

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
        const response = await getTeacherById(id);

        console.log("API Raw Response:", response);

        const data = response;

        if (!data || !data.id) {
          console.error("No response or invalid format", data);
          setTeacherData(null);
          return;
        }

        console.log("API Parsed Data:", data);

        const formattedData = {
          id: data.id,
          name: `${data.Fname || ""} ${data.Lname || " NA"}`.trim(),
          email: data.email || "N/A",
          phone: data.phone || "N/A",
          address: data.teachersaddress?.length
            ? data.teachersaddress[0]
            : null,
          registrationDate: data.registrationDate || "N/A",
          status: data.status || "N/A",
          skills: data.teacherskill?.map((s) => s?.skill?.name || "N/A") || [],
          experiences: data.teacherexperiences || [],
          qualifications:
            data.teacherqualifications?.map(
              (q) => q?.qualification?.name || "N/A"
            ) || [],
          preferences: data.preferences?.[0] || {},
          totalMarks: data.total_marks || 0,
        };

        console.log("Formatted Data:", formattedData);
        setTeacherData(formattedData);
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
        {teacherData && (
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              <Tab label="Skills" />
              <Tab label="Qualifications" />
              <Tab label="Experience" />
              <Tab label="Test Scores" />
            </Tabs>
            {tabValue === 0 && <SkillsCard skills={teacherData.skills} />}
            {tabValue === 1 && (
              <QualificationsCard qualifications={teacherData.qualifications} />
            )}
            {tabValue === 2 && (
              <ExperienceCard experience={teacherData.experiences} />
            )}
            {tabValue === 3 && (
              <TeacherTestScorePage teacherData={teacherData} />
            )}
          </>
        )}

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
            onClose={() => {}}
            teacherData={teacherData}
          />
        )}
      </Box>
    </Layout>
  );
};

export default ViewTeacherAdmin;
