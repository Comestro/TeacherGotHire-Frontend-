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
import Loader from "../Loader";
import ErrorMessage from "../ErrorMessage";

function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardError, setDashboardError] = useState(null);
  const inputRef = useRef(null);
  const [passkeyStatus, setPasskeyStatus] = useState(null);
  const [isExamCenterModalOpen, setIsExamCenterModalOpen] = useState(false);
  const [isVerifyCard, setIsVerifyCard] = useState(false);

  const { basicData, status: profileStatus } = useSelector((state) => state.personalProfile);
  const { attempts, interview: interviewData } = useSelector((state) => state.examQues);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  const jobProfileStatus = useSelector((state) => state.jobProfile?.status);
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

  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    // Initial data loading
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(attemptsExam()).unwrap(),
          dispatch(getPrefrence()).unwrap(),
          dispatch(getInterview()).unwrap(),
          dispatch(getSubjects()).unwrap(),
          dispatch(getBasic()).unwrap()
        ]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setDashboardError("Failed to load some dashboard data. Please check your connection and try again.");
      }
    };

    loadData();
  }, [dispatch]);



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
        <div className="flex flex-col md:flex-row gap-2">
          {/* Main Content Column (9/12) */}
          <div className="w-full md:w-9/12 lg:w-9/12">
            <ErrorMessage
              message={dashboardError}
              onDismiss={() => setDashboardError(null)}
            />
            {/* Show preference form if user doesn't have class categories */}

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
          <div className="w-[300px] md:w-3/12 lg:w-3/12 mt-6 md:mt-0 border-l border-slate-150 pl-6">
            <img src="/help.png" alt="Assessment Process" className="w-full h-auto" />
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
