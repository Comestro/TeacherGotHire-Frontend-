import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSubjects } from "../../features/dashboardSlice";
import { getProfilCompletion, getBasic } from "../../features/personalProfileSlice";
import {
  getInterview,
} from "../../features/examQuesSlice";
import FilterdExamCard from "./components/FilterdExamCard"
import { Helmet } from "react-helmet-async";
import { updateBasicProfile } from "../../services/profileServices";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import InterviewCard from "./components/InterviewCard";
import { attemptsExam } from "../../features/examQuesSlice";
import PrefrenceProfile from "../Profile/JobProfile/PrefrenceProfile";
import { getPrefrence } from "../../features/jobProfileSlice";
import {
  FaCalendarAlt, FaClock, FaVideo,
  FaCheckCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
  FaRocket,
  FaBriefcase,
  FaArrowRight,
  FaExclamationTriangle,
  FaPhoneAlt
} from "react-icons/fa";
import { checkPasskey } from "../../services/examServices";
import ExamCenterModal from "./components/passkeyCard";
import PhoneNumberModal from "./components/PhoneNumberModal";
import { useGetApplyEligibilityQuery, useGetJobsApplyDetailsQuery } from "../../features/api/apiSlice";

function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const [passkeyStatus, setPasskeyStatus] = useState(null);
  const [isExamCenterModalOpen, setIsExamCenterModalOpen] = useState(false);
  const [isVerifyCard, setIsVerifyCard] = useState(false);

  const { basicData, status: profileStatus } = useSelector((state) => state.personalProfile);
  const { attempts, interview: interviewData } = useSelector((state) => state.examQues);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  const { examCards } = useSelector((state) => state?.exam);

  // Get job eligibility and application status
  const { data: eligibilityData, isLoading: eligibilityLoading } = useGetApplyEligibilityQuery();
  const { data: jobApplyData, isLoading: jobApplyLoading } = useGetJobsApplyDetailsQuery();

  // Memoize job application computations
  const eligibleExams = useMemo(() =>
    eligibilityData?.qualified_list?.filter(exam => exam.eligible === true) || [],
    [eligibilityData]
  );
  const hasEligibleJobs = useMemo(() => eligibleExams.length > 0, [eligibleExams]);
  const hasAppliedJobs = useMemo(() =>
    jobApplyData?.some(job => job.status === true) || false,
    [jobApplyData]
  );
  const appliedJobsCount = useMemo(() =>
    jobApplyData?.filter(job => job.status === true).length || 0,
    [jobApplyData]
  );

  useEffect(() => {
    // Initial data loading
    dispatch(attemptsExam());
    dispatch(getPrefrence());
    dispatch(getInterview());
    dispatch(getSubjects());
    dispatch(getBasic());
  }, [dispatch]);

  useEffect(() => {
    if (teacherprefrence) {
      dispatch(getSubjects());
      dispatch(attemptsExam());
      dispatch(getInterview());
    }
  }, [dispatch, teacherprefrence]);

  useEffect(() => {
    if (profileStatus === "succeeded") {
      setShowPhoneModal(!basicData?.phone_number);
    }
  }, [profileStatus, basicData?.phone_number]);

  const refreshPasskeyStatus = async () => {
    try {
      const response = await checkPasskey({ exam: examCards?.id });
      if (response?.passkey == true) {
        setPasskeyStatus(response);
        setIsVerifyCard(true);
      } else {
        setPasskeyStatus(null);
        setIsVerifyCard(false);
        if (examCards?.level?.level_code === 2.5) {
          // setIsExamCenterModalOpen(true); // Removed to prevent double modal
        }
      }
    } catch (error) {
      setPasskeyStatus(null);
      setIsVerifyCard(false);
    }
  };

  useEffect(() => {
    refreshPasskeyStatus();
  }, [examCards]);

  // Memoize qualified exam names computation
  const qualifiedExamNames = useMemo(() =>
    (attempts || [])
      .filter(item => item?.exam?.level_code === 2 && item?.isqualified)
      .map(item => item?.exam?.name),
    [attempts]
  );

  // Memoize class categories check
  const hasClassCategories = useMemo(() =>
    teacherprefrence?.class_category?.length > 0,
    [teacherprefrence?.class_category]
  );

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
      dispatch(getBasic());
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
  // Derive interview state for summary banner (placed here, not inside handlers)
  const interviews = useMemo(() => Array.isArray(interviewData) ? interviewData : [], [interviewData]);
  const hasScheduledInterview = useMemo(() => interviews.some(i => i?.status === "scheduled"), [interviews]);
  const hasRequestedInterview = useMemo(() => interviews.some(i => i?.status === "requested" || i?.status === "pending"), [interviews]);
  const nextInterview = useMemo(() => {
    const upcoming = interviews
      .filter(i => i?.status === "scheduled" && i?.time)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
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
  const filterdExamCardRef = useRef(null);

  const scrollToInterview = () => {
    // Try to open the interview panel in FilterdExamCard
    if (filterdExamCardRef.current) {
      if (nextInterview) {
        filterdExamCardRef.current.openInterview(nextInterview.class_category?.id, nextInterview.subject?.id);
      } else {
        // Find first qualified attempt to open
        const qualifiedAttempt = attempts?.find(item => item?.exam?.level_code === 2 && item?.isqualified);
        if (qualifiedAttempt) {
          filterdExamCardRef.current.openInterview(qualifiedAttempt.exam?.class_category_id, qualifiedAttempt.exam?.subject_id);
        }
      }
    }

    // Scroll to the section
    if (interviewSectionRef.current) {
      const element = interviewSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100; // 100px offset

      window.scrollTo({ top: y, behavior: "smooth" });
    }
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
      {profileStatus === "succeeded" && showPhoneModal && !basicData?.phone_number && (
        <PhoneNumberModal
          isOpen={showPhoneModal && !basicData?.phone_number}
          onClose={() => setShowPhoneModal(false)}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          error={error}
          loading={loading}
          onSubmit={handleSubmitPhoneNumber}
        />
      )}

      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8">
          {/* Main Content Column (9/12) */}
          <div className="w-full md:w-9/12 lg:w-9/12">
            {/* Passkey Request Status Banner - Compact Version */}
            <div className="space-y-4 mb-3">
              {passkeyStatus?.passkey && passkeyStatus?.center && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border shadow-sm overflow-hidden ${passkeyStatus?.status === "fulfilled"
                    ? "bg-green-50/30 border-green-200"
                    : "bg-amber-50/30 border-amber-200"
                    }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg shrink-0 ${passkeyStatus?.status === "fulfilled" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                        }`}>
                        {passkeyStatus?.status === "fulfilled" ? <FaCheckCircle size={18} /> : <FaHourglassHalf size={18} />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-base ${passkeyStatus?.status === "fulfilled" ? "text-green-800" : "text-amber-800"
                            }`}>
                            {passkeyStatus?.status === "fulfilled" ? "Exam Center Approved" : "Approval Pending"}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${passkeyStatus?.status === "fulfilled"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}>
                            Level 2
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
                          <span className="flex items-center gap-1.5">
                            <FaBuilding className="text-gray-400 text-xs" />
                            <span className="font-medium">{passkeyStatus?.center?.name || passkeyStatus?.center?.center_name}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400 text-xs" />
                            <span>{passkeyStatus?.center?.city}, {passkeyStatus?.center?.state}</span>
                          </span>
                          <span className="flex items-center gap-1.5">  
                            <FaPhoneAlt className="text-gray-400 text-xs" />
                            <span>{passkeyStatus?.center?.phone}</span>
                          </span> 
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
                      {passkeyStatus?.status === "fulfilled" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifyCard(true);
                            setIsExamCenterModalOpen(true);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 transition-colors"
                        >
                          Start Exam
                          <FaArrowRight className="ml-2 text-xs" />
                        </button>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                          <FaClock className="mr-1.5" />
                          Waiting for Approval
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {(eligibilityLoading || jobApplyLoading) ? (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm animate-pulse h-24"></div>
              ) : hasEligibleJobs ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`relative overflow-hidden rounded-xl border shadow-sm ${hasAppliedJobs
                    ? "bg-white border-blue-100"
                    : "bg-gradient-to-r from-white to-primary/5 border-primary/20"
                    }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg shrink-0 ${hasAppliedJobs ? "bg-blue-50 text-blue-600" : "bg-primary/10 text-primary"
                        }`}>
                        {hasAppliedJobs ? <FaBriefcase size={20} /> : <FaRocket size={20} />}
                      </div>

                      <div>
                        <h2 className={`font-bold text-base ${hasAppliedJobs ? "text-gray-900" : "text-gray-900"
                          }`}>
                          {hasAppliedJobs ? "Job Applications Active" : "You Can Apply for Jobs!"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {hasAppliedJobs ? (
                            <>Applied for <span className="font-bold text-blue-600">{appliedJobsCount}</span> positions. Under review.</>
                          ) : (
                            <>Eligible for <span className="font-bold text-primary">{eligibleExams.length}</span> subjects. Post your profile with institutes.</>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/teacher/job-apply")}
                      className={`w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${hasAppliedJobs
                        ? "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50"
                        : "bg-primary text-white shadow-sm hover:bg-primary/90"
                        }`}
                    >
                      {hasAppliedJobs ? "Manage Applications" : "Apply Now"}
                      <FaArrowRight className="ml-2 text-xs" />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Interview eligibility and status banner */}
            {/* Interview eligibility and status banner - Compact Version */}
            {shouldShowInterviewSection && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white shadow-sm mb-6 overflow-hidden"
              >
                <div className="p-4">
                  {hasScheduledInterview ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                          <FaCalendarAlt size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-gray-800 truncate">
                              Interview Scheduled
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide shrink-0">
                              Upcoming
                            </span>
                          </div>

                          {nextInterview && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="font-medium text-gray-900">
                                {nextInterview?.subject?.subject_name}
                              </span>
                              {nextInterview?.time && (
                                <span className="flex items-center gap-1.5 text-xs">
                                  <FaClock className="text-gray-400" />
                                  {new Date(nextInterview.time).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {nextInterview?.link && (
                          <a
                            href={nextInterview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-bold shadow-sm"
                          >
                            <FaVideo className="mr-1.5" />
                            Join
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={scrollToInterview}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ) : hasRequestedInterview ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          <FaHourglassHalf size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 mb-0.5">
                            Interview Request Pending
                          </h3>
                          <p className="text-xs text-gray-500">
                            We will notify you once an interviewer is assigned.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={scrollToInterview}
                        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
                      >
                        View Status
                      </button>
                    </div>
                  ) : isEligibleForInterview ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <FaCheckCircle size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 mb-0.5">
                            You're Eligible for an Interview!
                          </h3>
                          <p className="text-xs text-gray-500">
                            Schedule an interview with our expert now.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={scrollToInterview}
                        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm font-bold"
                      >
                        <FaCalendarAlt className="mr-2" />
                        Schedule Now
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}


            {/* Show preference form if user doesn't have class categories */}
            {!hasClassCategories ? (
              <div className="">
                <PrefrenceProfile forceEdit={true} />
              </div>
            ) : (
              <>
                {/* Other dashboard content */}
                <div ref={interviewSectionRef}>
                  <FilterdExamCard ref={filterdExamCardRef} onExamDataChange={refreshPasskeyStatus} />
                </div>
              </>
            )}
          </div>
          {/* Assessment Process column (3/12) */}
          <div className="w-full md:w-3/12 lg:w-3/12 mt-6 md:mt-0">
            <img src="/process.png" alt="Assessment Process" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Exam Center Modal for Passcode Verification */}
      {isExamCenterModalOpen && (
        <ExamCenterModal
          isOpen={isExamCenterModalOpen}
          onClose={() => setIsExamCenterModalOpen(false)}
          examCards={examCards}
          isverifyCard={isVerifyCard}
          examCenterData={passkeyStatus?.center}
        />
      )}
    </>
  );
}

export default TeacherDashboard;
