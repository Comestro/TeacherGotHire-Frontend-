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

import ProfileStrength from "./components/ProfileStrength";
import ProfileNextStep from "./components/ProfileNextStep";

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

  const { basicData, completionData, status: profileStatus } = useSelector((state) => state.personalProfile);
  const { attempts, interview: interviewData } = useSelector((state) => state.examQues);
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  const jobProfileStatus = useSelector((state) => state.jobProfile?.status);
  const { examCards } = useSelector((state) => state?.exam);
  const { data: eligibilityData, isLoading: eligibilityLoading } = useGetApplyEligibilityQuery();
  const { data: jobApplyData, isLoading: jobApplyLoading } = useGetJobsApplyDetailsQuery();
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
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(attemptsExam()).unwrap(),
          dispatch(getPrefrence()).unwrap(),
          dispatch(getInterview()).unwrap(),
          dispatch(getSubjects()).unwrap(),
          dispatch(getBasic()).unwrap(),
          dispatch(getProfilCompletion()).unwrap()
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
  const qualifiedExamNames = useMemo(() =>
    (attempts || [])
      .filter(item => item?.exam?.level_code === 2 && item?.isqualified)
      .map(item => item?.exam?.name),
    [attempts]
  );
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
  const interviews = useMemo(() => Array.isArray(interviewData) ? interviewData : [], [interviewData]);
  const hasScheduledInterview = useMemo(() => interviews.some(i => i?.status === "scheduled"), [interviews]);
  const hasRequestedInterview = useMemo(() => interviews.some(i => i?.status === "requested" || i?.status === "pending"), [interviews]);
  const nextInterview = useMemo(() => {
    const upcoming = interviews
      .filter(i => i?.status === "scheduled" && i?.time)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
    return upcoming[0] || null;
  }, [interviews]);
  const hasPassedInterviewFromInterviews = useMemo(() => {
    return interviews.some(i =>
      i?.status === "fulfilled" &&
      i?.grade &&
      parseInt(i.grade) >= 6
    );
  }, [interviews]);
  const hasPassedInterviewFromAttempts = useMemo(() => {
    if (!Array.isArray(attempts)) return false;
    return attempts.some((att) => {
      const levelOk = att?.exam?.level_code === 2 || att?.exam?.level_name?.includes("Level - 2");
      const intvs = Array.isArray(att?.interviews) ? att.interviews : [];
      return levelOk && intvs.some(iv => iv?.status === "fulfilled" && iv?.grade != null && parseInt(iv.grade) >= 6);
    });
  }, [attempts]);
  const hasPassedInterview = hasPassedInterviewFromInterviews || hasPassedInterviewFromAttempts;

  const isEligibleForInterview = qualifiedExamNames.length > 0 && !hasPassedInterview;
  const shouldShowInterviewSection = hasScheduledInterview || hasRequestedInterview || (isEligibleForInterview && !hasPassedInterview);
  const interviewSectionRef = useRef(null);
  const filterdExamCardRef = useRef(null);

  const scrollToInterview = () => {
    if (filterdExamCardRef.current) {
      if (nextInterview) {
        filterdExamCardRef.current.openInterview(nextInterview.class_category?.id, nextInterview.subject?.id);
      } else {
        const qualifiedAttempt = attempts?.find(item => item?.exam?.level_code === 2 && item?.isqualified);
        if (qualifiedAttempt) {
          filterdExamCardRef.current.openInterview(qualifiedAttempt.exam?.class_category_id, qualifiedAttempt.exam?.subject_id);
        }
      }
    }
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

            {(completionData?.profile_completed || 0) < 100 && (
              <div className="space-y-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <FaRocket />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Boost your profile visibility!</h4>
                      <p className="text-xs text-slate-600">Complete your profile to stand out to top recruiters.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/teacher/personal-profile")}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    Edit Profile
                  </button>
                </motion.div>
                
                {/* Specific Next Step Prompt moved here */}
                <ProfileNextStep feedback={completionData?.feedback} />
              </div>
            )}
            {/* Show preference form if user doesn't have class categories */}

            {/* Show preference form if user doesn't have class categories */}
            {!hasClassCategories ? (
              <div className="">
                <PrefrenceProfile forceEdit={true} />
              </div>
            ) : (
              <>
                {/* Assigned Exam Center Info */}
                {passkeyStatus?.passkey && passkeyStatus?.center && passkeyStatus?.status === 'requested' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-lg bg-white border border-slate-100"
                  >
                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <FaBuilding className="text-teal-600" /> Assigned Exam Center / आवंटित परीक्षा केंद्र
                      </h3>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700">
                        Pending Verification
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Center Details</p>
                            <h4 className="text-lg font-bold text-slate-800">{passkeyStatus.center.name}</h4>
                          </div>

                          <div className="flex gap-3">
                            <FaMapMarkerAlt className="mt-1 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-0.5">Address / पता</p>
                              <p className="text-slate-600 text-sm">
                                {passkeyStatus.center.area && `${passkeyStatus.center.area}, `}
                                {passkeyStatus.center.city}, {passkeyStatus.center.state} - {passkeyStatus.center.pincode}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact Information</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 text-teal-600">
                                <FaPhoneAlt size={14} />
                              </div>
                              <a href={`tel:${passkeyStatus.center.phone}`} className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
                                {passkeyStatus.center.phone}
                              </a>
                            </div>

                            {passkeyStatus.center.alt_phone && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 text-slate-600">
                                  <FaPhoneAlt size={14} />
                                </div>
                                <a href={`tel:${passkeyStatus.center.alt_phone}`} className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
                                  {passkeyStatus.center.alt_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50">
                        <div className="flex items-start gap-2 text-slate-500">
                          <FaExclamationTriangle className="mt-0.5 text-amber-500 shrink-0" size={12} />
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold text-slate-700">Next Step:</span> Please contact the center manager to collect your examination passkey and schedule your verification slot.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Other dashboard content */}
                <div ref={interviewSectionRef}>
                  <FilterdExamCard ref={filterdExamCardRef} onExamDataChange={refreshPasskeyStatus} passkeyStatus={passkeyStatus} />
                </div>
              </>
            )}
          </div>
          {/* Assessment Process column (3/12) */}
          <div className="w-full md:w-3/12 lg:w-3/12 mt-6 md:mt-0 border-l border-slate-150 pl-6 space-y-6">
            <ProfileStrength percentage={completionData?.profile_completed || 0} />
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
