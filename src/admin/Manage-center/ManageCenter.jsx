import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Mail as EmailIcon,
  EditOff as EditOffIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Layout from "../Admin/Layout";
import {
  createCenterManager,
  deleteCenterManager,
  getManageCenter,
  updateCenterManager,
} from "../../services/adminManageCenterApi";
import axios from "axios";

/**
 * ManageCenter (refactor + redesign)
 *
 * Key improvements:
 * - debounce search
 * - memoized filtered list
 * - improved form validation / feedback
 * - optimistic updates for toggle/update/delete
 * - DataGrid pagination + toolbar
 * - clearer pincode lookup UX
 */

// tiny debounce hook
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  const t = useRef(null);
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}

export default function ManageCenter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // toolbar for DataGrid
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ gap: 1, p: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  // data + loading
  const [examCenters, setExamCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState("");
  const [pageState, setPageState] = useState({ page: 0, pageSize: 10 });

  // form
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    Fname: "",
    Lname: "",
    center_name: "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    status: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | 'success' | 'error'

  // deletes / submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState(null);

  // snack
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    fetchExamCenters();
  }, []);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // fetch centers
  const fetchExamCenters = async () => {
    setIsLoading(true);
    try {
      const res = await getManageCenter();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setExamCenters(list);
      showSnack("Exam centers loaded", "success");
    } catch (err) {
      console.error("fetchExamCenters:", err);
      setExamCenters([]);
      showSnack("Failed to load exam centers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // derived filtered centers
  const filteredCenters = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    return examCenters.filter((c) => {
      const matchesQ =
        !q ||
        (c.center_name || "").toLowerCase().includes(q) ||
        (c.city || "").toLowerCase().includes(q) ||
        (c.state || "").toLowerCase().includes(q) ||
        (c.user?.email || "").toLowerCase().includes(q) ||
        (c.user?.Fname || "").toLowerCase().includes(q) ||
        (c.user?.Lname || "").toLowerCase().includes(q);
      const matchesStatus =
        !filterStatus ||
        (filterStatus === "active" ? Boolean(c.status) : !Boolean(c.status));
      return matchesQ && matchesStatus;
    });
  }, [examCenters, debouncedSearch, filterStatus]);

  // ---------- Handlers: CRUD & actions ----------
  const openAddModal = () => {
    setSelectedCenter(null);
    setForm({
      username: "",
      email: "",
      password: "",
      Fname: "",
      Lname: "",
      center_name: "",
      pincode: "",
      state: "",
      city: "",
      area: "",
      status: false,
    });
    setFormErrors({});
    setPincodeStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (center) => {
    setSelectedCenter(center);
    setForm({
      username: center.user?.username || "",
      email: center.user?.email || "",
      password: "",
      Fname: center.user?.Fname || "",
      Lname: center.user?.Lname || "",
      center_name: center.center_name || "",
      pincode: String(center.pincode || ""),
      state: center.state || "",
      city: center.city || "",
      area: center.area || "",
      status: Boolean(center.status),
    });
    setFormErrors({});
    setPincodeStatus(null);
    setIsModalOpen(true);
  };

  // toggle status (optimistic)
  const handleToggleStatus = async (center) => {
    const updated = !center.status;
    // optimistic update
    setExamCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, status: updated } : c)));
    try {
      const payload = { status: updated };
      await updateCenterManager(center.id, payload);
      showSnack(`Center ${updated ? "activated" : "deactivated"}`, "success");
    } catch (err) {
      console.error("toggleStatus error:", err);
      // revert on error
      setExamCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, status: center.status } : c)));
      showSnack("Failed to update status", "error");
    }
  };

  // delete
  const confirmDelete = (center) => {
    setCenterToDelete(center);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCenter = async () => {
    if (!centerToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteCenterManager(centerToDelete.id);
      setExamCenters((prev) => prev.filter((c) => c.id !== centerToDelete.id));
      showSnack("Exam center deleted", "success");
    } catch (err) {
      console.error("delete error:", err);
      showSnack("Failed to delete center", "error");
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmOpen(false);
      setCenterToDelete(null);
    }
  };

  // form validation
  const validate = () => {
    const errors = {};
    // when adding new center, require user info
    if (!selectedCenter) {
      if (!form.username) errors.username = "Username required";
      if (!form.email) errors.email = "Email required";
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Invalid email";
      if (!form.password) errors.password = "Password required";
      if (!form.Fname) errors.Fname = "First name required";
      if (!form.Lname) errors.Lname = "Last name required";
    }
    // center info
    if (!form.center_name) errors.center_name = "Center name required";
    if (!form.area) errors.area = "Area required";
    if (!form.pincode) errors.pincode = "Pincode required";
    else if (!/^\d{6}$/.test(form.pincode)) errors.pincode = "Pincode must be 6 digits";
    if (!form.city) errors.city = "City required";
    if (!form.state) errors.state = "State required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // submit create/update
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      showSnack("Please fix form errors", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      if (selectedCenter) {
        // update existing center
        const payload = {
          // include only what backend expects for update
          user: selectedCenter.user?.id,
          center_name: form.center_name,
          pincode: form.pincode,
          state: form.state,
          city: form.city,
          area: form.area,
          status: form.status,
        };
        await updateCenterManager(selectedCenter.id, payload);
        // optimistic local update
        setExamCenters((prev) => prev.map((c) => (c.id === selectedCenter.id ? { ...c, ...payload } : c)));
        showSnack("Exam center updated", "success");
      } else {
        // create new center (structure expected by your API earlier)
        const payload = {
          user: {
            username: form.username,
            email: form.email,
            Fname: form.Fname,
            Lname: form.Lname,
            password: form.password,
          },
          exam_center: {
            center_name: form.center_name,
            pincode: form.pincode,
            state: form.state,
            city: form.city,
            area: form.area,
            status: form.status,
          },
        };
        const created = await createCenterManager(payload);
        // append returned center if API returns it, otherwise refetch
        if (created && created.id) {
          setExamCenters((prev) => [created, ...prev]);
        } else {
          await fetchExamCenters();
        }
        showSnack("Exam center created", "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("submit error:", err);
      showSnack("Failed to save exam center", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // pincode fetch
  const handleFetchPostal = async (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeStatus("error");
      return;
    }
    setLoadingPincode(true);
    setPincodeStatus(null);
    try {
      const url = `${import.meta.env.VITE_POSTAL_API_URL || "https://api.postalpincode.in/pincode/"}${pin}`;
      const res = await axios.get(url);
      // typical India postal API returns array with Status and PostOffice
      if (res?.data?.[0]?.Status === "Success") {
        const post = res.data[0].PostOffice?.[0];
        if (post) {
          setForm((f) => ({ ...f, city: post.District || f.city, state: post.State || f.state }));
          setPincodeStatus("success");
          showSnack("Pincode resolved", "success");
        } else {
          setPincodeStatus("error");
          showSnack("No post office found for this pincode", "error");
        }
      } else {
        setPincodeStatus("error");
        showSnack("Invalid pincode", "error");
      }
    } catch (err) {
      console.error("postal fetch error:", err);
      setPincodeStatus("error");
      showSnack("Error checking pincode", "error");
    } finally {
      setLoadingPincode(false);
    }
  };

  // input change
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    // restrict pincode numeric length
    if (name === "pincode") {
      if (!/^\d*$/.test(val) || val.length > 6) return;
    }
    setForm((f) => ({ ...f, [name]: val }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "pincode" && val.length === 6) {
      handleFetchPostal(val);
    }
  };

  // CSV export helper (small)
  const exportCsv = () => {
    const rows = filteredCenters.map((c) => [
      c.id,
      c.center_name,
      c.area,
      c.city,
      c.state,
      c.pincode,
      c.user?.email || "",
      c.status ? "Active" : "Inactive",
    ]);
    const header = ["ID", "Center", "Area", "City", "State", "Pincode", "Manager Email", "Status"];
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = `exam_centers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Render card for mobile
  const renderMobileCards = () =>
    filteredCenters.slice(pageState.page * pageState.pageSize, (pageState.page + 1) * pageState.pageSize).map((center) => (
      <Card
        key={center.id}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
          borderLeft: `4px solid ${center.status ? theme.palette.success.main : theme.palette.grey[300]}`,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {center.center_name}
            </Typography>
            <Chip label={center.status ? "Active" : "Inactive"} color={center.status ? "success" : "default"} size="small" />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" mb={1}>
            <LocationIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
            <Typography variant="body2">{`${center.area}, ${center.city}, ${center.state}`}</Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <PhoneIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
            <Typography variant="body2">{center.pincode}</Typography>
          </Box>

          {center.user && (
            <Box display="flex" alignItems="center">
              <EmailIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
              <Typography variant="body2">{center.user.email}</Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <FormControlLabel
            control={<Switch checked={center.status} onChange={() => handleToggleStatus(center)} size="small" color="success" />}
            label={<Typography variant="body2">Active</Typography>}
          />
          <Box>
            <Tooltip title="Edit">
              <IconButton onClick={() => openEditModal(center)} size="small"><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => confirmDelete(center)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    ));

  // DataGrid rows
  const dgRows = useMemo(
    () =>
      filteredCenters.map((c) => ({
        id: c.id,
        centerName: c.center_name || "",
        location: `${c.area || ""}, ${c.city || ""}, ${c.state || ""}`,
        pincode: c.pincode || "",
        manager: c.user ? `${c.user.Fname || ""} ${c.user.Lname || ""}`.trim() : "",
        email: c.user?.email || "",
        status: Boolean(c.status),
        raw: c,
      })),
    [filteredCenters]
  );

  return (
    <Layout>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 1,
        }}
      >
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "teal" }}>
              Manage Exam Centers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {filteredCenters.length} centers found
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openAddModal} sx={{ textTransform: "none" }}>
              Add New Center
            </Button>
            <Button variant="outlined" onClick={exportCsv} sx={{ textTransform: "none" }}>
              Export CSV
            </Button>
          </Box>
        </Box>
      </Paper>
      {/* Search & Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, city, state or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      {/* Content */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
        {isLoading ? (
          <Box p={6} textAlign="center">
            <CircularProgress />
            <Typography mt={2} color="text.secondary">Loading exam centers...</Typography>
          </Box>
        ) : filteredCenters.length === 0 ? (
          <Box p={3} textAlign="center">
            <Alert severity="info">No exam centers found</Alert>
          </Box>
        ) : isMobile ? (
          <Box p={2}>{renderMobileCards()}</Box>
        ) : (
          <Box sx={{width: "100%" }}>
            <DataGrid
              
              rows={dgRows}
              columns={[
                { field: "centerName", headerName: "Center Name", flex: 1.5, minWidth: 200 },
                { field: "location", headerName: "Location", flex: 1.8, minWidth: 250 },
                { field: "pincode", headerName: "Pincode", width: 110 },
                {
                  field: "manager",
                  headerName: "Manager",
                  flex: 1,
                  minWidth: 170,
                },
                {
                  field: "status",
                  headerName: "Status",
                  width: 120,
                  renderCell: (p) => (
                    <Box display="flex" justifyContent="center">
                      <Switch checked={p.value} onChange={() => handleToggleStatus(p.row.raw)} size="small" color="success" />
                    </Box>
                  ),
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  width: 140,
                  sortable: false,
                  renderCell: (p) => (
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditModal(p.row.raw)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => confirmDelete(p.row.raw)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  ),
                },
              ]}
              getRowId={(r) => r.id}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { page: pageState.page, pageSize: pageState.pageSize } },
                sorting: { sortModel: [{ field: "centerName", sort: "asc" }] },
              }}
              paginationModel={pageState}
              onPaginationModelChange={(model) => setPageState(model)}
              slots={{ toolbar: CustomToolbar }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": { backgroundColor: theme.palette.background.default, fontWeight: 700 },
                "& .MuiDataGrid-row:nth-of-type(even)": { backgroundColor: theme.palette.mode === "light" ? "#fafafa" : theme.palette.background.default },
              }}
            />
          </Box>
        )}
      </Paper>
      {/* Add / Edit Modal */}
      <Dialog open={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCenter ? "Edit Exam Center" : "Add New Exam Center"}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="center-form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              {!selectedCenter && (
                <>
                  <Grid item xs={12}><Typography variant="subtitle2" color="primary">User Information</Typography></Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Username" name="username" value={form.username} onChange={handleInput} fullWidth required error={!!formErrors.username} helperText={formErrors.username} disabled={isSubmitting} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email" name="email" value={form.email} onChange={handleInput} fullWidth required error={!!formErrors.email} helperText={formErrors.email} disabled={isSubmitting} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Password" name="password" value={form.password} onChange={handleInput} fullWidth required type="password" error={!!formErrors.password} helperText={formErrors.password || "Required for new center"} disabled={isSubmitting} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="First Name" name="Fname" value={form.Fname} onChange={handleInput} fullWidth required error={!!formErrors.Fname} helperText={formErrors.Fname} disabled={isSubmitting} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Last Name" name="Lname" value={form.Lname} onChange={handleInput} fullWidth required error={!!formErrors.Lname} helperText={formErrors.Lname} disabled={isSubmitting} />
                  </Grid>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                </>
              )}

              <Grid item xs={12}><Typography variant="subtitle2" color="primary">Exam Center Information</Typography></Grid>

              <Grid item xs={12}>
                <TextField label="Center Name" name="center_name" value={form.center_name} onChange={handleInput} fullWidth required error={!!formErrors.center_name} helperText={formErrors.center_name} disabled={isSubmitting} />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Area" name="area" value={form.area} onChange={handleInput} fullWidth required error={!!formErrors.area} helperText={formErrors.area} disabled={isSubmitting} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleInput}
                  fullWidth
                  required
                  error={!!formErrors.pincode || pincodeStatus === "error"}
                  helperText={formErrors.pincode || (loadingPincode ? "Resolving pincode..." : pincodeStatus === "error" ? "Pincode not found" : "")}
                  disabled={isSubmitting || loadingPincode}
                  slotProps={{
                    input: { endAdornment: loadingPincode ? <CircularProgress size={18} /> : null },
                    htmlInput: { maxLength: 6 }
                  }} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="City" name="city" value={form.city} onChange={handleInput} fullWidth required error={!!formErrors.city} helperText={formErrors.city} disabled={isSubmitting} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="State" name="state" value={form.state} fullWidth required error={!!formErrors.state} helperText={formErrors.state} disabled slotProps={{
                  input: { readOnly: true }
                }} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} />} label={form.status ? "Active" : "Inactive"} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button form="center-form" type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : selectedCenter ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete confirm */}
      <Dialog open={deleteConfirmOpen} onClose={() => !isSubmitting && setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Exam Center</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exam center? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleDeleteCenter} color="error" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={closeSnack} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={closeSnack} severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Layout>
  );
}
