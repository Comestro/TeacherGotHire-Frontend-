import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  TablePagination,
  Badge,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";
import { getRecruiter } from "../../services/adminManageRecruiter";
import { Link } from "react-router-dom";

const ManageRecruiter = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Fetch recruiters data from the API
    getRecruiter()
      .then(response => {
        if (response && Array.isArray(response)) {
          const formattedRecruiters = response.map(item => ({
            id: item.id,
            name: `${item.Fname} ${item.Lname}`,
            email: item.email,
            phone: item.profiles?.phone_number || 'N/A',
            gender: item.profiles?.gender || 'N/A',
            status: item.is_verified ? 'Verified' : 'Pending',
          }));
          setRecruiters(formattedRecruiters);
        } else {
          console.error('Unexpected response structure:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching recruiters:', error);
      });
  }, []);

  const handleViewRecruiter = (recruiter) => {
    setCurrentRecruiter(recruiter);
    setIsViewModalOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportData = () => {
    const csvContent = [
      [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Gender",
        "Status",
      ],
      ...recruiters.map((recruiter) => [
        recruiter.id,
        recruiter.name,
        recruiter.email,
        recruiter.phone,
        recruiter.gender,
        recruiter.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "recruiters_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecruiters = recruiters.filter((recruiter) => {
    return (
      (recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.id.toString().includes(searchQuery)) &&
      (selectedGender
        ? recruiter.gender.toLowerCase() === selectedGender.toLowerCase()
        : true) &&
      (selectedStatus
        ? recruiter.status.toLowerCase() === selectedStatus.toLowerCase()
        : true)
    );
  });

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Manage Recruiters
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
        </Box>
        <Box mt={2} mb={2}>
          <TextField
            label="Search Recruiters"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Recruiter Gender</InputLabel>
            <Select
              label="Recruiter Gender"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Recruiter Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecruiters
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((recruiter) => (
                <TableRow key={recruiter.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRecruiters.includes(recruiter.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecruiters([
                            ...selectedRecruiters,
                            recruiter.id,
                          ]);
                        } else {
                          setSelectedRecruiters(
                            selectedRecruiters.filter(
                              (id) => id !== recruiter.id
                            )
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{recruiter.name}</TableCell>
                  <TableCell><Link to={`https://api.whatsapp.com/send/?phone=${recruiter.phone}`}>{recruiter.phone}</Link></TableCell>
                  <TableCell>{recruiter.email}</TableCell>
                  <TableCell>{recruiter.gender}</TableCell>
                  <TableCell>
                    <Badge
                      color={
                        recruiter.status === "Verified"
                          ? "primary"
                          : recruiter.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                      badgeContent={recruiter.status}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewRecruiter(recruiter)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton>
                      <EmailIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredRecruiters.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <DialogTitle>View Recruiter</DialogTitle>
          <DialogContent>
            <Typography variant="h6">
              Full Name: {currentRecruiter?.name}
            </Typography>
            <Typography variant="h6">
              Email Address: {currentRecruiter?.email}
            </Typography>
            <Typography variant="h6">
              Phone Number: {currentRecruiter?.phone}
            </Typography>
            <Typography variant="h6">
              Gender: {currentRecruiter?.gender}
            </Typography>
            <Typography variant="h6">
              Status: {currentRecruiter?.status}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsViewModalOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          message={notification.message}
          severity={notification.type}
        />
      </Container>
    </Layout>
  );
};

export default ManageRecruiter;