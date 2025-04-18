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
} from "react-icons/fa";
import { requestTeacher } from "../../services/profileServices";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TeacherViewPage = () => {
  const profile = useSelector((state) => state.auth.userData || {});
  console.log("Auth Usre Data: ", profile);
  const { id } = useParams();
  const [teacher, setTeacher] = useState({});
  console.log("Initial teacher state:", teacher);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("qualifications");
  const [stickyTabs, setStickyTabs] = useState(false);
  const tabsRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        const data = await fetchSingleTeacherById(id);
        console.log("Fetched teacher data:", data);
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

  const handleRequestTeacher = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const payload = {
        teacher_id: teacher.id,
      };

      await requestTeacher(payload);
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
      setIsSubmitting(false);
    }
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
    <div className="bg-gray-50 min-h-screen pb-12">
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
          className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Teachers List</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
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
                    className="w-full h-full rounded-full object-cover border-4 border-teal-500 shadow-lg"
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-grow space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {teacher.Fname} {teacher.Lname}
                  </h1>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-600 flex items-center justify-center md:justify-start">
                      <svg
                        className="w-5 h-5 mr-2 text-teal-500"
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
                      {teacher.email}
                    </p>
                    <p className="text-gray-600 flex items-center justify-center md:justify-start">
                      <svg
                        className="w-5 h-5 mr-2 text-teal-500"
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
                      {teacher.phone}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-semibold text-gray-700 mb-2 flex items-center justify-center md:justify-start">
                    <svg
                      className="w-5 h-5 mr-2 text-teal-500"
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
                  <p className="text-gray-600">
                    <span className="font-medium">Address: </span>
                    {teacher.teachersaddress?.map((address, index) => (
                      <span key={index}>
                        {index > 0 && (
                          <span className="mx-2 text-gray-400">|</span>
                        )}
                        {`${address.area}, ${address.district}, ${address.state} - ${address.pincode}`}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div
          ref={tabsRef}
          className={`bg-white rounded-t-xl shadow-md transition-all duration-300 ${
            stickyTabs ? "sticky top-0 z-10 shadow-md rounded-none" : ""
          }`}
        >
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium flex items-center ${
                activeTab === "qualifications"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("qualifications")}
            >
              <FaGraduationCap className="mr-2" />
              <span>Qualifications</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium flex items-center ${
                activeTab === "experience"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("experience")}
            >
              <FaBriefcase className="mr-2" />
              <span>Experience</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium flex items-center ${
                activeTab === "skills"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("skills")}
            >
              <FaLightbulb className="mr-2" />
              <span>Skills</span>
            </button>
            <button
              className={`px-4 py-4 sm:px-6 whitespace-nowrap text-sm font-medium flex items-center ${
                activeTab === "preferences"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <FaChalkboardTeacher className="mr-2" />
              <span>Teaching Preferences</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-md p-6">
          {activeTab === "qualifications" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-teal-600 flex items-center">
                  <FaGraduationCap className="mr-2" /> Qualifications
                </h2>
                {teacher.teacherqualifications?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.teacherqualifications.map((qualification) => (
                      <div
                        key={qualification.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-semibold text-gray-800">
                          {qualification.qualification.name}
                        </h3>
                        <p className="text-gray-600">
                          {qualification.institution}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">
                            {qualification.year_of_passing}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                            {qualification.board}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No qualification information available
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-teal-600 flex items-center">
                <FaBriefcase className="mr-2" /> Experience
              </h2>
              {teacher.teacherexperiences?.length > 0 ? (
                <div className="space-y-4">
                  {teacher.teacherexperiences.map((experience) => (
                    <div
                      key={experience.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          {experience.company}
                        </h3>
                        <div className="mt-1 sm:mt-0 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          {new Date(experience.start_date).toLocaleDateString()}{" "}
                          -{" "}
                          {experience.end_date
                            ? new Date(experience.end_date).toLocaleDateString()
                            : "Present"}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">
                        {experience.achievements}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No experience information available
                </p>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-teal-600 flex items-center">
                <FaLightbulb className="mr-2" /> Skills
              </h2>
              {teacher.teacherskill?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {teacher.teacherskill.map((skill) => (
                    <span
                      key={skill.skill.id}
                      className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {skill.skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No skill information available
                </p>
              )}
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-teal-600 flex items-center">
                <FaChalkboardTeacher className="mr-2" /> Teaching Preferences
              </h2>
              {teacher.preferences?.length > 0 ? (
                <div>
                  {teacher.preferences.map((preference) => (
                    <div key={preference.id} className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          Preferred Subjects
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {preference.prefered_subject?.length > 0 ? (
                            preference.prefered_subject.map((subject) => (
                              <span
                                key={subject.id}
                                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                              >
                                {subject.subject_name}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">
                              No preferred subjects listed
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-indigo-500"
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
                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                              >
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">
                              No class categories listed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No teaching preferences available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Fixed Request Teacher Button */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2">
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    </div>
  );
};

export default TeacherViewPage;
