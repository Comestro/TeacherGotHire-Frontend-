import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { getTeacher } from "../../services/teacherService";
import { fetchSingleTeacherById } from "../../services/apiService";
import {
  FaArrowLeft,
  FaGraduationCap,
  FaBriefcase,
  FaLightbulb,
  FaChalkboardTeacher,
  FaMapMarkerAlt,
  FaUserCog,
  FaBuilding,
} from "react-icons/fa";
import { requestTeacher } from "../../services/profileServices";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const TeacherViewPage = () => {
  const profile = useSelector((state) => state.auth.userData || {});
  
  const { id } = useParams();
  const [teacher, setTeacher] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("qualifications");
  const [stickyTabs, setStickyTabs] = useState(false);
  const tabsRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [classCategories, setClassCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassCategory, setSelectedClassCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

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
    const loadTeacher = async () => {
      try {
        const data = await fetchSingleTeacherById(id);
        
        setTeacher(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadTeacher();

    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsPosition = tabsRef.current.getBoundingClientRect().top;
        setStickyTabs(tabsPosition <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  // Load class categories and subjects from teacher's preferences
  useEffect(() => {
    if (teacher?.preferences?.length > 0) {
      const teacherPreferences = teacher.preferences[0];
      
      // Set class categories from teacher's preferences
      setClassCategories(teacherPreferences.class_category || []);
      
      // Set subjects from teacher's preferred subjects
      setSubjects(teacherPreferences.prefered_subject || []);
    }
  }, [teacher]);

  const handleRequestTeacher = () => {
    setOpenRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedClassCategory || !selectedSubject) {
      toast.error('Please select both class category and subject', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    try {
      setModalLoading(true);
      setError(null);

      const payload = {
        teacher_id: teacher.id,
        class_category: [parseInt(selectedClassCategory)],
        subject: [parseInt(selectedSubject)],
      };

      await requestTeacher(payload);
      
      setOpenRequestModal(false);
      setSelectedClassCategory('');
      setSelectedSubject('');
      setSuccess(true);
      
      toast.success('Teacher request sent successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
    } catch (err) {
      setError(err.message);
      
      toast.error(`Failed to request teacher: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenRequestModal(false);
    setSelectedClassCategory('');
    setSelectedSubject('');
  };

  // Loading skeletons for better UX during data fetching
  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 w-48 h-48 rounded-full bg-gray-200"></div>
            <div className="flex-grow space-y-4 w-full">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="border-t pt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b p-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 bg-gray-200 rounded w-40 mx-2"
              ></div>
            ))}
          </div>
          <div className="p-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 bg-gray-200 rounded w-full mb-4"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-red-50 text-red-600 rounded-lg shadow p-4">
        Error: {error}
      </div>
    );
  if (!teacher)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-yellow-50 text-yellow-700 rounded-lg shadow p-4">
        Teacher not found
      </div>
    );

  return (
    <div className="bg-background min-h-screen pb-12">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/recruiter"
          className="mb-6 inline-flex items-center text-primary hover:text-accent transition-colors group font-semibold"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Teachers List</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="relative w-40 h-40 md:w-48 md:h-48">
                  <img
                    src={
                      teacher.profiles?.profile_picture || "/images/profile.jpg"
                    }
                    alt={`${teacher.Fname || "Teacher"}'s portrait`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-grow space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-text">
                    {teacher.Fname} {teacher.Lname}
                  </h1>
                  <div className="mt-2 space-y-1">
                    <p className="text-secondary flex items-center justify-center md:justify-start">
                      <svg
                        className="w-5 h-5 mr-2 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {maskEmail(teacher.email)}
                    </p>
                    <p className="text-secondary flex items-center justify-center md:justify-start">
                      <svg
                        className="w-5 h-5 mr-2 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {maskPhoneNumber(teacher.profiles?.phone_number)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-semibold text-text mb-2 flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-2 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Contact Information
                  </h2>
                  <p className="text-secondary">
                    <span className="font-medium">Address: </span>
                    {teacher.teachersaddress?.find((addr) => addr.address_type === "current") ? 
                      `${teacher.teachersaddress.find((addr) => addr.address_type === "current").area}, ${teacher.teachersaddress.find((addr) => addr.address_type === "current").district}, ${teacher.teachersaddress.find((addr) => addr.address_type === "current").state} - ${teacher.teachersaddress.find((addr) => addr.address_type === "current").pincode}` 
                      : 'No address available'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div
          ref={tabsRef}
          className={`bg-white rounded-t-lg transition-all duration-300 ${
            stickyTabs ? "sticky top-0 z-10 rounded-none" : ""
          }`}
        >
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "qualifications"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("qualifications")}
            >
              <FaGraduationCap className="mr-2" />
              <span>Qualifications</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "experience"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("experience")}
            >
              <FaBriefcase className="mr-2" />
              <span>Experience</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "skills"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("skills")}
            >
              <FaLightbulb className="mr-2" />
              <span>Skills</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "preferences"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <FaChalkboardTeacher className="mr-2" />
              <span>Teaching Preferences</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "addresses"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("addresses")}
            >
              <FaMapMarkerAlt className="mr-2" />
              <span>Addresses</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-semibold flex items-center transition-colors ${
                activeTab === "jobpreferences"
                  ? "border-b-2 border-primary text-primary"
                  : "text-secondary hover:text-text"
              }`}
              onClick={() => setActiveTab("jobpreferences")}
            >
              <FaBuilding className="mr-2" />
              <span>Job Preferences</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-6">
          {activeTab === "qualifications" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                  <FaGraduationCap className="mr-2" /> Qualifications
                </h2>
                {teacher.teacherqualifications?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.teacherqualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <h3 className="font-semibold text-text">
                          {qual.qualification?.name}
                        </h3>
                        <p className="text-secondary">
                          {qual.institution}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                            {qual.year_of_passing}
                          </span>
                          <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                            {qual.stream_or_degree || qual.qualification?.name}
                          </span>
                          {qual.grade_or_percentage && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {qual.grade_or_percentage}%
                            </span>
                          )}
                        </div>
                        {qual.session && (
                          <p className="text-xs text-secondary mt-2">
                            Session: {qual.session}
                          </p>
                        )}
                        {qual.subjects && qual.subjects.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-secondary font-medium mb-2">Subjects:</p>
                            <div className="flex flex-wrap gap-1">
                              {qual.subjects.map((subject, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  {subject.name}: {subject.marks}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary italic">
                    No qualification information available
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                <FaBriefcase className="mr-2" /> Experience
              </h2>
              {teacher.teacherexperiences?.length > 0 ? (
                <div className="space-y-4">
                  {teacher.teacherexperiences.map((exp, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className="font-semibold text-text">
                          {exp.institution}
                        </h3>
                        <div className="mt-1 sm:mt-0 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
                          {new Date(exp.start_date).toLocaleDateString()}{" "}
                          -{" "}
                          {exp.end_date
                            ? new Date(exp.end_date).toLocaleDateString()
                            : "Present"}
                        </div>
                      </div>
                      <p className="mt-2 text-secondary">
                        Role: {exp.role?.jobrole_name}
                      </p>
                      <p className="mt-1 text-secondary">
                        {exp.achievements}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">
                  No experience information available
                </p>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                <FaLightbulb className="mr-2" /> Skills
              </h2>
              {teacher.teacherskill?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {teacher.teacherskill.map((skill) => (
                    <span
                      key={skill.skill.id}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {skill.skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">
                  No skill information available
                </p>
              )}
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                <FaChalkboardTeacher className="mr-2" /> Teaching Preferences
              </h2>
              {teacher.preferences?.length > 0 ? (
                <div>
                  {teacher.preferences.map((preference, prefIndex) => (
                    <div key={prefIndex} className="space-y-6">
                      {/* Job Roles */}
                      <div className="p-4 bg-background rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-text flex items-center">
                          <FaUserCog className="mr-2 text-accent" />
                          Preferred Job Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {preference.job_role?.length > 0 ? (
                            preference.job_role.map((role) => (
                              <span
                                key={role.id}
                                className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                              >
                                {role.jobrole_name}
                              </span>
                            ))
                          ) : (
                            <p className="text-secondary italic">
                              No preferred job roles listed
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Class Categories */}
                      <div className="p-4 bg-background rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-text flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Class Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {preference.class_category?.length > 0 ? (
                            preference.class_category.map((category) => (
                              <span
                                key={category.id}
                                className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-semibold"
                              >
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <p className="text-secondary italic">
                              No class categories listed
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Teacher Job Types */}
                      {preference.teacher_job_type && preference.teacher_job_type.length > 0 && (
                        <div className="p-4 bg-background rounded-lg">
                          <h3 className="text-lg font-semibold mb-3 text-text flex items-center">
                            <FaBuilding className="mr-2 text-accent" />
                            Teacher Job Types
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {preference.teacher_job_type.map((jobType, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                              >
                                {jobType}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">
                  No teaching preferences available
                </p>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Addresses
              </h2>
              {teacher.teachersaddress?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacher.teachersaddress.map((address, index) => (
                    <div
                      key={index}
                      className="p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text capitalize">
                          {address.address_type} Address
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          address.address_type === 'current' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {address.address_type}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-secondary">
                          <span className="font-medium">Area:</span> {address.area}
                        </p>
                        <p className="text-secondary">
                          <span className="font-medium">District:</span> {address.district}
                        </p>
                        <p className="text-secondary">
                          <span className="font-medium">State:</span> {address.state}
                        </p>
                        <p className="text-secondary">
                          <span className="font-medium">Pincode:</span> {address.pincode}
                        </p>
                        {address.postoffice && (
                          <p className="text-secondary">
                            <span className="font-medium">Post Office:</span> {address.postoffice}
                          </p>
                        )}
                        {address.block && (
                          <p className="text-secondary">
                            <span className="font-medium">Block:</span> {address.block}
                          </p>
                        )}
                        {address.division && (
                          <p className="text-secondary">
                            <span className="font-medium">Division:</span> {address.division}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary italic">
                  No address information available
                </p>
              )}
            </div>
          )}

          {activeTab === "jobpreferences" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
                <FaBuilding className="mr-2" /> Job Preferences
              </h2>
              {teacher.jobpreferencelocation?.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-background rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-text flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-accent" />
                      Preferred Job Locations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacher.jobpreferencelocation.map((location, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="space-y-1 text-sm">
                            <p className="text-secondary">
                              <span className="font-medium">State:</span> {location.state}
                            </p>
                            <p className="text-secondary">
                              <span className="font-medium">City:</span> {location.city}
                            </p>
                            <p className="text-secondary">
                              <span className="font-medium">Area:</span> {location.area}
                            </p>
                            <p className="text-secondary">
                              <span className="font-medium">Pincode:</span> {location.pincode}
                            </p>
                            {location.sub_division && (
                              <p className="text-secondary">
                                <span className="font-medium">Sub Division:</span> {location.sub_division}
                              </p>
                            )}
                            {location.block && (
                              <p className="text-secondary">
                                <span className="font-medium">Block:</span> {location.block}
                              </p>
                            )}
                            {location.post_office && (
                              <p className="text-secondary">
                                <span className="font-medium">Post Office:</span> {location.post_office}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teacher.total_marks !== undefined && (
                      <div className="p-4 bg-background rounded-lg text-center">
                        <h3 className="text-lg font-semibold text-primary">{teacher.total_marks}</h3>
                        <p className="text-secondary text-sm">Total Marks</p>
                      </div>
                    )}
                    {teacher.total_attempt !== undefined && (
                      <div className="p-4 bg-background rounded-lg text-center">
                        <h3 className="text-lg font-semibold text-primary">{teacher.total_attempt}</h3>
                        <p className="text-secondary text-sm">Total Attempts</p>
                      </div>
                    )}
                    {teacher.profiles && (
                      <div className="p-4 bg-background rounded-lg">
                        <h3 className="text-sm font-semibold text-text mb-2">Profile Details</h3>
                        <div className="space-y-1 text-xs">
                          {teacher.profiles.religion && (
                            <p className="text-secondary">
                              <span className="font-medium">Religion:</span> {teacher.profiles.religion}
                            </p>
                          )}
                          {teacher.profiles.marital_status && (
                            <p className="text-secondary">
                              <span className="font-medium">Marital Status:</span> {teacher.profiles.marital_status}
                            </p>
                          )}
                          {teacher.profiles.gender && (
                            <p className="text-secondary">
                              <span className="font-medium">Gender:</span> {teacher.profiles.gender}
                            </p>
                          )}
                          {teacher.profiles.language && (
                            <p className="text-secondary">
                              <span className="font-medium">Language:</span> {teacher.profiles.language}
                            </p>
                          )}
                          {teacher.profiles.bio && (
                            <p className="text-secondary mt-2">
                              <span className="font-medium">Bio:</span> {teacher.profiles.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-secondary italic">
                  No job preference information available
                </p>
              )}
            </div>
          )}
      {/* Fixed Request Teacher Button */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2">
        <button
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={handleRequestTeacher}
          disabled={isSubmitting || success}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : success ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Request Sent</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
                />
              </svg>
              <span>Request Teacher</span>
            </>
          )}
        </button>
      </div>

      {/* Request Teacher Modal */}
      {openRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Request Teacher: {teacher.Fname} {teacher.Lname}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {classCategories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5m-.5-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Teaching Preferences</h3>
                  <p className="text-gray-500">This teacher hasn't set their teaching preferences yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Class Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Category *
                    </label>
                    <select
                      value={selectedClassCategory}
                      onChange={(e) => {
                        setSelectedClassCategory(e.target.value);
                        setSelectedSubject(''); // Reset subject when class category changes
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Class Category</option>
                      {classCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={!selectedClassCategory}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {selectedClassCategory ? 'Select Subject' : 'Please select class category first'}
                      </option>
                      {subjects
                        .filter((subject) => !selectedClassCategory || subject.class_category === parseInt(selectedClassCategory))
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.subject_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={modalLoading || !selectedClassCategory || !selectedSubject || classCategories.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
              >
                {modalLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {modalLoading ? 'Submitting...' : classCategories.length === 0 ? 'No Preferences Set' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default TeacherViewPage;
