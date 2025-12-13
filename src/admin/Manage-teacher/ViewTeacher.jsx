import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../Admin/Layout";
import { fetchSingleTeacherById } from "../../services/apiService";

const ViewTeacherAdmin = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = windowWidth < 640;

  const { id } = useParams();
  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    classCategory: '',
    subjects: [],
    gender: '',
    state: '',
    district: '',
    skills: [],
    qualifications: [],
    experience: [0, 20], // Years range
    status: 'all', // 'all', 'active', 'inactive'
    minTestScore: 0,
    searchQuery: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    classCategories: ['Primary', 'Middle School', 'High School', 'College'],
    subjects: ['Mathematics', 'Science', 'English', 'History', 'Computer Science'],
    states: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu'],
    districts: {
      'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    },
    skills: ['Communication', 'Leadership', 'Technology', 'Classroom Management'],
    qualifications: ['Matric', 'Bachelor', 'Master', 'PhD', 'B.Ed'],
    genders: ['Male', 'Female', 'Other'],
  });
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  const handleMultiFilterChange = (event, filterName) => {
    const { value } = event.target;
    setFilters({
      ...filters,
      [filterName]: typeof value === 'string' ? value.split(',') : value,
    });
  };
  const handleSliderChange = (event, newValue) => {
    setFilters({
      ...filters,
      experience: newValue,
    });
  };
  const handleResetFilters = () => {
    setFilters({
      classCategory: '',
      subjects: [],
      gender: '',
      state: '',
      district: '',
      skills: [],
      qualifications: [],
      experience: [0, 20],
      status: 'all',
      minTestScore: 0,
      searchQuery: '',
    });
  };
  useEffect(() => {
    if (filters.classCategory) {
      const filteredSubjects = filterOptions.subjects.filter(subject => {
        if (filters.classCategory === 'Primary') return ['Mathematics', 'English'].includes(subject);
        if (filters.classCategory === 'Middle School') return ['Mathematics', 'Science', 'English', 'History'].includes(subject);
        if (filters.classCategory === 'High School') return ['Mathematics', 'Science', 'English', 'History', 'Computer Science'].includes(subject);
        return true; // For College or if no filtering needed
      });
      setFilterOptions(prev => ({
        ...prev,
        availableSubjects: filteredSubjects
      }));
    }
  }, [filters.classCategory]);
  useEffect(() => {
    if (filters.state && filterOptions.districts[filters.state]) {
      if (filters.district && !filterOptions.districts[filters.state].includes(filters.district)) {
        setFilters(prev => ({
          ...prev,
          district: ''
        }));
      }
    }
  }, [filters.state, filterOptions.districts]);
  
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSingleTeacherById(id);
        const raw = response || {};
        const teacher = raw.teacher || raw;
        setTeacherData(teacher || {});
        const attemptsFromResp = raw.attempts || raw.attempt_history || raw.attempts_history || teacher.attempts || [];
        setAttempts(Array.isArray(attemptsFromResp) ? attemptsFromResp : []);
        if (teacher?.Fname && teacher?.Lname) {
          document.title = `${teacher.Fname} ${teacher.Lname} | Profile`;
        } else if (teacher?.firstName || teacher?.lastName) {
          document.title = `${teacher.firstName || ''} ${teacher.lastName || ''} | Profile`;
        } else {
          document.title = "Teacher Profile";
        }
      } catch (error) {
        
        setError("Failed to load teacher data. Please try again later.");
        setTeacherData(null);
        document.title = "Error | Teacher Profile";
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
    return () => {
      document.title = "Teacher Management";
    };
  }, [id]);

  const formatDate = (value, { dateOnly } = { dateOnly: false }) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      if (dateOnly) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return String(value);
    }
  };
  const jobLocations = (() => {
    const teacher = teacherData || {};
    if (!teacher) return [];

    if (teacher.jobpreferencelocation) {
      if (Array.isArray(teacher.jobpreferencelocation) && teacher.jobpreferencelocation.length) {
        return teacher.jobpreferencelocation.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
      }
      return [teacher.jobpreferencelocation];
    }

    const prefLocations = (teacher.preferences || [])
      .flatMap(p => {
        const candidates = [];
        if (p.preferred_job_locations && Array.isArray(p.preferred_job_locations)) candidates.push(...p.preferred_job_locations);
        if (p.job_pref_locations && Array.isArray(p.job_pref_locations)) candidates.push(...p.job_pref_locations);
        if (p.job_pref_location) candidates.push(...(Array.isArray(p.job_pref_location) ? p.job_pref_location : [p.job_pref_location]));
        if (p.job_locations && Array.isArray(p.job_locations)) candidates.push(...p.job_locations);
        if (p.job_location) candidates.push(...(Array.isArray(p.job_location) ? p.job_location : [p.job_location]));
        if (p.preferred_locations && Array.isArray(p.preferred_locations)) candidates.push(...p.preferred_locations);
        if (p.job_preferences && Array.isArray(p.job_preferences)) candidates.push(...p.job_preferences);
        return candidates;
      })
      .filter(Boolean)
      .filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));

    if (prefLocations.length) return prefLocations;

    if (Array.isArray(teacher.job_locations) && teacher.job_locations.length) {
      return teacher.job_locations.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
    }
    if (Array.isArray(teacher.joblocations) && teacher.joblocations.length) {
      return teacher.joblocations.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
    }

    if (Array.isArray(teacher.teachersaddress) && teacher.teachersaddress.length) {
      const others = teacher.teachersaddress.filter(addr => !(addr && addr.address_type && ['current', 'permanent'].includes(String(addr.address_type).toLowerCase())));
      return others;
    }

    return [];
  })();

  const [notificationMessage, setNotificationMessage] = useState({
    type: "success",
    text: "Account deactivated successfully"
  });
  const [openJsonDialog, setOpenJsonDialog] = useState(false);
  const [jsonDialogTitle, setJsonDialogTitle] = useState('');
  const [jsonDialogContent, setJsonDialogContent] = useState(null);

  const handleOpenJsonDialog = (title, value) => {
    setJsonDialogTitle(title);
    setJsonDialogContent(value);
    setOpenJsonDialog(true);
  };


  const handleDeactivate = () => {
    setOpenDeactivateModal(false);
    setNotificationMessage({
      type: "success",
      text: "Account deactivated successfully"
    });
    setOpenSnackbar(true);
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate("/admin/manage/teacher");
  };


  return (
    <Layout>
      <div className="p-4 md:p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
        {/* Breadcrumbs / Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={handleBackClick} className="px-3 py-2 rounded border bg-white text-sm">← Back to Teacher List</button>
            <nav className="text-sm text-gray-600">
              <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>
              <span className="mx-2">›</span>
              <Link to="/admin/manage/teacher" className="hover:underline">Manage Teachers</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">{loading ? 'Loading...' : (teacherData?.Fname || teacherData?.firstName) ? `${teacherData?.Fname || teacherData?.firstName} ${teacherData?.Lname || teacherData?.lastName}` : 'Teacher Profile'}</span>
            </nav>
          </div>

          {/* Filters */}
          {/* FilterPanel not included here - keep if available in project */}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b bg-gradient-to-r from-gray-100 to-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Teacher Information</h1>
              {teacherData && (
                <div className="mt-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{teacherData?.Fname || teacherData?.firstName} {teacherData?.Lname || teacherData?.lastName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${teacherData?.isActive || teacherData?.is_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{teacherData?.isActive || teacherData?.is_verified ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Email: {teacherData?.email || '-'} · Phone: {teacherData?.profiles?.phone_number || '-'}</div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setOpenDeactivateModal(true)} disabled={loading || !teacherData} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Deactivate Account</button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-12">Loading teacher information...</div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>
            ) : !teacherData ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded">No teacher data available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={teacherData?.profiles?.profile_picture} alt="avatar" className="w-20 h-20 rounded-full object-cover bg-gray-100" />
                      <div>
                        <div className="text-lg font-semibold">{teacherData?.Fname} {teacherData?.Lname}</div>
                        <div className="text-sm text-gray-500">{teacherData?.profiles?.language || '-'}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <div><strong>Contact</strong></div>
                      <div>Email: {teacherData?.email || '-'}</div>
                      <div>Phone: {teacherData?.profiles?.phone_number || '-'}</div>
                    </div>
                  </div>

                </div>

                {/* Right column - Tabs and content */}
                <div className="md:col-span-2">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Overview','Qualifications','Experience','Attempts','Job Locations','Skills','Preferences','Addresses'].map((label, idx) => (
                        <button key={label} onClick={() => handleTabChange(idx)} className={`px-3 py-1 rounded text-sm ${tabValue===idx? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{label}</button>
                      ))}
                    </div>

                    <div>
                      {/* Overview */}
                      {tabValue === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded">
                            <div className="text-sm text-gray-500">Basic</div>
                            <div className="mt-2 text-sm">Name: {teacherData?.Fname} {teacherData?.Lname}</div>
                            <div className="text-sm">Email: {teacherData?.email}</div>
                            <div className="text-sm">Phone: {teacherData?.profiles?.phone_number ?? '—'}</div>
                            <div className="text-sm">Gender: {teacherData?.profiles?.gender ?? '—'}</div>
                          </div>
                          <div className="p-3 border rounded">
                            <div className="text-sm text-gray-500">Profile</div>
                            <div className="mt-2 text-sm">Religion: {teacherData?.profiles?.religion ?? '—'}</div>
                            <div className="text-sm">Language: {teacherData?.profiles?.language ?? '—'}</div>
                            <div className="text-sm">Marital status: {teacherData?.profiles?.marital_status ?? '—'}</div>
                          </div>
                        </div>
                      )}

                      {/* Qualifications */}
                      {tabValue === 1 && (
                        <div className="space-y-3">
                          {teacherData?.teacherqualifications?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {teacherData.teacherqualifications.map((q,i) => (
                                <div key={i} className="p-3 border rounded">
                                  <div className="font-semibold">{q.qualification?.name}</div>
                                  <div className="text-sm text-gray-500">{q.institution}</div>
                                  <div className="text-xs text-gray-400">{q.year_of_passing}</div>
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-sm text-gray-500">No qualification information available</div>}
                        </div>
                      )}

                      {/* Experience */}
                      {tabValue === 2 && (
                        <div className="space-y-3">
                          {teacherData?.teacherexperiences?.length > 0 ? (
                            teacherData.teacherexperiences.map((exp, idx) => (
                              <div key={idx} className="p-3 border rounded">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-semibold">{exp.institution}</div>
                                    <div className="text-sm text-gray-500">Role: {exp.role?.jobrole_name}</div>
                                  </div>
                                  <div className="text-sm text-gray-500">{exp.start_date ? formatDate(exp.start_date, {dateOnly:true}) : ''} - {exp.end_date ? formatDate(exp.end_date, {dateOnly:true}) : 'Present'}</div>
                                </div>
                                {exp.achievements && <div className="mt-2 text-sm text-gray-600">{exp.achievements}</div>}
                              </div>
                            ))
                          ) : <div className="text-sm text-gray-500">No experience available</div>}
                        </div>
                      )}

                      {/* Attempts */}
                      {tabValue === 3 && (
                        <div className="space-y-3">
                          {attempts?.length > 0 ? (
                            attempts.map((a, idx) => {
                              const correct = a.correct_answer ?? a.score ?? null;
                              const total = a.total_question ?? a.total_questions ?? a.total ?? null;
                              const pct = (typeof correct === 'number' && typeof total === 'number' && total > 0) ? Math.round((correct / total) * 100) : (a.calculate_percentage ?? a.percentage ?? null);
                              const passed = pct !== null ? pct >= 60 : null;
                              return (
                                <div key={idx} className="p-3 border rounded">
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-semibold">{a.exam?.name || a.exam_name || 'Exam'}</div>
                                      <div className="text-sm text-gray-500">Score: {correct ?? '—'}/{total ?? '—'}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">{a.created_at ? formatDate(a.created_at) : ''}</div>
                                      {pct !== null && <div className={`mt-1 inline-block px-2 py-0.5 text-xs rounded ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{passed ? `Pass (${pct}%)` : `Fail (${pct}%)`}</div>}
                                    </div>
                                  </div>

                                  {a.interviews && a.interviews.length > 0 && (
                                    <div className="mt-3">
                                      <div className="font-medium">Interviews</div>
                                      <div className="space-y-2 mt-2">
                                        {a.interviews.filter(iv => String(iv.status || '').toLowerCase() === 'fulfilled').map(iv => {
                                          const score = iv.grade ?? iv.score ?? null;
                                          const tot = iv.total ?? 10;
                                          const percentage = (typeof score === 'number' && typeof tot === 'number' && tot > 0) ? Math.round((score / tot) * 100) : null;
                                          const passedIv = percentage !== null ? percentage >= 60 : null;
                                          return (
                                            <div key={iv.id} className="p-2 bg-gray-50 rounded">
                                              <div className="flex justify-between">
                                                <div>
                                                  <div className="text-sm">Status: <strong>{iv.status}</strong></div>
                                                  <div className="text-xs text-gray-500">Attempt: {iv.attempt}</div>
                                                </div>
                                                <div>
                                                  {percentage !== null && <div className={`text-xs px-2 py-0.5 rounded ${passedIv ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{passedIv ? `Pass (${percentage}%)` : `Fail (${percentage}%)`}</div>}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : <div className="text-sm text-gray-500">No exam attempts found</div>}
                        </div>
                      )}

                      {/* Job Locations */}
                      {tabValue === 4 && (
                        <div>
                          {jobLocations && jobLocations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {jobLocations.map((loc, i) => (
                                <div key={i} className="p-3 border rounded">
                                  {typeof loc === 'string' ? <div>{loc}</div> : (
                                    <div>
                                      {loc.address_type && <div className="font-semibold capitalize">{loc.address_type} location</div>}
                                      <div className="mt-1 text-sm text-gray-600">
                                        {loc.area && <div><strong>Area:</strong> {loc.area}</div>}
                                        {loc.city && <div><strong>City:</strong> {loc.city}</div>}
                                        {loc.district && <div><strong>District:</strong> {loc.district}</div>}
                                        {loc.state && <div><strong>State:</strong> {loc.state}</div>}
                                        {loc.pincode && <div><strong>Pincode:</strong> {loc.pincode}</div>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-sm text-gray-500">No preferred job locations found</div>}
                        </div>
                      )}

                      {/* Skills */}
                      {tabValue === 5 && (
                        <div>
                          {teacherData?.teacherskill?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {teacherData.teacherskill.map(s => <div key={s.skill?.id || s.id} className="px-2 py-1 border rounded text-sm">{s.skill?.name || s.name}</div>)}
                            </div>
                          ) : <div className="text-sm text-gray-500">No skills listed</div>}
                        </div>
                      )}

                      {/* Preferences */}
                      {tabValue === 6 && (
                        <div>
                          {teacherData?.preferences?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {teacherData.preferences.map((pref,pidx) => (
                                <div key={pidx} className="p-3 border rounded">
                                  <div className="font-semibold">Job Roles</div>
                                  <div className="flex flex-wrap gap-2 mt-2">{(pref.job_role||[]).map(r => <div key={r.id} className="px-2 py-1 border rounded text-sm">{r.jobrole_name}</div>)}</div>
                                  <div className="mt-3 font-semibold">Class Categories</div>
                                  <div className="flex flex-wrap gap-2 mt-2">{(pref.class_category||[]).map(c => <div key={c.id} className="px-2 py-1 border rounded text-sm">{c.name}</div>)}</div>
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-sm text-gray-500">No preferences provided</div>}
                        </div>
                      )}

                      {/* Addresses */}
                      {tabValue === 7 && (
                        <div>
                          {teacherData?.teachersaddress?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {teacherData.teachersaddress.map((addr,i) => (
                                <div key={i} className="p-3 border rounded">
                                  <div className="font-semibold capitalize">{addr.address_type} address</div>
                                  <div className="text-sm text-gray-600">{addr.area}, {addr.district}, {addr.state} - {addr.pincode}</div>
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-sm text-gray-500">No addresses found</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deactivate Modal */}
        {openDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-red-600">Confirm Deactivation</h3>
                <button onClick={() => setOpenDeactivateModal(false)} className="text-gray-500">✕</button>
              </div>
              <div className="mt-4 text-sm text-gray-700">This action permanently removes this teacher's access to the platform.</div>
              <div className="mt-4">Are you sure you want to deactivate <strong>{teacherData?.Fname} {teacherData?.Lname}</strong>'s account? This action cannot be undone.</div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setOpenDeactivateModal(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button onClick={handleDeactivate} className="px-3 py-2 bg-red-600 text-white rounded">Deactivate</button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {openSnackbar && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
            <div className={`px-4 py-2 rounded shadow ${notificationMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{notificationMessage.text}</div>
          </div>
        )}

        {/* JSON viewer modal */}
        {openJsonDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{jsonDialogTitle}</h3>
                <button onClick={() => setOpenJsonDialog(false)} className="text-gray-500">✕</button>
              </div>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(jsonDialogContent, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewTeacherAdmin;
