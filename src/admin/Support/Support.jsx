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
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../Admin/Layout";

const Support = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      userName: "John Doe",
      contact: "john.doe@example.com",
      issueSummary: "Unable to login to my account",
      category: "Account Issues",
      status: "Open",
      priority: "High",
      dateCreated: "2023-01-01",
      lastUpdated: "2023-01-02",
    },
    {
      id: 2,
      userName: "Jane Smith",
      contact: "jane.smith@example.com",
      issueSummary: "Payment not processed",
      category: "Payment Issues",
      status: "In Progress",
      priority: "Medium",
      dateCreated: "2023-01-03",
      lastUpdated: "2023-01-04",
    },
    {
      id: 3,
      userName: "Alice Johnson",
      contact: "alice.johnson@example.com",
      issueSummary: "Technical issue with the website",
      category: "Technical Support",
      status: "Resolved",
      priority: "Low",
      dateCreated: "2023-01-05",
      lastUpdated: "2023-01-06",
    },
    {
      id: 4,
      userName: "Bob Brown",
      contact: "bob.brown@example.com",
      issueSummary: "Feedback on the new feature",
      category: "Feedback",
      status: "Closed",
      priority: "Low",
      dateCreated: "2023-01-07",
      lastUpdated: "2023-01-08",
    },
    {
      id: 5,
      userName: "Charlie Davis",
      contact: "charlie.davis@example.com",
      issueSummary: "Other issue",
      category: "Other",
      status: "Open",
      priority: "High",
      dateCreated: "2023-01-09",
      lastUpdated: "2023-01-10",
    },
  ]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddTicket = () => {
    setCurrentTicket(null);
    setIsEditModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setCurrentTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setCurrentTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
    setNotification({
      open: true,
      message: "Ticket deleted successfully.",
      type: "success",
    });
  };

  const handleBulkDelete = () => {
    setTickets(
      tickets.filter((ticket) => !selectedTickets.includes(ticket.id))
    );
    setSelectedTickets([]);
    setNotification({
      open: true,
      message: "Selected tickets deleted successfully.",
      type: "success",
    });
  };

  const handleSaveTicket = () => {
    // Add save logic here
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Ticket saved successfully.",
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
      ["ID", "User Name", "Contact", "Issue Summary", "Category", "Status", "Priority", "Date Created", "Last Updated"],
      ...tickets.map(ticket => [
        ticket.id,
        ticket.userName,
        ticket.contact,
        ticket.issueSummary,
        ticket.category,
        ticket.status,
        ticket.priority,
        ticket.dateCreated,
        ticket.lastUpdated
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "support_tickets.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickets = tickets.filter((ticket) => {
    return (
      (ticket.issueSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toString().includes(searchQuery)) &&
      (selectedStatus ? ticket.status.toLowerCase() === selectedStatus.toLowerCase() : true) &&
      (selectedCategory ? ticket.category.toLowerCase() === selectedCategory.toLowerCase() : true) &&
      (selectedPriority ? ticket.priority.toLowerCase() === selectedPriority.toLowerCase() : true)
    );
  });

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Support Center
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTicket}
          >
            Create New Ticket
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
            label="Search Tickets"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
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
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="account issues">Account Issues</MenuItem>
              <MenuItem value="payment issues">Payment Issues</MenuItem>
              <MenuItem value="technical support">Technical Support</MenuItem>
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Ticket ID</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Issue Summary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTickets([
                            ...selectedTickets,
                            ticket.id,
                          ]);
                        } else {
                          setSelectedTickets(
                            selectedTickets.filter((id) => id !== ticket.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.userName}</TableCell>
                  <TableCell>{ticket.issueSummary}</TableCell>
                  <TableCell>
                    <Badge
                      color={
                        ticket.status === "Open"
                          ? "error"
                          : ticket.status === "In Progress"
                          ? "warning"
                          : "success"
                      }
                      badgeContent={ticket.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={
                        ticket.priority === "High"
                          ? "error"
                          : ticket.priority === "Medium"
                          ? "warning"
                          : "primary"
                      }
                      badgeContent={ticket.priority}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewTicket(ticket)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditTicket(ticket)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTicket(ticket.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTickets.length}
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
            {currentTicket ? "Edit Ticket" : "Add Ticket"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="User Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentTicket ? currentTicket.userName : ""}
              onChange={(e) =>
                setCurrentTicket({ ...currentTicket, userName: e.target.value })
              }
            />
            <TextField
              label="Contact"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentTicket ? currentTicket.contact : ""}
              onChange={(e) =>
                setCurrentTicket({ ...currentTicket, contact: e.target.value })
              }
            />
            <TextField
              label="Issue Summary"
              variant="outlined"
              fullWidth
              margin="normal"
              value={currentTicket ? currentTicket.issueSummary : ""}
              onChange={(e) =>
                setCurrentTicket({
                  ...currentTicket,
                  issueSummary: e.target.value,
                })
              }
            />
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={currentTicket ? currentTicket.category : ""}
                onChange={(e) =>
                  setCurrentTicket({ ...currentTicket, category: e.target.value })
                }
              >
                <MenuItem value="account issues">Account Issues</MenuItem>
                <MenuItem value="payment issues">Payment Issues</MenuItem>
                <MenuItem value="technical support">Technical Support</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={currentTicket ? currentTicket.status : ""}
                onChange={(e) =>
                  setCurrentTicket({ ...currentTicket, status: e.target.value })
                }
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={currentTicket ? currentTicket.priority : ""}
                onChange={(e) =>
                  setCurrentTicket({
                    ...currentTicket,
                    priority: e.target.value,
                  })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveTicket} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <DialogTitle>View Ticket</DialogTitle>
          <DialogContent>
            {currentTicket && (
              <>
                <Typography variant="h6">Ticket ID: {currentTicket.id}</Typography>
                <Typography variant="body1">User Name: {currentTicket.userName}</Typography>
                <Typography variant="body1">Contact: {currentTicket.contact}</Typography>
                <Typography variant="body1">Issue Summary: {currentTicket.issueSummary}</Typography>
                <Typography variant="body1">Category: {currentTicket.category}</Typography>
                <Typography variant="body1">Status: {currentTicket.status}</Typography>
                <Typography variant="body1">Priority: {currentTicket.priority}</Typography>
                <Typography variant="body1">Date Created: {currentTicket.dateCreated}</Typography>
                <Typography variant="body1">Last Updated: {currentTicket.lastUpdated}</Typography>
              </>
            )}
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

export default Support;