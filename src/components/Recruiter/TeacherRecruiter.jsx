import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { Link, useOutletContext, useSearchParams, useNavigate } from "react-router-dom";
import { BsBriefcase, BsGeoAlt, BsGrid, BsList, BsArrowClockwise } from "react-icons/bs";
import { MdSchool, MdFilterAltOff, MdFilterAlt } from "react-icons/md";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoReloadOutline } from "react-icons/io5";
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineAcademicCap, HiOutlinePhone } from "react-icons/hi";
import { fetchTeachers, searchTeachers } from "../../features/teacherFilterSlice";
import { getClassCategory } from "../../features/jobProfileSlice"; // Import action
import LocationModal from "./components/LocationModal";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'list'); // 'card' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get sidebar state from layout context
  const { isOpen, setIsOpen } = useOutletContext();

  const { data, status, error } = useSelector((state) => state.teachers);

  // Check for required filters
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) return; // Skip check for logged-in users

    const jobType = searchParams.get("job_type");
    const classCategory = searchParams.get("class_category");
    const subject = searchParams.get("subject");

    if (!jobType || !classCategory || !subject) {
      navigate("/get-preferred-teacher");
    }
  }, [searchParams, navigate]);

  // Utility functions for masking sensitive data
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 4) + '****' + phone.slice(-2);
  };

  const maskEmail = (email) => {
    if (!email) return email;
    const [local, domain] = email.split('@');
    if (!domain || local.length <= 2) return email;
    return local.slice(0, 2) + '***@' + domain;
  };

  useEffect(() => {
    if (data) {
      setTeachers(data);
    }
  }, [data]);


  // Check for required filters
  const [missingFields, setMissingFields] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  useEffect(() => {
    // We need at least one of these to show results
    const jobType = searchParams.get("job_type");
    const classCategory = searchParams.get("class_category");
    const subject = searchParams.get("subject") || searchParams.get("subject");
    
    // We don't strictly require these to load the page anymore since we show an empty state,
    // but we can use this to drive the "start search" UI.
    const missing = [];
    if (!classCategory) missing.push("class_category");
    if (!subject) missing.push("subject");
    
    setMissingFields(missing);
  }, [searchParams]);

  // Get Class Categories for ID mapping
  const { classCategories } = useSelector((state) => state.jobProfile);
  
  useEffect(() => {
    dispatch(getClassCategory());
  }, [dispatch]);

  // Initial fetch of all teachers with filters
  useEffect(() => {
    // Don't fetch if required fields are missing
    if (missingFields.length > 0) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    
    // Wait for classCategories to load if we have potential IDs (numbers) in URL
    const hasPossibleIds = [
        searchParams.get("class_category"),
        searchParams.get("subject")
    ].some(val => val && val.split(",").some(v => !isNaN(v)));

    // If we need mapping but data isn't ready, wait
    if (hasPossibleIds && (!classCategories || classCategories.length === 0)) {
        return;
    }

    const filters = {};
    
    // Helper to get all values from either repeated keys or comma-separated strings
    const getParams = (key) => searchParams.getAll(key).flatMap(v => v.split(","));

    const jobTypes = getParams("job_type");
    if (jobTypes.length > 0) filters.job_type = jobTypes;
    
    // Handle Class Category (Map ID -> Name if needed)
    const rawCats = getParams("class_category");
    if (rawCats.length > 0) {
        filters.class_category = rawCats.map(val => {
            if (!isNaN(val) && classCategories?.length > 0) {
                const cat = classCategories.find(c => c.id?.toString() === val.toString());
                return cat ? cat.name : val;
            }
            return val;
        });
    }

    // Handle subject (Map ID -> Name if needed)
    // Check 'subject' (singular) first, then 'subject' (plural fallback)
    let rawSubs = getParams("subject");
    if (rawSubs.length === 0) rawSubs = getParams("subject");

    if (rawSubs.length > 0) {
        filters.subject = rawSubs.map(val => { // Map to 'subject' for API
            if (!isNaN(val) && classCategories?.length > 0) {
                // Search all categories for this subject ID
                for (const cat of classCategories) {
                    if (cat.subject) {
                        const foundSub = cat.subject.find(s => s.id?.toString() === val.toString());
                        if (foundSub) return foundSub.subject_name;
                    }
                }
            }
            return val;
        });
    }

    if (searchParams.get("state")) filters.state = searchParams.get("state").split(",");
    if (searchParams.get("district")) filters.district = searchParams.get("district").split(",");
    if (searchParams.get("pincode")) filters.pincode = searchParams.get("pincode").split(",");
    if (searchParams.get("post_office")) filters.post_office = searchParams.get("post_office").split(",");
    if (searchParams.get("area")) filters.area = searchParams.get("area").split(",");

    dispatch(fetchTeachers(filters));
  }, [dispatch, searchParams, missingFields, classCategories]);

  // Handle screen size changes for view mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'card' : 'list');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search functionality with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue.trim()) {
        dispatch(searchTeachers(searchValue));
      } else {
        dispatch(fetchTeachers({}));
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchValue, dispatch]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      dispatch(searchTeachers(searchValue));
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = teachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(teachers.length / itemsPerPage);

  // Pagination navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    
    dispatch(fetchTeachers());
  };

  // Clear filters (assuming you'll have filters in the future)
  const handleClearFilters = () => {
    // This would reset any filter state you might add later
    handleRefresh();
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Display visible page numbers with ellipsis
  const getVisiblePageNumbers = () => {
    if (totalPages <= 7) {
      return pageNumbers;
    }

    if (currentPage <= 3) {
      return [...pageNumbers.slice(0, 5), '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', ...pageNumbers.slice(totalPages - 5)];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages
    ];
  };

  return (
    <div className="w-full min-h-screen bg-background p-2 sm:p-4 relative">
      {/* Toolbar with view toggle, refresh, and clear filters */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        {/* Top Section - Title, Search Bar and Mobile Filter Button */}
        <div className="space-y-3 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-text">Teacher List</h1>
              <p className="text-xs sm:text-sm text-secondary font-normal mt-0.5">
                {teachers.length} {teachers.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-1.5 font-medium transition-colors shadow-sm"
              aria-label="Open filters"
            >
              <MdFilterAlt size={18} />
              <span className="hidden xs:inline">Filters</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, location, or qualification..."
              className="w-full bg-background border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-2.5 pl-10 text-sm text-text placeholder-secondary focus:outline-none transition-all"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Section - View Toggle and Clear Filters */}
        <div className="hidden md:flex items-center justify-between gap-3 p-4">
          {/* View Mode Toggle */}
          <div className="flex bg-background rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-secondary hover:text-text'
              }`}
              aria-label="List view"
            >
              <BsList size={18} />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all ${
                viewMode === 'card'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-secondary hover:text-text'
              }`}
              aria-label="Card view"
            >
              <BsGrid size={18} />
              <span className="hidden sm:inline">Card</span>
            </button>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-background hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg text-secondary hover:text-red-600 flex items-center gap-1.5 font-medium transition-all"
            aria-label="Clear filters"
          >
            <MdFilterAltOff size={18} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Missing Fields Message */}
      {missingFields.length > 0 ? (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="w-full max-w-2xl space-y-8">
            {/* Icon & Header */}
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                <HiOutlineLocationMarker className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Location Required
                </h3>
                <p className="text-gray-500 mt-2 text-lg">
                  To show you the best teachers nearby, please complete your location details.
                </p>
              </div>
            </div>

            {/* Missing Fields List */}
            <div className="flex flex-wrap justify-center gap-3">
              {missingFields.map((field, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{field}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all w-full sm:w-auto min-w-[200px]"
              >
                <span>Add Location Details</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      ) : status === 'loading' ? (
        <div className="w-full h-full flex justify-center items-center mt-16">
          <div className="h-fit mt-20">
            <Loader />
          </div>
        </div>
      ) : teachers?.length > 0 ? (
        <>
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mx-auto">
              {currentTeachers.map((teacher) => {
                // Get current address if exists
                const currentAddress = teacher.current_address || {};

                // Get latest experience
                const latestExperience = teacher.last_experience;

                // Get highest qualification
                const highestQualification = teacher.last_education;

                return (
                  <div
                    key={teacher.id}
                    className="bg-white p-5 rounded-lg hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Header Section */}
                    <div className="border-b pb-3 mb-4 flex items-center gap-4">
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                        src={teacher.profile_picture || "/images/profile.jpg"}
                        alt={teacher.Fname}
                        loading="lazy"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-text">
                          {teacher.Fname} {teacher.Lname}
                        </h2>
                        {currentAddress.district && (
                          <p className="text-sm text-secondary mt-0.5 flex items-center gap-1">
                            <HiOutlineLocationMarker className="text-accent" size={14} />
                            {currentAddress.district}, {currentAddress.state}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Key Information */}
                    <div className="space-y-3 mb-4">
                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <HiOutlineMail className="text-accent mt-0.5 flex-shrink-0" size={18} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary font-medium uppercase">Email</p>
                          <p className="text-sm text-text truncate">{maskEmail(teacher.email)}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      {teacher.phone_number && (
                        <div className="flex items-start gap-3">
                          <HiOutlinePhone className="text-accent mt-0.5 flex-shrink-0" size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium uppercase">Phone</p>
                            <p className="text-sm text-text">{maskPhoneNumber(teacher.phone_number)}</p>
                          </div>
                        </div>
                      )}

                    

                      {/* Job Role */}
                      {latestExperience && (
                        <div className="flex items-start gap-3">
                          <BsBriefcase className="text-accent mt-0.5 flex-shrink-0" size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium uppercase">Current Role</p>
                            <p className="text-sm text-text font-medium">{latestExperience.role?.jobrole_name || "N/A"}</p>
                            <p className="text-xs text-secondary mt-0.5">{latestExperience.institution}</p>
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {highestQualification && (
                        <div className="flex items-start gap-3">
                          <HiOutlineAcademicCap className="text-accent mt-0.5 flex-shrink-0" size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium uppercase">Education</p>
                            <p className="text-sm text-text font-medium">{highestQualification.qualification?.name || "N/A"}</p>
                            <p className="text-xs text-secondary mt-0.5">
                              {highestQualification.institution} • {highestQualification.year_of_passing}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`teacher/${teacher.id}`}
                      className="w-full flex items-center justify-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold"
                    >
                      View Full Profile
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3 mx-auto">
              {currentTeachers.map((teacher) => {
                // Get current address if exists
                const currentAddress = teacher.current_address || {};

                // Get latest experience
                const latestExperience = teacher.last_experience;

                // Get highest qualification
                const highestQualification = teacher.last_education;

                return (
                  <div
                    key={teacher.id}
                    className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Left: Profile Image */}
                      <div className="flex-shrink-0">
                        <img
                          className="h-20 w-20 rounded-lg object-cover border-2 border-primary/20"
                          src={teacher.profile_picture || "/images/profile.jpg"}
                          alt={teacher.Fname}
                          loading="lazy"
                        />
                      </div>

                      {/* Middle: Main Information */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Location */}
                        <div className="mb-2">
                          <h3 className="text-lg font-bold text-text truncate">
                            {teacher.Fname} {teacher.Lname}
                          </h3>
                          {currentAddress.district && (
                            <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                              <HiOutlineLocationMarker className="text-accent" size={14} />
                              {currentAddress.district}, {currentAddress.state}
                            </p>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          {/* Email */}
                          <div className="flex items-center gap-2 min-w-0">
                            <HiOutlineMail className="text-accent flex-shrink-0" size={16} />
                            <div className="min-w-0">
                              <p className="text-xs text-secondary font-medium">Email</p>
                              <p className="text-text truncate">{maskEmail(teacher.email)}</p>
                            </div>
                          </div>

                          {/* Phone */}
                          {teacher.phone_number && (
                            <div className="flex items-center gap-2 min-w-0">
                              <HiOutlinePhone className="text-accent flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs text-secondary font-medium">Phone</p>
                                <p className="text-text">{maskPhoneNumber(teacher.phone_number)}</p>
                              </div>
                            </div>
                          )}

                          {/* Current Role */}
                          {latestExperience && (
                            <div className="flex items-center gap-2 min-w-0">
                              <BsBriefcase className="text-accent flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs text-secondary font-medium">Current Role</p>
                                <p className="text-text font-medium truncate">
                                  {latestExperience.role?.jobrole_name || "N/A"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {highestQualification && (
                            <div className="flex items-center gap-2 min-w-0">
                              <HiOutlineAcademicCap className="text-accent flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs text-secondary font-medium">Education</p>
                                <p className="text-text font-medium truncate">
                                  {highestQualification.qualification?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex-shrink-0 flex items-center">
                        <Link
                          to={`teacher/${teacher.id}`}
                          className="inline-flex items-center justify-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg transition-colors font-semibold whitespace-nowrap"
                        >
                          View Profile
                          <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${ currentPage === 1
                    ? 'bg-background text-secondary/50 cursor-not-allowed'
                    : 'bg-white text-text hover:bg-background'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === totalPages
                    ? 'bg-background text-secondary/50 cursor-not-allowed'
                    : 'bg-white text-text hover:bg-background'
                  }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text">
                  Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, teachers.length)}
                  </span>{' '}
                  of <span className="font-semibold">{teachers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-lg" aria-label="Pagination">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-lg px-2 py-2 text-secondary ${currentPage === 1
                        ? 'cursor-not-allowed bg-background'
                        : 'hover:bg-background bg-white'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {getVisiblePageNumbers().map((pageNumber, idx) => (
                    pageNumber === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-text bg-white"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                            ? 'bg-primary text-white z-10'
                            : 'bg-white text-secondary hover:bg-background'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-lg px-2 py-2 text-secondary ${currentPage === totalPages
                        ? 'cursor-not-allowed bg-background'
                        : 'hover:bg-background bg-white'
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
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[60vh]">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 max-w-lg w-full text-center space-y-6 animate-fade-in">
            {/* Icon Circle */}
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-2">
              {error?.detail === "These parameters are required." ? (
                <MdFilterAlt className="w-10 h-10 text-teal-600" />
              ) : (
                <div className="text-4xl">🤔</div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {error?.detail === "These parameters are required." 
                  ? "Start Your Search" 
                  : "No Teachers Found"}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {error?.detail === "These parameters are required."
                  ? "Select a class category and subject to find the perfect teacher for your needs."
                  : "We couldn't find any teachers matching your criteria. Try adjusting your filters or post a requirement."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/get-preferred-teacher"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5"
              >
                <span>Post a Job Requirement</span>
                <FiArrowRight />
              </Link>
              
              <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl font-semibold transition-colors"
                aria-label="Open sidebar filters"
              >
                <MdFilterAlt />
                <span>Adjust Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onApply={(data) => {
          const params = new URLSearchParams(searchParams);
          params.set("state", "Bihar");
          if (data.district) params.set("district", data.district);
          if (data.pincode) params.set("pincode", data.pincode);
          if (data.post_office) params.set("post_office", data.post_office);
          if (data.area) params.set("area", data.area);
          
          navigate(`?${params.toString()}`);
          setIsLocationModalOpen(false);
        }}
        initialData={{
          district: searchParams.get("district"),
          pincode: searchParams.get("pincode"),
          post_office: searchParams.get("post_office"),
          area: searchParams.get("area")
        }}
      />
    </div>
  );
};

export default TeacherFilter;