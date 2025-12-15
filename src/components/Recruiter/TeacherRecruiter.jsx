import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useOutletContext,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { BsBriefcase, BsGeoAlt, BsArrowClockwise } from "react-icons/bs";
import { MdSchool, MdFilterAltOff, MdFilterAlt } from "react-icons/md";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { IoReloadOutline } from "react-icons/io5";
import {
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlinePhone,
} from "react-icons/hi";
import {
  fetchTeachers,
  searchTeachers,
} from "../../features/teacherFilterSlice";
import { getClassCategory } from "../../features/jobProfileSlice"; // Import action
import LocationModal from "./components/LocationModal";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isOpen, setIsOpen } = useOutletContext();

  const { data, status, error } = useSelector((state) => state.teachers);
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
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 4) + "****" + phone.slice(-2);
  };

  const maskEmail = (email) => {
    if (!email) return email;
    const [local, domain] = email.split("@");
    if (!domain || local.length <= 2) return email;
    return local.slice(0, 2) + "***@" + domain;
  };

  useEffect(() => {
    if (data) {
      setTeachers(data);
    }
  }, [data]);
  const [missingFields, setMissingFields] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  useEffect(() => {
    const jobType = searchParams.get("job_type");
    const classCategory = searchParams.get("class_category");
    const subject = searchParams.get("subject") || searchParams.get("subject");
    const missing = [];
    if (!classCategory) missing.push("class_category");
    if (!subject) missing.push("subject");

    setMissingFields(missing);
  }, [searchParams]);
  const { classCategories } = useSelector((state) => state.jobProfile);

  useEffect(() => {
    dispatch(getClassCategory());
  }, [dispatch]);
  useEffect(() => {
    if (missingFields.length > 0) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    const hasPossibleIds = [
      searchParams.get("class_category"),
      searchParams.get("subject"),
    ].some((val) => val && val.split(",").some((v) => !isNaN(v)));
    if (hasPossibleIds && (!classCategories || classCategories.length === 0)) {
      return;
    }

    const filters = {};
    const getParams = (key) =>
      searchParams.getAll(key).flatMap((v) => v.split(","));

    const jobTypes = getParams("job_type");
    if (jobTypes.length > 0) filters.job_type = jobTypes;
    const rawCats = getParams("class_category");
    if (rawCats.length > 0) {
      filters.class_category = rawCats.map((val) => {
        if (!isNaN(val) && classCategories?.length > 0) {
          const cat = classCategories.find(
            (c) => c.id?.toString() === val.toString()
          );
          return cat ? cat.name : val;
        }
        return val;
      });
    }
    let rawSubs = getParams("subject");
    if (rawSubs.length === 0) rawSubs = getParams("subject");

    if (rawSubs.length > 0) {
      filters.subject = rawSubs.map((val) => {
        // Map to 'subject' for API
        if (!isNaN(val) && classCategories?.length > 0) {
          for (const cat of classCategories) {
            if (cat.subject) {
              const foundSub = cat.subject.find(
                (s) => s.id?.toString() === val.toString()
              );
              if (foundSub) return foundSub.subject_name;
            }
          }
        }
        return val;
      });
    }

    if (searchParams.get("state"))
      filters.state = searchParams.get("state").split(",");
    if (searchParams.get("district"))
      filters.district = searchParams.get("district").split(",");
    if (searchParams.get("pincode"))
      filters.pincode = searchParams.get("pincode").split(",");
    if (searchParams.get("post_office"))
      filters.post_office = searchParams.get("post_office").split(",");
    if (searchParams.get("area"))
      filters.area = searchParams.get("area").split(",");

    dispatch(fetchTeachers(filters));
  }, [dispatch, searchParams, missingFields, classCategories]);

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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = teachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleRefresh = () => {
    setLoading(true);

    dispatch(fetchTeachers());
  };
  const handleClearFilters = () => {
    handleRefresh();
  };
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  const getVisiblePageNumbers = () => {
    if (totalPages <= 7) {
      return pageNumbers;
    }

    if (currentPage <= 3) {
      return [...pageNumbers.slice(0, 5), "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", ...pageNumbers.slice(totalPages - 5)];
    }

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

  return (
    <div className="w-full min-h-screen bg-background p-2 sm:p-4 relative">
      {/* Toolbar with view toggle, refresh, and clear filters */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        {/* Top Section - Title, Search Bar and Mobile Filter Button */}
        <div className="space-y-3 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-text">
                Teacher List
              </h1>
              <p className="text-xs sm:text-sm text-secondary font-normal mt-0.5">
                {teachers.length} {teachers.length === 1 ? "result" : "results"}{" "}
                found
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
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
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
      </div>

      {/* Missing Fields Message */}
      {missingFields.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <MdFilterAlt className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Filters Required
          </h3>
          <p className="text-slate-500 max-w-sm mb-6">
            Please select a{" "}
            <span className="font-medium text-slate-700">Class Category</span>{" "}
            and <span className="font-medium text-slate-700">Subject</span> to
            see available teachers.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <MdFilterAlt size={16} />
            <span>Select Filters</span>
          </button>
        </div>
      ) : status === "loading" ? (
        <div className="w-full h-full flex justify-center items-center mt-16">
          <div className="h-fit mt-20">
            <Loader />
          </div>
        </div>
      ) : teachers?.length > 0 ? (
        <>
          {/* List View - Always Visible */}
          <div className="space-y-3 mx-auto">
            {currentTeachers.map((teacher) => {
              const currentAddress = teacher.current_address || {};
              const latestExperience = teacher.last_experience;
              const highestQualification = teacher.last_education;

              return (
                <div
                  key={teacher.id}
                  className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-lg transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Left: Profile Image */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border-2 border-slate-100 group-hover:border-teal-100 transition-colors">
                        <img
                          className="w-full h-full object-cover"
                          src={teacher.profile_picture || "/images/profile.jpg"}
                          alt={teacher.Fname}
                          loading="lazy"
                        />
                      </div>
                      {/* Status Indicator (Optional) */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Middle: Main Information */}
                    <div className="flex-1 min-w-0 w-full">
                      {/* Name and Role */}
                      <div className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                              {teacher.Fname} {teacher.Lname}
                            </h3>
                            <p className="text-sm font-semibold text-teal-600 mt-0.5">
                              {latestExperience?.role?.jobrole_name ||
                                "Available for Hire"}
                            </p>
                          </div>

                          {/* Mobile View Profile Button (Hidden on Desktop) */}
                          <Link
                            to={`teacher/${teacher.id}`}
                            className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          >
                            <FiArrowRight />
                          </Link>
                        </div>

                        {currentAddress.district && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                            <HiOutlineLocationMarker
                              className="text-slate-400"
                              size={15}
                            />
                            {currentAddress.area
                              ? `${currentAddress.area}, `
                              : ""}
                            {currentAddress.district}, {currentAddress.state}
                          </p>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 pt-4 border-t border-slate-100">
                        {/* Education */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <MdSchool size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Education
                            </p>
                            <p
                              className="text-sm font-medium text-slate-700 truncate"
                              title={highestQualification?.qualification?.name}
                            >
                              {highestQualification?.qualification?.name ||
                                "Not Specified"}
                            </p>
                          </div>
                        </div>
                        {/* Experience (Duration or Institution) */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                            <BsBriefcase size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Experience
                            </p>
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {latestExperience
                                ? `${latestExperience.institution}`
                                : "Fresher"}
                            </p>
                          </div>
                        </div>
                        <div className="hidden lg:block"></div>{" "}
                        {/* Spacer for grid alignment if needed, or add Salary/etc */}
                      </div>
                    </div>

                    {/* Right: Action Button (Desktop) */}
                    <div className="hidden sm:flex flex-shrink-0 flex-col justify-center items-end self-center pl-4 border-l border-slate-100 h-24">
                      <Link
                        to={`teacher/${teacher.id}`}
                        className="inline-flex items-center justify-center gap-2 text-sm bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg transition-all font-semibold shadow-sm hover:shadow-teal-200 hover:-translate-y-0.5"
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={prevPage}
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
                onClick={nextPage}
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
                  <span className="font-semibold">{indexOfFirstItem + 1}</span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, teachers.length)}
                  </span>{" "}
                  of <span className="font-semibold">{teachers.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-lg"
                  aria-label="Pagination"
                >
                  <button
                    onClick={prevPage}
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

                  {getVisiblePageNumbers().map((pageNumber, idx) =>
                    pageNumber === "..." ? (
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
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNumber
                            ? "bg-primary text-white z-10"
                            : "bg-white text-secondary hover:bg-background"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}

                  <button
                    onClick={nextPage}
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <span className="text-3xl">🤔</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Teachers Found
          </h3>
          <p className="text-slate-500 max-w-sm mb-8">
            We couldn't find any teachers matching your criteria.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/get-preferred-teacher"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-teal-200"
            >
              शिक्षक खोजें
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Adjust Filters
            </button>
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
          area: searchParams.get("area"),
        }}
      />
    </div>
  );
};

export default TeacherFilter;
