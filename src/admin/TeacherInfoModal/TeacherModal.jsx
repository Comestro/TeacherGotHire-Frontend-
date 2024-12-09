import React from 'react';
import { Modal, Box, CardContent } from '@mui/material';
import TeacherProfile from './TeacherProfile';
import TeacherSkills from './TeacherSkills';
import TeacherQualifications from './TeacherQualifications';
import TeacherExperience from './TeacherExperience';

const TeacherModal = ({ open, onClose, teacherData }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      p={4}
      bgcolor="background.paper"
      sx={{
        width: "90%",
        maxWidth: "800px",
        margin: "auto",
        marginTop: "5%",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <CardContent id="pdf-content">
        <TeacherProfile teacherData={teacherData} />
        <TeacherSkills skills={teacherData.skills} />
        <TeacherQualifications qualifications={teacherData.qualifications} />
        <TeacherExperience experience={teacherData.experience} />
      </CardContent>
    </Box>
  </Modal>
);

export default TeacherModal;