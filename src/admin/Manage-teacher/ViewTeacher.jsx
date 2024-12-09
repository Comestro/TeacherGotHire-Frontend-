import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Badge,
  Modal,
  Snackbar,
  Grid,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import AnalyticsCard from "./AnalyticsCard";
import TeacherModal from "../TeacherInfoModal/TeacherModal";

const ViewTeacherAdmin = () => {
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [teacherData] = useState({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 9876543210",
    address: "123 MG Road, Bengaluru, Karnataka, India",
    registrationDate: "March 15, 2018",
    status: "Active",
    profilePic:
      "https://images.unsplash.com/photo-1542190891-2093d38760f2?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    skills: ["Mathematics", "Physics", "Communication Skills"],
    qualifications: [
      {
        degree: "B.Ed.",
        institution: "Bangalore University",
        year: 2015,
        certification: "Certified Teacher",
      },
      {
        degree: "M.Sc.",
        institution: "Delhi University",
        year: 2013,
        certification: "Certified Teacher",
      },
    ],
    experience: [
      {
        title: "Science Teacher",
        institution: "XYZ High School",
        duration: "2016-2020",
        description: "Taught science subjects to high school students.",
      },
      {
        title: "Math Teacher",
        institution: "ABC School",
        duration: "2013-2016",
        description: "Taught mathematics to middle school students.",
      },
    ],
    analytics: {
      profileViews: [
        { date: "2023-01-01", views: 10 },
        { date: "2023-01-02", views: 15 },
        { date: "2023-01-03", views: 20 },
        { date: "2023-01-04", views: 25 },
        { date: "2023-01-05", views: 30 },
      ],
      jobMatches: [
        { job: "Math Teacher", matches: 5 },
        { job: "Science Teacher", matches: 8 },
        { job: "Physics Teacher", matches: 3 },
      ],
      feedbackRatings: [
        { rating: 5, count: 10 },
        { rating: 4, count: 5 },
        { rating: 3, count: 2 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 },
      ],
    },
    testimonials: "Great teacher with excellent skills.",
    portfolio:
      "https://images.unsplash.com/photo-1542190891-2093d38760f2?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  const handleDownloadProfile = () => {
    setOpenDownloadModal(true);
    setTimeout(() => {
      const content = document.querySelector("#pdf-content");

      html2canvas(content, { scale: 2, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("teacher-profile.pdf");
          setOpenDownloadModal(false); // Close the modal immediately after initiating the download
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
    // Add logic to handle account deactivation
    console.log("Account deactivated");
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
        <SkillsCard skills={teacherData.skills} />
        <QualificationsCard qualifications={teacherData.qualifications} />
        <ExperienceCard experience={teacherData.experience} />
        <AnalyticsCard analytics={teacherData.analytics} />

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
        {/* download pdf generation */}
        <TeacherModal open={openDownloadModal} onClose={() => {}} teacherData={teacherData} />
      </Box>
    </Layout>
  );
};

export default ViewTeacherAdmin;