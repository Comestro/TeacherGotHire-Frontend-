import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsBriefcase, BsGeoAlt, BsGrid, BsTable, BsArrowClockwise } from "react-icons/bs";
import { MdSchool, MdFilterAltOff } from "react-icons/md";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoReloadOutline } from "react-icons/io5";
import { fetchTeachers } from "../../features/teacherFilterSlice";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (data) {
      setTeachers(data);
    }
  }, [data]);

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
    <div className="w-full min-h-screen bg-gray-50 p-2 sm:p-4 rounded shadow relative">
      {/* Toolbar with view toggle, refresh, and clear filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-2 bg-white rounded-lg shadow-sm gap-2">
        <div className="text-lg font-semibold text-gray-700">
          Teacher Directory
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({teachers.length} results)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm ${viewMode === 'card'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <BsGrid className="mr-1" /> Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center text-sm ${viewMode === 'table'
                  ? 'bg-white shadow-sm text-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <BsTable className="mr-1" /> Table
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center shadow-sm"
            aria-label="Refresh data"
          >
            <BsArrowClockwise className="mr-1" /> Refresh
          </button>

          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 flex items-center shadow-sm"
            aria-label="Clear filters"
          >
            <MdFilterAltOff className="mr-1" /> Clear Filters
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mx-auto max-w-7xl">
              {currentTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full group"
                >
                  {/* Card Header with banner and profile image */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-r from-teal-500 to-teal-400"></div>
                    <div className="absolute -bottom-12 left-6 ring-4 ring-white rounded-full">
                      <img
                        src={
                          teacher.profiles?.profile_picture ||
                          "/images/profile.jpg"
                        }
                        alt={teacher.Fname}
                        className="w-24 h-24 rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-teal-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {teacher.teacherexperiences.length}+ Years Exp
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-14 flex-grow flex flex-col">
                    {/* Teacher Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                        {teacher.Fname} {teacher.Lname}
                      </h3>
                      <div className="flex items-center mt-1 text-gray-500 text-sm">
                        <BsGeoAlt className="mr-1.5 text-teal-500" />
                        <span>{teacher.teachersaddress[0]?.district || "Location not specified"}</span>
                      </div>
                    </div>

                    {/* Qualifications & Experience */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center mb-1">
                          <MdSchool className="text-teal-500 mr-2" />
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Education</span>
                        </div>
                        <p className="font-medium text-gray-800 line-clamp-1">
                          {teacher.teacherqualifications[0]?.qualification.name || "Not specified"}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center mb-1">
                          <BsBriefcase className="text-teal-500 mr-2" />
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Experience</span>
                        </div>
                        <p className="font-medium text-gray-800">
                          {teacher.teacherexperiences.length} Position{teacher.teacherexperiences.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2"></div>
                        Skills & Expertise
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.teacherskill.slice(0, 4).map((skill) => (
                          <span
                            key={skill.skill.id}
                            className="bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full border border-teal-100"
                          >
                            {skill.skill.name}
                          </span>
                        ))}
                        {teacher.teacherskill.length > 4 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            +{teacher.teacherskill.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teaching Preferences */}
                    <div className="mb-6 mt-auto">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                        Teaching Preferences
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.preferences[0]?.class_category
                          .slice(0, 2)
                          .map((category) => (
                            <span
                              key={category.id}
                              className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full border border-indigo-100"
                            >
                              {category.name}
                            </span>
                          ))}
                        {teacher.preferences[0]?.prefered_subject
                          .slice(0, 2)
                          .map((subject) => (
                            <span
                              key={subject.id}
                              className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full border border-purple-100"
                            >
                              {subject.subject_name}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`teacher/${teacher.id}`}
                      className="w-full flex items-center justify-center gap-1.5 text-sm bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-lg transition-all duration-300 font-medium shadow-sm"
                    >
                      View Full Profile
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              src={teacher.profiles?.profile_picture || "/images/profile.jpg"}
                              alt={teacher.Fname}
                              loading="lazy"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.Fname} {teacher.Lname}</div>
                            <div className="text-xs text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.teachersaddress[0]?.district || "Not specified"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.teacherqualifications[0]?.qualification.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {teacher.teacherexperiences.length} Positions
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {teacher.teacherskill.slice(0, 2).map((skill) => (
                            <span
                              key={skill.skill.id}
                              className="bg-teal-50 text-teal-800 text-xs px-1.5 py-0.5 rounded-full border border-teal-100"
                            >
                              {skill.skill.name}
                            </span>
                          ))}
                          {teacher.teacherskill.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{teacher.teacherskill.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`teacher/${teacher.id}`}
                          className="text-teal-600 hover:text-teal-900 px-3 py-1 bg-teal-50 rounded-md transition-colors duration-200"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-4 shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${currentPage === 1
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${currentPage === totalPages
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, teachers.length)}
                  </span>{' '}
                  of <span className="font-medium">{teachers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${currentPage === 1
                        ? 'cursor-not-allowed bg-gray-50'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {getVisiblePageNumbers().map((pageNumber, idx) => (
                    pageNumber === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === pageNumber
                            ? 'bg-teal-50 text-teal-600 border-teal-500 z-10'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${currentPage === totalPages
                        ? 'cursor-not-allowed bg-gray-50'
                        : 'hover:bg-gray-50'
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
            <div className="text-5xl sm:text-6xl text-gray-300 mb-4">🏫</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              No Teachers Found
            </h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              We couldn't find any teachers matching your search criteria.
            </p>
            <button
              onClick={handleRefresh}
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center justify-center gap-2 mx-auto"
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