import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSubjects } from "../../features/dashboardSlice";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getProfilCompletion } from "../../features/personalProfileSlice";
import {
  getInterview,
  setExam,
  verifyPasscode,
} from "../../features/examQuesSlice";
import TeacherDashboardCard from "./components/TeacherDashboardCard";
import ExamManagement from "./components/ExamManagement";
import FilterdExamCard from "./components/FilterdExamCard"
import { Helmet } from "react-helmet-async";
import { updateBasicProfile } from "../../services/profileServices";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import InterviewCard from "./components/InterviewCard";
import { attemptsExam } from "../../features/examQuesSlice";
import PrefrenceProfile from "../Profile/JobProfile/PrefrenceProfile";
import { getPrefrence } from "../../features/jobProfileSlice";
import { FaCalendarAlt } from "react-icons/fa";

function TeacherDashboard() {
  const dispatch = useDispatch();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInterviewHistory, setShowInterviewHistory] = useState(false);
  const inputRef = useRef(null);

  const { basicData } = useSelector((state) => state.personalProfile);
  const { attempts, interview: interviewData } = useSelector((state) => state.examQues);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  
  useEffect(() => {
    dispatch(attemptsExam());
    dispatch(getPrefrence());
    dispatch(getInterview());
  }, [dispatch]);

  const qualifiedExamNames = (attempts || [])
    .filter(item => item?.exam?.level_code === 2 && item?.isqualified)
    .map(item => item?.exam?.name);

  console.log("qualifiedExamNames",qualifiedExamNames);
  
  // Check if user has class categories set up
  const hasClassCategories = teacherprefrence?.class_category?.length > 0;
  
  useEffect(() => {
    dispatch(getSubjects());
    // dispatch(getProfilCompletion()).then(() => {
    //   // Show modal if phone number is not set
    //   if (!basicData?.phone_number) {
    //     setShowPhoneModal(true);
    //   }
    // });
  }, [dispatch, basicData?.phone_number]);

  const handleSubmitPhoneNumber = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      await updateBasicProfile({ phone_number: phoneNumber });
      toast.success("Phone number updated successfully!");
      setShowPhoneModal(false);
      dispatch(getProfilCompletion());
    } catch (err) {
      const errorMessage = err.response?.data?.phone_number 
        ? Array.isArray(err.response.data.phone_number)
          ? err.response.data.phone_number[0]
          : err.response.data.phone_number
        : "An error occurred. Please try again.";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const teacherData = {
    profilePicture: "https://via.placeholder.com/150",
    completionPercentage: 75,
    missingDetails: [
      "Add address info",
      "Add mobile number",
      "Add education details",
    ],
  };

  // Derive interview state for summary banner (placed here, not inside handlers)
  const interviews = useMemo(() => Array.isArray(interviewData) ? interviewData : [], [interviewData]);
  const hasScheduledInterview = useMemo(() => interviews.some(i => i?.status === "scheduled"), [interviews]);
  const hasRequestedInterview = useMemo(() => interviews.some(i => i?.status === "requested" || i?.status === "pending"), [interviews]);
  const nextInterview = useMemo(() => {
    const upcoming = interviews
      .filter(i => i?.status === "scheduled" && i?.time)
      .sort((a,b) => new Date(a.time) - new Date(b.time));
    return upcoming[0] || null;
  }, [interviews]);
  
  // Check if teacher has completed interview with passing grade (6+)
  // Source 1: Dedicated interview list from store (examQues.interview)
  const hasPassedInterviewFromInterviews = useMemo(() => {
    return interviews.some(i =>
      i?.status === "fulfilled" &&
      i?.grade &&
      parseInt(i.grade) >= 6
    );
  }, [interviews]);

  // Source 2: Attempts array may include embedded interviews per attempt
  // If any attempt (typically Level 2) has a fulfilled interview with grade >= 6, treat as passed
  const hasPassedInterviewFromAttempts = useMemo(() => {
    if (!Array.isArray(attempts)) return false;
    return attempts.some((att) => {
      const levelOk = att?.exam?.level_code === 2 || att?.exam?.level_name?.includes("Level - 2");
      const intvs = Array.isArray(att?.interviews) ? att.interviews : [];
      return levelOk && intvs.some(iv => iv?.status === "fulfilled" && iv?.grade != null && parseInt(iv.grade) >= 6);
    });
  }, [attempts]);

  // Final pass status: either source indicates a passing interview
  const hasPassedInterview = hasPassedInterviewFromInterviews || hasPassedInterviewFromAttempts;

  const isEligibleForInterview = qualifiedExamNames.length > 0 && !hasPassedInterview;
  // Show interview section if there are active (scheduled/requested) interviews or eligible but not passed
  const shouldShowInterviewSection = hasScheduledInterview || hasRequestedInterview || (isEligibleForInterview && !hasPassedInterview);
  const interviewSectionRef = useRef(null);
  const scrollToInterview = () => {
    if (interviewSectionRef.current) {
      interviewSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const PhoneNumberModal = () => {
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
  
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Please Provide your Contact Number
          </h2>
          <form onSubmit={handleSubmitPhoneNumber}>
            <div className="mb-4">
              <label className="block text-teal-600 text-sm font-medium mb-2">
                Phone Number*
              </label>
              <input
                ref={inputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="Enter 10-digit phone number"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  error 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-200 focus:border-teal-600"
                }`}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className={`px-5 py-2 text-white rounded-lg transition-all ${
                  loading || phoneNumber.length !== 10
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 hover:shadow-md"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Teacher Dashboard</title>
      </Helmet>
       <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        closeButton={true}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {showPhoneModal && !basicData?.phone_number && <PhoneNumberModal />}

      <div className="min-h-screen">
        {/* Interview eligibility and status banner */}
        <div className="px-4 sm:px-6 pt-4">
          {shouldShowInterviewSection && (
            <div className="rounded-xl border border-primary bg-primary p-4 sm:p-6 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  {hasScheduledInterview ? (
                    <div>
                      <div className="text-sm font-semibold text-primary">आपका आगामी इंटरव्यू | You have an upcoming interview</div>
                      {nextInterview && (
                        <div className="mt-1 text-gray-700">
                          <span className="font-medium">{nextInterview?.class_category?.name}</span>
                          {" "}·{" "}
                          <span>{nextInterview?.subject?.subject_name}</span>
                          {nextInterview?.time && (
                            <>
                              {" "}·{" "}
                              <span>{new Date(nextInterview.time).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {nextInterview?.link && (
                          <a
                            href={nextInterview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
                          >
                            Join Interview
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={scrollToInterview}
                          className="inline-flex items-center px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary/10"
                        >
                          Manage Interviews
                        </button>
                      </div>
                    </div>
                  ) : hasRequestedInterview ? (
                    <div>
                      <div className="text-sm font-semibold text-amber-700">इंटरव्यू अनुरोध स्वीकृति लंबित | Interview request pending approval</div>
                      <p className="mt-1 text-gray-700">आपके इंटरव्यू की तारीख तय होने पर हम आपको सूचित करेंगे। | We will notify you once your interview is scheduled.</p>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={scrollToInterview}
                          className="inline-flex items-center px-4 py-2 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                          View Request
                        </button>
                      </div>
                    </div>
                  ) : isEligibleForInterview ? (
                    <div>
                      <div className="text-sm font-semibold text-primary">🎉 बधाई हो! आप इंटरव्यू के लिए योग्य हैं | Congratulations! You're eligible for Interview</div>
                      <p className="mt-1 text-gray-700">
                        <span className="font-medium">Level 2 पास कर लिया है।</span> अब इंटरव्यू शेड्यूल करें और स्कूल/संस्थान में नौकरी के लिए आवेदन करें।
                        <br className="hidden sm:block" />
                        <span className="text-gray-600">Level 2 passed. Schedule your interview now and apply for teaching jobs in schools/institutes.</span>
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={scrollToInterview}
                          className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                        >
                          <FaCalendarAlt className="mr-2" />
                          इंटरव्यू शेड्यूल करें | Schedule Interview
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Show preference form if user doesn't have class categories */}
        {!hasClassCategories ? (
          <div className=" p-4 sm:p-6">
            <PrefrenceProfile forceEdit={true} />
          </div>
        ) : (
          <>
            {/* Interview management placed prominently at the top when eligible or existing interviews */}
            {shouldShowInterviewSection && (
              <div ref={interviewSectionRef} className="md:px-6 md:py-4">
                <InterviewCard />
              </div>
            )}
            
            {/* Show less prominent interview history for completed interviews */}
            {hasPassedInterview && interviews.length > 0 && !shouldShowInterviewSection && (
              <div className="md:px-6 md:py-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-500" />
                        Interview History
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">View your completed interviews</p>
                    </div>
                    <button
                      onClick={scrollToInterview}
                      className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      View History
                    </button>
                  </div>
                </div>
                <div ref={interviewSectionRef} className="hidden">
                  <InterviewCard />
                </div>
              </div>
            )}

            {/* Other dashboard content */}
            <div className="md:px-6 md:p-2">
              {/* <ExamManagement /> */}
              <FilterdExamCard/>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default TeacherDashboard;
