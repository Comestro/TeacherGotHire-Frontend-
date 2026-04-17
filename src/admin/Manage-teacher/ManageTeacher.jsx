import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Admin/Layout";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminTeachers,
  searchTeachers,
} from "../../features/teacherFilterSlice";
import { getQualification } from "../../services/adminManageQualificationApi";
import { getSubjects } from "../../services/adminSubujectApi";
import { updateTeacher } from "../../services/adminTeacherApi";
import { getClassCategory } from "../../services/adminClassCategoryApi";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";
import {
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { IoReloadOutline, IoDownloadOutline } from "react-icons/io5";
import FilterModal from "./FilterModal";
import DataLoader from "../../components/DataLoader";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const ManageTeacher = () => {
  const dispatch = useDispatch();
  const { data: teacherData, status, error } = useSelector((s) => s.teachers);

  const [searchParams, setSearchParams] = useSearchParams();

  const [teachers, setTeachers] = useState([]);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState(
    window.innerWidth < 768 ? "card" : "list"
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get("page_size")) || 10);
  const [qualifications, setQualifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize filters from searchParams
  const [selectedQualifications, setSelectedQualifications] = useState(
    searchParams.get("qualifications")?.split(",").filter(Boolean) || []
  );
  const [selectedSubjects, setSelectedSubjects] = useState(
    searchParams.get("subjects")?.split(",").map(Number).filter(Boolean) || []
  );
  const [selectedClassCategories, setSelectedClassCategories] = useState(
    searchParams.get("class_categories")?.split(",").filter(Boolean) || []
  );

  const [locationFilters, setLocationFilters] = useState({
    state: searchParams.get("states")?.split(",").filter(Boolean) || [],
    district: searchParams.get("districts")?.split(",").filter(Boolean) || [],
    pincode: searchParams.get("pincodes")?.split(",").filter(Boolean) || [],
  });
  const [locationInputs, setLocationInputs] = useState({
    state: "",
    district: "",
    pincode: "",
  });
  const [selectedStatuses, setSelectedStatuses] = useState(
    searchParams.get("statuses")?.split(",").filter(Boolean) || []
  );
  const [selectedGenders, setSelectedGenders] = useState(
    searchParams.get("genders")?.split(",").filter(Boolean) || []
  );
  const [experienceRange, setExperienceRange] = useState({ 
    min: searchParams.get("exp_min") || "", 
    max: searchParams.get("exp_max") || "" 
  });
  const [expandedSections, setExpandedSections] = useState({
    location: false,
    qualification: false,
    classCategory: true,
    subject: false,
    status: false,
    gender: false,
    experience: false,
  });
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null,
    status: null,
  });
  useEffect(() => {
    dispatch(fetchAdminTeachers({}));
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
    let rawList = [];
    if (teacherData?.results && Array.isArray(teacherData.results)) {
      rawList = teacherData.results;
    } else if (Array.isArray(teacherData)) {
      rawList = teacherData;
    }
    
    // Normalize: some API versions wrap in 'teacher', others don't
    const normalized = rawList.map(item => item.teacher ? { ...item.teacher, ...item, teacher: undefined } : item);
    setTeachers(normalized);
  }, [teacherData]);

  // Sync state to URL (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchValue) params.set("search", searchValue);
      if (currentPage > 1) params.set("page", currentPage.toString());
      if (itemsPerPage !== 10) params.set("page_size", itemsPerPage.toString());
      if (selectedQualifications.length) params.set("qualifications", selectedQualifications.join(","));
      if (selectedSubjects.length) params.set("subjects", selectedSubjects.join(","));
      if (selectedClassCategories.length) params.set("class_categories", selectedClassCategories.join(","));
      if (selectedStatuses.length) params.set("statuses", selectedStatuses.join(","));
      if (selectedGenders.length) params.set("genders", selectedGenders.join(","));
      if (locationFilters.state.length) params.set("states", locationFilters.state.join(","));
      if (locationFilters.district.length) params.set("districts", locationFilters.district.join(","));
      if (locationFilters.pincode.length) params.set("pincodes", locationFilters.pincode.join(","));
      if (experienceRange.min) params.set("exp_min", experienceRange.min);
      if (experienceRange.max) params.set("exp_max", experienceRange.max);

      setSearchParams(params, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchValue,
    currentPage,
    itemsPerPage,
    selectedQualifications,
    selectedSubjects,
    selectedClassCategories,
    selectedStatuses,
    selectedGenders,
    locationFilters,
    experienceRange,
    setSearchParams
  ]);

  // Handle data fetching
  useEffect(() => {
    const query = searchParams.get("search");
    dispatch(fetchAdminTeachers({ search: query || "" }));
  }, [dispatch, searchParams.get("search")]); // Only re-fetch if Search Query changes in URL
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchValue,
    selectedQualifications,
    selectedSubjects,
    selectedClassCategories,
    selectedStatuses,
    selectedGenders,
    locationFilters,
    experienceRange,
  ]);
  const availableDistricts = useMemo(() => {
    const districts = new Set();
    teachers.forEach((t) => {
      const d = t.current_address?.district;
      if (d) districts.add(d);
    });
    return Array.from(districts).sort();
  }, [teachers]);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const qNames = (t.teacherqualifications || [])
        .map((q) => q?.qualification?.name?.toLowerCase())
        .filter(Boolean);
      const subjectIds = (t.teachersubjects || [])
        .map((s) => (typeof s === "object" ? s.id || s.subject_id : null))
        .filter(Boolean);
      const addrObj = t.teachersaddress || {};
      const addresses = [
        addrObj.current_address?.state,
        addrObj.permanent_address?.state,
      ]
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      const currentState = t.current_address?.state?.toLowerCase();
      const currentDistrict = t.current_address?.district?.toLowerCase();

      const pincode = String(t.current_address?.pincode || "").toLowerCase();

      const nameMatch =
        !searchValue ||
        `${t.Fname || ""} ${t.Lname || ""}`
          .toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        (t.email || "").toLowerCase().includes(searchValue.toLowerCase()) ||
        String(t.id || "").includes(searchValue);

      const qualMatch =
        selectedQualifications.length === 0 ||
        selectedQualifications.some(
          (q) =>
            qNames.includes(q) ||
            (t.last_education?.qualification?.name || "").toLowerCase() === q
        );

      const subjectMatch =
        selectedSubjects.length === 0 ||
        selectedSubjects.some((sId) => subjectIds.includes(sId));

      const locationMatch =
        (locationFilters.state?.length === 0 ||
          locationFilters.state?.some(
            (s) =>
              addresses.includes(s.toLowerCase()) ||
              currentState === s.toLowerCase()
          )) &&
        (locationFilters.district?.length === 0 ||
          locationFilters.district?.some(
            (d) => currentDistrict === d.toLowerCase()
          )) &&
        (locationFilters.pincode?.length === 0 ||
          locationFilters.pincode?.some((p) => pincode.includes(p.toLowerCase())));

      const statusMatch =
        selectedStatuses.length === 0 ||
        (selectedStatuses.includes("active") && t.is_active) ||
        (selectedStatuses.includes("inactive") && !t.is_active);

      const genderMatch =
        selectedGenders.length === 0 ||
        (t.gender && selectedGenders.includes(t.gender.toLowerCase()));

      const experienceMatch =
        (!experienceRange.min ||
          (t.experience_years &&
            t.experience_years >= parseInt(experienceRange.min))) &&
        (!experienceRange.max ||
          (t.experience_years &&
            t.experience_years <= parseInt(experienceRange.max)));

      const classMatch =
        selectedClassCategories.length === 0 ||
        selectedClassCategories.some((c) =>
          t.class_categories?.some(
            (cat) => cat?.name?.toLowerCase() === c.toLowerCase()
          )
        );

      return (
        nameMatch &&
        qualMatch &&
        subjectMatch &&
        locationMatch &&
        statusMatch &&
        genderMatch &&
        experienceMatch &&
        classMatch
      );
    });
  }, [
    teachers,
    searchValue,
    selectedQualifications,
    selectedSubjects,
    selectedClassCategories,
    locationFilters,
    selectedStatuses,
    selectedGenders,
    experienceRange,
  ]);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTeachers = filtered.slice(indexOfFirst, indexOfLast);

  const getVisiblePageNumbers = () => {
    const nums = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (totalPages <= 7) return nums;
    if (currentPage <= 3) return [...nums.slice(0, 5), "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [1, "...", ...nums.slice(totalPages - 5)];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleRefresh = () => {
    dispatch(fetchTeachers({}));
    setToast({
      open: true,
      type: "success",
      message: "Teacher data refreshed",
    });
  };

  const handleClearFilters = () => {
    setSearchParams({}, { replace: true });
    setSelectedQualifications([]);
    setSelectedSubjects([]);
    setSelectedClassCategories([]);
    setSelectedStatuses([]);
    setSelectedGenders([]);
    setLocationFilters({ state: [], district: [], pincode: [] });
    setLocationInputs({ state: "", district: "", pincode: "" });
    setExperienceRange({ min: "", max: "" });
    setSearchValue("");
    setCurrentPage(1);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
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
        (t.teacherqualifications || [])
          .map((q) => q?.qualification?.name)
          .filter(Boolean)
          .join("; ") ||
          t.last_education?.qualification?.name ||
          "",
        [
          t.teachersaddress?.current_address?.state,
          t.teachersaddress?.permanent_address?.state,
        ]
          .filter(Boolean)
          .join("; ") ||
          t.current_address?.state ||
          "",
      ]),
    ]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
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
    setToast({
      open: true,
      type: "success",
      message: `Exported ${filtered.length} teachers`,
    });
  };

  const activeTeachers = teachers.filter((t) => t.is_active === true).length;
  const inactiveTeachers = teachers.filter((t) => t.is_active === false).length;

  const openConfirm = (id, current) =>
    setConfirmModal({ open: true, id, status: current });
  const closeConfirm = () =>
    setConfirmModal({ open: false, id: null, status: null });
  const confirmToggle = async () => {
    const { id, status: cur } = confirmModal;
    try {
      const teacher = teachers.find((t) => t.id === id);
      if (!teacher) throw new Error("Teacher not found");
      await updateTeacher(id, { email: teacher.email, is_active: !cur });
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !cur } : t))
      );
      setToast({
        open: true,
        type: "success",
        message: `Teacher ${!cur ? "activated" : "deactivated"}`,
      });
    } catch (e) {
      setToast({
        open: true,
        type: "error",
        message: e?.message || "Failed to update status",
      });
    } finally {
      closeConfirm();
    }
  };

  useEffect(() => {
    if (toast.open) {
      const t = setTimeout(
        () => setToast((s) => ({ ...s, open: false })),
        3000
      );
      return () => clearTimeout(t);
    }
  }, [toast.open]);

  return (
    <Layout>
      {/* Header */}
      <div className="space-y-4 mb-6 p-4">
        {/* Header Top: Title + Stats + Main Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Teachers
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                {teachers.length}
              </span>{" "}
              total
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-green-600 font-medium">
                {activeTeachers} active
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-gray-500">{inactiveTeachers} inactive</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-all text-sm font-medium"
            >
              <IoReloadOutline className="text-lg" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg flex items-center gap-2 transition-all text-sm font-medium border border-transparent"
            >
              <IoDownloadOutline className="text-lg" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Filter + View Toggle */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Search by name, email, or ID..."
            />
          </div>

          {/* Right Group */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Filter Trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedQualifications.length ||
                selectedSubjects.length ||
                selectedStatuses.length
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MdFilterAlt className="text-lg" />
              Filters
              {filtered.length !== teachers.length && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  !
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "card"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List/Card results */}
      {status === "loading" ? (
        <DataLoader message="Fetching teacher profiles..." minHeight="400px" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-2">🧑‍🏫</div>
          <h3 className="text-lg font-semibold text-text mb-1">
            No teachers found
          </h3>
          <p className="text-sm text-secondary">
            Try adjusting your search or filters and try again.
          </p>
        </div>
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentTeachers.map((t) => {
                const currentAddress =
                  t.teachersaddress?.current_address || t.current_address || {};
                const latestEducation = t.last_education;
                const initials = `${t.Fname?.charAt(0) || ""}${
                  t.Lname?.charAt(0) || ""
                }`.toUpperCase();
                const subNames = t.subjects || (t.teachersubjects || []).map(s => s.subject_name || s.subject?.subject_name || s);
                const catNames = t.class_categories || (t.teacherclasscategory || []).map(c => c.class_category?.name || c.name);

                const subjects = subNames.filter(Boolean).join(", ") || "—";
                const categories = catNames.filter(Boolean).join(", ") || "—";
                const qualifications =
                  (t.teacherqualifications || [])
                    .map((q) => q?.qualification?.name)
                    .filter(Boolean)
                    .join(", ") ||
                  "—";

                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 group relative"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-white shadow-sm">
                        {t.profile_picture ? (
                          <img
                            src={t.profile_picture}
                            alt={`${t.Fname} ${t.Lname}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold text-gray-900 truncate">
                          {t.Fname} {t.Lname}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              t.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <p className="text-xs text-gray-500 truncate">
                            {t.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">
                          Qualification
                        </p>
                        <p className="text-gray-700 font-medium truncate" title={qualifications}>
                          {qualifications}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">
                          Location
                        </p>
                        <p className="text-gray-700 font-medium truncate">
                          {currentAddress.district || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">
                          Category
                        </p>
                        <p className="text-gray-700 font-medium truncate" title={categories}>
                          {categories}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">
                          Subjects
                        </p>
                        <p className="text-gray-700 font-medium truncate" title={subjects}>
                          {subjects}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-gray-400 font-medium mb-0.5 uppercase tracking-wider text-[10px]">
                          Joined
                        </p>
                        <p className="text-gray-700 font-medium truncate">
                          {t.date ? new Date(t.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirm(t.id, t.is_active)}
                          className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                            t.is_active
                              ? "border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                              : "border-green-100 text-green-600 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {t.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                      <Link
                        to={`/admin/view/teacher/${t.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Profile"
                      >
                        <FiChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Qualification</th>
                      <th className="px-4 py-3">Class Categories</th>
                      <th className="px-4 py-3">Subjects</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentTeachers.map((t) => {
                      const currentAddress =
                        t.teachersaddress?.current_address ||
                        t.current_address ||
                        {};
                      const latestEducation = t.last_education;
                      const initials = `${t.Fname?.charAt(0) || ""}${
                        t.Lname?.charAt(0) || ""
                      }`.toUpperCase();
                      const subNames = t.subjects || (t.teachersubjects || []).map(s => s.subject_name || s.subject?.subject_name || s);
                      const catNames = t.class_categories || (t.teacherclasscategory || []).map(c => c.class_category?.name || c.name);

                      const subjects = subNames.filter(Boolean).join(", ") || "—";
                      const categories = catNames.filter(Boolean).join(", ") || "—";
                      const qualifications =
                        (t.teacherqualifications || [])
                           .map((q) => q?.qualification?.name)
                           .filter(Boolean)
                           .join(", ") ||
                        latestEducation?.qualification?.name ||
                        "—";
                      
                      const joinDate = t.date ? new Date(t.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : "—";

                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden shrink-0">
                                {t.profile_picture ? (
                                  <img
                                    src={t.profile_picture}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="min-w-0 max-w-[180px]">
                                <div className="font-semibold text-gray-900 text-sm truncate">
                                  {t.Fname} {t.Lname}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {t.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="text-sm text-gray-700 max-w-[150px] truncate"
                              title={qualifications}
                            >
                              {qualifications}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="text-sm text-gray-700 max-w-[150px] truncate"
                              title={categories}
                            >
                              {categories}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="text-sm text-gray-700 max-w-[150px] truncate"
                              title={subjects}
                            >
                              {subjects}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700">
                              {currentAddress.district || "—"}
                              {currentAddress.state && (
                                <span className="text-gray-400 text-xs block">
                                  {currentAddress.state}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700">
                              {joinDate}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                t.is_active
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {t.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                              <Link
                                to={`/admin/view/teacher/${t.id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ring-1 ring-inset ring-indigo-100 transition-all"
                                title="View Profile"
                              >
                                <FiEye size={16} />
                              </Link>
                              <button
                                onClick={() => openConfirm(t.id, t.is_active)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg ring-1 ring-inset transition-all ${
                                  t.is_active
                                    ? "bg-red-50 text-red-600 hover:bg-red-100 ring-red-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100 ring-green-100"
                                }`}
                                title={t.is_active ? "Deactivate" : "Activate"}
                              >
                                {t.is_active ? (
                                  <FiX size={16} />
                                ) : (
                                  <FiCheck size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? "bg-background text-secondary/50 cursor-not-allowed"
                    : "bg-white text-text hover:bg-background"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-background text-secondary/50 cursor-not-allowed"
                    : "bg-white text-text hover:bg-background"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text">
                  Showing{" "}
                  <span className="font-semibold">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLast, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold">{filtered.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-lg"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-lg px-2 py-2 text-secondary ${
                      currentPage === 1
                        ? "cursor-not-allowed bg-background"
                        : "hover:bg-background bg-white"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {getVisiblePageNumbers().map((n, idx) =>
                    n === "..." ? (
                      <span
                        key={`e-${idx}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-text bg-white"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === n
                            ? "bg-primary text-white z-10"
                            : "bg-white text-secondary hover:bg-background"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-lg px-2 py-2 text-secondary ${
                      currentPage === totalPages
                        ? "cursor-not-allowed bg-background"
                        : "hover:bg-background bg-white"
                    }`}
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
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeConfirm}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-5 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-text mb-2">
              Confirm Status Change
            </h3>
            <p className="text-sm text-secondary mb-4">
              Are you sure you want to{" "}
              {confirmModal.status ? "deactivate" : "activate"} this teacher?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeConfirm}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 text-text"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className="px-3 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.open && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-2 text-sm">
          <span
            className={
              toast.type === "error"
                ? "text-rose-600"
                : toast.type === "success"
                ? "text-emerald-600"
                : "text-text"
            }
          >
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
        indianStates={INDIAN_STATES}
        availableDistricts={availableDistricts}
      />
    </Layout>
  );
};

export default ManageTeacher;
