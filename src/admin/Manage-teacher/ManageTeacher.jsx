import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Admin/Layout";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeachers, searchTeachers } from "../../features/teacherFilterSlice";
import { getQualification } from "../../services/adminManageQualificationApi";
import { getSubjects } from "../../services/adminSubujectApi";
import { updateTeacher } from "../../services/adminTeacherApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import { HiOutlineAcademicCap, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { IoReloadOutline, IoDownloadOutline } from "react-icons/io5";
import FilterModal from "./FilterModal";

const ManageTeacher = () => {
  const dispatch = useDispatch();
  const { data: teacherData, status, error } = useSelector((s) => s.teachers);

  const [teachers, setTeachers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? "card" : "list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [qualifications, setQualifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [locationFilters, setLocationFilters] = useState({ state: [], district: [] });
  const [locationInputs, setLocationInputs] = useState({ state: '', district: '' });
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [experienceRange, setExperienceRange] = useState({ min: '', max: '' });
  const [expandedSections, setExpandedSections] = useState({
    location: false,
    qualification: false,
    subject: false,
    classCategory: true,
    status: false,
    gender: false,
    experience: false,
  });
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: null });
  useEffect(() => {
    dispatch(fetchTeachers({}));
    (async () => {
      try {
        const q = await getQualification();
        if (Array.isArray(q)) setQualifications(q);
      } catch {}
      try {
        const s = await getSubjects();
        if (Array.isArray(s)) setSubjects(s);
      } catch {}
      try {
        const c = await getClassCategory();
        if (Array.isArray(c)) setClassCategories(c);
      } catch {}
    })();
  }, [dispatch]);
  useEffect(() => {
    if (Array.isArray(teacherData)) {
      setTeachers(teacherData);
    }
  }, [teacherData]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.trim()) dispatch(searchTeachers(searchValue));
      else dispatch(fetchTeachers({}));
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, dispatch]);
  useEffect(() => {
    const onResize = () => setViewMode(window.innerWidth < 768 ? "card" : "list");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const qNames = (t.teacherqualifications || [])
        .map((q) => q?.qualification?.name?.toLowerCase())
        .filter(Boolean);
      const subjectNames = (t.teachersubjects || [])
        .map((s) => (typeof s === "string" ? s.toLowerCase() : s?.subject_name?.toLowerCase?.()))
        .filter(Boolean);
      const addresses = (t.teachersaddress || []).map((a) => a?.state?.toLowerCase()).filter(Boolean);
      const currentState = t.current_address?.state?.toLowerCase();
      const currentDistrict = t.current_address?.district?.toLowerCase();

      const nameMatch = !searchValue ||
        `${t.Fname || ""} ${t.Lname || ""}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        (t.email || "").toLowerCase().includes(searchValue.toLowerCase()) ||
        String(t.id || "").includes(searchValue);

      const qualMatch = selectedQualifications.length === 0 ||
        selectedQualifications.some(q => qNames.includes(q) || (t.last_education?.qualification?.name || "").toLowerCase() === q);

      const subjectMatch = selectedSubjects.length === 0 ||
        selectedSubjects.some(s => subjectNames.includes(s));

      const locationMatch = (locationFilters.state.length === 0 ||
        locationFilters.state.some(s => addresses.includes(s.toLowerCase()) || currentState === s.toLowerCase())) &&
        (locationFilters.district.length === 0 ||
        locationFilters.district.some(d => currentDistrict === d.toLowerCase()));

      const statusMatch = selectedStatuses.length === 0 ||
        (selectedStatuses.includes('active') && t.is_active) ||
        (selectedStatuses.includes('inactive') && !t.is_active);

      const genderMatch = selectedGenders.length === 0 ||
        (t.gender && selectedGenders.includes(t.gender.toLowerCase()));

      const experienceMatch = (!experienceRange.min || (t.experience_years && t.experience_years >= parseInt(experienceRange.min))) &&
        (!experienceRange.max || (t.experience_years && t.experience_years <= parseInt(experienceRange.max)));

      const classMatch = selectedClassCategories.length === 0 ||
        selectedClassCategories.some(c => t.class_categories?.some(cat => cat?.name?.toLowerCase() === c.toLowerCase()));

      return nameMatch && qualMatch && subjectMatch && locationMatch && statusMatch && genderMatch && experienceMatch && classMatch;
    });
  }, [teachers, searchValue, selectedQualifications, selectedSubjects, selectedClassCategories, locationFilters, selectedStatuses, selectedGenders, experienceRange]);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTeachers = filtered.slice(indexOfFirst, indexOfLast);

  const getVisiblePageNumbers = () => {
    const nums = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (totalPages <= 7) return nums;
    if (currentPage <= 3) return [...nums.slice(0, 5), "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", ...nums.slice(totalPages - 5)];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleRefresh = () => {
    dispatch(fetchTeachers({}));
    setToast({ open: true, type: "success", message: "Teacher data refreshed" });
  };

  const handleClearFilters = () => {
    setSelectedQualifications([]);
    setSelectedSubjects([]);
    setSelectedClassCategories([]);
    setLocationFilters({ state: [], district: [] });
    setSelectedStatuses([]);
    setSelectedGenders([]);
    setExperienceRange({ min: '', max: '' });
    setLocationInputs({ state: '', district: '' });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      setToast({ open: true, type: "warning", message: "No data to export" });
      return;
    }
    const csvContent = [
      [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Status",
        "Qualifications",
        "Location",
      ],
      ...filtered.map((t) => [
        t.id || "",
        t.Fname || "",
        t.Lname || "",
        t.email || "",
        t.is_active ? "Active" : "Inactive",
        (
          (t.teacherqualifications || []).map((q) => q?.qualification?.name).filter(Boolean).join("; ") ||
          t.last_education?.qualification?.name || ""
        ),
        (
          (t.teachersaddress || []).map((a) => a?.state).filter(Boolean).join("; ") ||
          t.current_address?.state || ""
        ),
      ]),
    ]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teachers_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast({ open: true, type: "success", message: `Exported ${filtered.length} teachers` });
  };

  const activeTeachers = teachers.filter((t) => t.is_active === true).length;
  const inactiveTeachers = teachers.filter((t) => t.is_active === false).length;

  const openConfirm = (id, current) => setConfirmModal({ open: true, id, status: current });
  const closeConfirm = () => setConfirmModal({ open: false, id: null, status: null });
  const confirmToggle = async () => {
    const { id, status: cur } = confirmModal;
    try {
      const teacher = teachers.find((t) => t.id === id);
      if (!teacher) throw new Error("Teacher not found");
      await updateTeacher(id, { email: teacher.email, is_active: !cur });
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: !cur } : t)));
      setToast({ open: true, type: "success", message: `Teacher ${!cur ? "activated" : "deactivated"}` });
    } catch (e) {
      setToast({ open: true, type: "error", message: e?.message || "Failed to update status" });
    } finally {
      closeConfirm();
    }
  };

  useEffect(() => {
    if (toast.open) {
      const t = setTimeout(() => setToast((s) => ({ ...s, open: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.open]);

  return (
    <Layout>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text">Manage Teachers</h1>
              <p className="text-sm text-secondary mt-1">
                {teachers.length} total • {activeTeachers} active • {inactiveTeachers} inactive
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-background hover:bg-gray-100 text-text rounded-lg border border-gray-200 flex items-center gap-2"
              >
                <IoReloadOutline /> Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2"
              >
                <IoDownloadOutline /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm mb-4">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by name, email, or ID"
              className="w-full bg-background border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 pl-10 text-sm text-text placeholder-secondary focus:outline-none transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2"
          >
            <MdFilterAlt /> Filters
          </button>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-secondary">Showing {filtered.length} of {teachers.length} teachers</p>
            {(selectedQualifications.length || selectedSubjects.length || selectedClassCategories.length || locationFilters.state.length || locationFilters.district.length || selectedStatuses.length || selectedGenders.length || experienceRange.min || experienceRange.max) ? (
              <button onClick={handleClearFilters} className="text-primary text-sm inline-flex items-center gap-1">
                <MdFilterAltOff /> Clear filters
              </button>
            ) : (
              <div className="text-secondary text-sm inline-flex items-center gap-1">
                <MdFilterAlt className="text-secondary" /> No filters applied
              </div>
            )}
          </div>
        </div>

        {/* List/Card results */}
        {status === "loading" ? (
          <div className="w-full h-full flex justify-center items-center mt-16">
            <div className="h-fit mt-20 animate-pulse text-secondary">Loading…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-2">🧑‍🏫</div>
            <h3 className="text-lg font-semibold text-text mb-1">No teachers found</h3>
            <p className="text-sm text-secondary">Try adjusting your search or filters and try again.</p>
          </div>
        ) : (
          <>
            {viewMode === "card" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentTeachers.map((t) => {
                  const currentAddress = t.current_address || {};
                  const latestEducation = t.last_education;
                  const initials = `${t.Fname?.charAt(0) || ''}${t.Lname?.charAt(0) || ''}`.toUpperCase();
                  const subjects = (t.teachersubjects || []).map(s => typeof s === 'string' ? s : s?.subject_name).filter(Boolean).join(', ') || 'N/A';
                  const qualifications = (t.teacherqualifications || []).map(q => q?.qualification?.name).filter(Boolean).join(', ') || latestEducation?.qualification?.name || 'N/A';
                  return (
                    <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      {/* Header Section */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          {t.profile_picture ? (
                            <img src={t.profile_picture} alt={`${t.Fname} ${t.Lname}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                              {initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-text truncate">{t.Fname} {t.Lname}</h2>
                          {(currentAddress.district || currentAddress.state) && (
                            <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                              <HiOutlineLocationMarker className="text-accent" size={12} />
                              {currentAddress.district ? `${currentAddress.district}, ` : ""}{currentAddress.state || ""}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-3 mb-4">
                        {/* Email */}
                        <div className="flex items-center gap-3">
                          <HiOutlineMail className="text-accent flex-shrink-0" size={16} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium">Email</p>
                            <p className="text-sm text-text truncate">{t.email}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        {t.phone_number && (
                          <div className="flex items-center gap-3">
                            <HiOutlinePhone className="text-accent flex-shrink-0" size={16} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-secondary font-medium">Phone</p>
                              <p className="text-sm text-text">{t.phone_number}</p>
                            </div>
                          </div>
                        )}

                        {/* Qualification */}
                        <div className="flex items-center gap-3">
                          <HiOutlineAcademicCap className="text-accent flex-shrink-0" size={16} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium">Qualification</p>
                            <p className="text-sm text-text truncate">{qualifications}</p>
                          </div>
                        </div>

                        {/* Subjects */}
                        <div className="flex items-start gap-3">
                          <div className="text-accent flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium">Subjects</p>
                            <p className="text-sm text-text break-words">{subjects}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/view/teacher/${t.id}`}
                          className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium text-center transition-colors"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => openConfirm(t.id, t.is_active)}
                          className={`px-3 py-2 rounded-lg text-sm border font-medium transition-colors ${
                            t.is_active
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {t.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {currentTeachers.map((t) => {
                  console.log(t);
                  const currentAddress = t.current_address || {};
                  const latestEducation = t.last_education;
                  const initials = `${t.Fname?.charAt(0) || ''}${t.Lname?.charAt(0) || ''}`.toUpperCase();
                  const subjects = (t.teachersubjects || []).map(s => typeof s === 'string' ? s : s?.subject_name).filter(Boolean).join(', ') || 'N/A';
                  const qualifications = (t.teacherqualifications || []).map(q => q?.qualification?.name).filter(Boolean).join(', ') || latestEducation?.qualification?.name || 'N/A';
                  return (
                    <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section: Avatar and Basic Info */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {t.profile_picture ? (
                              <img src={t.profile_picture} alt={`${t.Fname} ${t.Lname}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                                {initials}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-text truncate">{t.Fname} {t.Lname}</h3>
                            <div className="flex items-center gap-4 text-sm text-secondary mt-1">
                              <div className="flex items-center gap-1">
                                <HiOutlineMail className="text-accent flex-shrink-0" size={14} />
                                <span className="truncate">{t.email}</span>
                              </div>
                              {t.phone_number && (
                                <div className="flex items-center gap-1">
                                  <HiOutlinePhone className="text-accent flex-shrink-0" size={14} />
                                  <span>{t.phone_number}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle Section: Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                          {/* Qualification */}
                          <div className="flex items-center gap-2 min-w-0">
                            <HiOutlineAcademicCap className="text-accent flex-shrink-0" size={16} />
                            <div className="min-w-0">
                              <p className="text-xs text-secondary font-medium">Qualification</p>
                              <p className="text-sm text-text truncate">{qualifications}</p>
                            </div>
                          </div>

                          {/* Subjects */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-accent flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-secondary font-medium">Subjects</p>
                              <p className="text-sm text-text truncate">{subjects}</p>
                            </div>
                          </div>

                          {/* Location */}
                          {(currentAddress.district || currentAddress.state) && (
                            <div className="flex items-center gap-2 min-w-0">
                              <HiOutlineLocationMarker className="text-accent flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs text-secondary font-medium">Location</p>
                                <p className="text-sm text-text truncate">{currentAddress.district ? `${currentAddress.district}, ` : ''}{currentAddress.state || ''}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Section: Status and Actions */}
                        <div className="flex items-center gap-3 lg:justify-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${t.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {t.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/view/teacher/${t.id}`}
                              className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={() => openConfirm(t.id, t.is_active)}
                              className={`px-3 py-2 rounded-lg text-sm border font-medium transition-colors whitespace-nowrap ${
                                t.is_active
                                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {t.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'bg-background text-secondary/50 cursor-not-allowed' : 'bg-white text-text hover:bg-background'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'bg-background text-secondary/50 cursor-not-allowed' : 'bg-white text-text hover:bg-background'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-text">
                    Showing <span className="font-semibold">{indexOfFirst + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(indexOfLast, filtered.length)}</span> of{' '}
                    <span className="font-semibold">{filtered.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-lg px-2 py-2 text-secondary ${currentPage === 1 ? 'cursor-not-allowed bg-background' : 'hover:bg-background bg-white'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {getVisiblePageNumbers().map((n, idx) =>
                      n === "..." ? (
                        <span key={`e-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-text bg-white">...</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setCurrentPage(n)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === n ? 'bg-primary text-white z-10' : 'bg-white text-secondary hover:bg-background'}`}
                        >
                          {n}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-lg px-2 py-2 text-secondary ${currentPage === totalPages ? 'cursor-not-allowed bg-background' : 'hover:bg-background bg-white'}`}
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirm modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={closeConfirm} />
            <div className="relative bg-white rounded-xl shadow-xl p-5 w-[90%] max-w-md">
              <h3 className="text-lg font-semibold text-text mb-2">Confirm Status Change</h3>
              <p className="text-sm text-secondary mb-4">
                Are you sure you want to {confirmModal.status ? 'deactivate' : 'activate'} this teacher?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button onClick={closeConfirm} className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-text">Cancel</button>
                <button onClick={confirmToggle} className="px-3 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/90">Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.open && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-2 text-sm">
            <span className={toast.type === 'error' ? 'text-rose-600' : toast.type === 'success' ? 'text-emerald-600' : 'text-text'}>
              {toast.message}
            </span>
          </div>
        )}

      {/* Filters Modal */}
      <FilterModal
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        qualifications={qualifications}
        subjects={subjects}
        classCategories={classCategories}
        selectedQualifications={selectedQualifications}
        setSelectedQualifications={setSelectedQualifications}
        selectedSubjects={selectedSubjects}
        setSelectedSubjects={setSelectedSubjects}
        selectedClassCategories={selectedClassCategories}
        setSelectedClassCategories={setSelectedClassCategories}
        locationFilters={locationFilters}
        setLocationFilters={setLocationFilters}
        locationInputs={locationInputs}
        setLocationInputs={setLocationInputs}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
        experienceRange={experienceRange}
        setExperienceRange={setExperienceRange}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        handleClearFilters={handleClearFilters}
      />
    </Layout>
  );
};

export default ManageTeacher;