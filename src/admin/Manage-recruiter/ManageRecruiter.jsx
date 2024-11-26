import React, { useState } from "react";
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
  Grid,
  Paper,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const ManageRecruiter = () => {
  const [recruiters, setRecruiters] = useState([
    {
      id: 1,
      name: "Delhi Public School",
      email: "contact@dpsdelhi.in",
      phone: "011-12345678",
      type: "School",
      location: "Delhi",
      status: "Verified",
      totalHires: 120,
    },
    {
      id: 2,
      name: "Vidyamandir Classes",
      email: "info@vidyamandir.com",
      phone: "022-87654321",
      type: "Coaching Institute",
      location: "Mumbai",
      status: "Pending",
      totalHires: 80,
    },
    {
      id: 3,
      name: "Kendriya Vidyalaya",
      email: "kvbengaluru@kv.in",
      phone: "080-23456789",
      type: "School",
      location: "Bangalore",
      status: "Verified",
      totalHires: 150,
    },
    {
      id: 4,
      name: "FIITJEE",
      email: "support@fiitjee.com",
      phone: "044-98765432",
      type: "Coaching Institute",
      location: "Chennai",
      status: "Rejected",
      totalHires: 60,
    },
    {
      id: 5,
      name: "Hyderabad Public School",
      email: "admin@hpshyd.edu",
      phone: "040-12345678",
      type: "School",
      location: "Hyderabad",
      status: "Verified",
      totalHires: 110,
    },
    {
      id: 6,
      name: "Pune Institute of Technology",
      email: "contact@pitpune.ac.in",
      phone: "020-87654321",
      type: "Coaching Institute",
      location: "Pune",
      status: "Pending",
      totalHires: 90,
    },
    {
      id: 7,
      name: "St. Xavier's College",
      email: "info@stxavierskolkata.edu",
      phone: "033-23456789",
      type: "School",
      location: "Kolkata",
      status: "Verified",
      totalHires: 130,
    },
    {
      id: 8,
      name: "Cochin International School",
      email: "admin@ciscochin.edu",
      phone: "0484-98765432",
      type: "School",
      location: "Kochi",
      status: "Rejected",
      totalHires: 70,
    },
    {
      id: 9,
      name: "Jaipur National University",
      email: "contact@jnujaipur.ac.in",
      phone: "0141-12345678",
      type: "Coaching Institute",
      location: "Jaipur",
      status: "Verified",
      totalHires: 100,
    },
    {
      id: 10,
      name: "Ahmedabad International School",
      email: "info@aisahmedabad.edu",
      phone: "079-87654321",
      type: "School",
      location: "Ahmedabad",
      status: "Pending",
      totalHires: 85,
    },
    {
      id: 11,
      name: "Thiruvananthapuram Model School",
      email: "admin@tmschool.edu",
      phone: "0471-23456789",
      type: "School",
      location: "Thiruvananthapuram",
      status: "Verified",
      totalHires: 95,
    },
    {
      id: 12,
      name: "Bhopal Coaching Center",
      email: "support@bccbhopal.com",
      phone: "0755-98765432",
      type: "Coaching Institute",
      location: "Bhopal",
      status: "Rejected",
      totalHires: 50,
    },
  ]);
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddRecruiter = () => {
    setCurrentRecruiter(null);
    setIsEditModalOpen(true);
  };

  const handleEditRecruiter = (recruiter) => {
    setCurrentRecruiter(recruiter);
    setIsEditModalOpen(true);
  };

  const handleViewRecruiter = (recruiter) => {
    setCurrentRecruiter(recruiter);
    setIsViewModalOpen(true);
  };

  const handleDeleteRecruiter = (recruiterId) => {
    setRecruiters(
      recruiters.filter((recruiter) => recruiter.id !== recruiterId)
    );
    setNotification({
      open: true,
      message: "Recruiter deleted successfully.",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    setRecruiters(
      recruiters.filter(
        (recruiter) => !selectedRecruiters.includes(recruiter.id)
      )
    );
    setSelectedRecruiters([]);
    setNotification({
      open: true,
      message: "Selected recruiters deleted successfully.",
      type: "success",
    });
  };

  const handleSaveRecruiter = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Recruiter saved successfully.",
      type: "success",
    });
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
        "Type",
        "Location",
        "Status",
        "Total Hires",
      ],
      ...recruiters.map((recruiter) => [
        recruiter.id,
        recruiter.name,
        recruiter.email,
        recruiter.phone,
        recruiter.type,
        recruiter.location,
        recruiter.status,
        recruiter.totalHires,
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
      (selectedType
        ? recruiter.type.toLowerCase() === selectedType.toLowerCase()
        : true) &&
      (selectedLocation
        ? recruiter.location.toLowerCase() === selectedLocation.toLowerCase()
        : true) &&
      (selectedStatus
        ? recruiter.status.toLowerCase() === selectedStatus.toLowerCase()
        : true) &&
      (selectedFrequency
        ? recruiter.frequency.toLowerCase() === selectedFrequency.toLowerCase()
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddRecruiter}
          >
            Add Recruiter
          </Button>
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
            <InputLabel>Recruiter Type</InputLabel>
            <Select
              label="Recruiter Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="school">School</MenuItem>
              <MenuItem value="coaching">Coaching Institute</MenuItem>
              <MenuItem value="individual">Individual</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Location</InputLabel>
            <Select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="delhi">Delhi</MenuItem>
              <MenuItem value="mumbai">Mumbai</MenuItem>
              <MenuItem value="bangalore">Bangalore</MenuItem>
              <MenuItem value="chennai">Chennai</MenuItem>
              <MenuItem value="hyderabad">Hyderabad</MenuItem>
              <MenuItem value="pune">Pune</MenuItem>
              <MenuItem value="kolkata">Kolkata</MenuItem>
              <MenuItem value="kochi">Kochi</MenuItem>
              <MenuItem value="jaipur">Jaipur</MenuItem>
              <MenuItem value="ahmedabad">Ahmedabad</MenuItem>
              <MenuItem value="thiruvananthapuram">Thiruvananthapuram</MenuItem>
              <MenuItem value="bhopal">Bhopal</MenuItem>
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
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Hiring Frequency</InputLabel>
            <Select
              label="Hiring Frequency"
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
              <TableCell>Recruiter Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Hires</TableCell>
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
                  <TableCell>{recruiter.phone}</TableCell>
                  <TableCell>{recruiter.type}</TableCell>
                  <TableCell>{recruiter.location}</TableCell>
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
                  <TableCell>{recruiter.totalHires}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewRecruiter(recruiter)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditRecruiter(recruiter)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteRecruiter(recruiter.id)}
                    >
                      <DeleteIcon />
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <DialogTitle>
            {currentRecruiter ? "Edit Recruiter" : "Add Recruiter"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentRecruiter ? currentRecruiter.name : ""}
            />
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentRecruiter ? currentRecruiter.email : ""}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentRecruiter ? currentRecruiter.phone : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Recruiter Type</InputLabel>
              <Select
                label="Recruiter Type"
                defaultValue={currentRecruiter ? currentRecruiter.type : ""}
              >
                <MenuItem value="school">School</MenuItem>
                <MenuItem value="coaching">Coaching Institute</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              margin="normal"
              defaultValue={currentRecruiter ? currentRecruiter.location : ""}
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                defaultValue={currentRecruiter ? currentRecruiter.status : ""}
              >
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveRecruiter} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
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
              Recruiter Type: {currentRecruiter?.type}
            </Typography>
            <Typography variant="h6">
              Location: {currentRecruiter?.location}
            </Typography>
            <Typography variant="h6">
              Status: {currentRecruiter?.status}
            </Typography>
            <Typography variant="h6">
              Total Hires: {currentRecruiter?.totalHires}
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
