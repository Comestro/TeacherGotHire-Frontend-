import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom";
import { BsBriefcase, BsGeoAlt, BsGrid, BsList, BsArrowClockwise } from "react-icons/bs";
import { MdSchool, MdFilterAltOff, MdFilterAlt } from "react-icons/md";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoReloadOutline } from "react-icons/io5";
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineAcademicCap, HiOutlinePhone } from "react-icons/hi";
import { fetchTeachers } from "../../features/teacherFilterSlice";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'card' : 'list'); // 'card' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const dispatch = useDispatch();

  // Get sidebar state from layout context
  const { isOpen, setIsOpen } = useOutletContext();

  const { data, status, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (data) {
      setTeachers(data);
    }
  }, [data]);

  // Handle screen size changes for view mode
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'card' : 'list');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-4 bg-white rounded-lg gap-2">
        <div className="text-lg font-semibold text-text">
          Teacher List
          <span className="ml-2 text-sm text-secondary font-normal">
            ({teachers.length} results)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center font-medium transition-colors"
            aria-label="Open filters"
          >
            <MdFilterAlt className="mr-1.5" /> Filters
          </button>

          <div className="flex bg-background rounded-lg p-1">
             <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-white text-primary'
                  : 'text-secondary hover:text-text'
                }`}
            >
              <BsList className="mr-1.5" /> List
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${viewMode === 'card'
                  ? 'bg-white text-primary'
                  : 'text-secondary hover:text-text'
                }`}
            >
              <BsGrid className="mr-1.5" /> Card
            </button>
           
          </div>

          
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm bg-white rounded-lg text-secondary hover:text-text hover:bg-background flex items-center font-medium transition-colors"
            aria-label="Clear filters"
          >
            <MdFilterAltOff className="mr-1.5" /> Clear Filters
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="w-full h-full flex justify-center items-center mt-16">
          <div className="h-fit mt-20">
            <Loader />
          </div>
        </div>
      ) : teachers?.length > 0 ? (
        <>
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mx-auto max-w-7xl">
              {currentTeachers.map((teacher) => {
                // Get current address if exists
                const currentAddress =
                  teacher.teachersaddress?.find((addr) => addr.address_type === "current") || 
                  teacher.teachersaddress?.[0] || {};

                // Get latest experience
                const latestExperience = teacher.teacherexperiences?.[0];

                // Get highest qualification
                const highestQualification = teacher.teacherqualifications?.[0];

                return (
                  <div
                    key={teacher.id}
                    className="bg-white p-5 rounded-lg hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Header Section */}
                    <div className="border-b pb-3 mb-4 flex items-center gap-4">
                      <img
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                        src={teacher.profiles?.profile_picture || "/images/profile.jpg"}
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
                          <p className="text-sm text-text truncate">{teacher.email}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      {teacher.profiles?.phone_number && (
                        <div className="flex items-start gap-3">
                          <HiOutlinePhone className="text-accent mt-0.5 flex-shrink-0" size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary font-medium uppercase">Phone</p>
                            <p className="text-sm text-text">{teacher.profiles.phone_number}</p>
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
            <div className="space-y-3 max-w-7xl mx-auto">
              {currentTeachers.map((teacher) => {
                // Get current address if exists
                const currentAddress =
                  teacher.teachersaddress?.find((addr) => addr.address_type === "current") || 
                  teacher.teachersaddress?.[0] || {};

                // Get latest experience
                const latestExperience = teacher.teacherexperiences?.[0];

                // Get highest qualification
                const highestQualification = teacher.teacherqualifications?.[0];

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
                          src={teacher.profiles?.profile_picture || "/images/profile.jpg"}
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
                              <p className="text-text truncate">{teacher.email}</p>
                            </div>
                          </div>

                          {/* Phone */}
                          {teacher.profiles?.phone_number && (
                            <div className="flex items-center gap-2 min-w-0">
                              <HiOutlinePhone className="text-accent flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs text-secondary font-medium">Phone</p>
                                <p className="text-text">{teacher.profiles.phone_number}</p>
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
        <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 sm:p-8">
          <div className="max-w-md mx-auto">
            <div className="text-5xl sm:text-6xl text-secondary/30 mb-4">🏫</div>
            <h3 className="text-xl sm:text-2xl font-bold text-text mb-2">
              No Teachers Found
            </h3>
            <p className="text-secondary mb-6 text-sm sm:text-base">
              We couldn't find any teachers matching your search criteria.
            </p>
            <button
              onClick={handleRefresh}
              className="text-primary hover:text-accent font-semibold flex items-center justify-center gap-2 mx-auto"
            >
              <IoReloadOutline className="text-lg" />
              Refresh Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherFilter;