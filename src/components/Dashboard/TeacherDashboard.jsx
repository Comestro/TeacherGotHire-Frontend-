import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { FaCalendarAlt } from "react-icons/fa";
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

  // Check for pending passkey requests
  useEffect(() => {
    const checkForPendingPasskey = async () => {
        try {
          const response = await checkPasskey({ exam: examCards?.id });
          console.log(examCards)
          if (response?.passkey == true) {
            setPasskeyStatus(response);
            setIsVerifyCard(true);
            setIsExamCenterModalOpen(true);
          } else {
            setPasskeyStatus(null);
            setIsVerifyCard(false);
            if (examCards?.id) {
              setIsExamCenterModalOpen(true);
            }
          }
        } catch (error) {
          setPasskeyStatus(null);
          setIsVerifyCard(false);
        }
    };
    checkForPendingPasskey();
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
  const scrollToInterview = () => {
    if (interviewSectionRef.current) {
      interviewSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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

      <div className="min-h-screen px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8">
          {/* Main Content Column (9/12) */}
          <div className="w-full md:w-9/12 lg:w-9/12 space-y-4">
            {/* Passkey Request Status Banner */}
            <div className=" pt-8">
              {passkeyStatus?.passkey && passkeyStatus?.center && (
                <div className={`rounded-xl border p-4 sm:p-6 mb-4 ${
                  passkeyStatus?.status === "fulfilled" 
                    ? "border-green-400 bg-green-50" 
                    : "border-yellow-400 bg-yellow-50"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="w-full">
                      {passkeyStatus?.status === "fulfilled" ? (
                        <>
                          <div className="text-xl font-semibold text-green-700">✅ पासकी स्वीकृत | Passkey Approved</div>
                          <div className="mt-2 text-gray-700">
                            <p className="mb-1">
                              <span className="font-medium">Exam Center: </span>
                              {passkeyStatus?.center?.name || passkeyStatus?.center?.center_name}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Location: </span>
                              {passkeyStatus?.center?.area && `${passkeyStatus.center.area}, `}
                              {passkeyStatus?.center?.city}, {passkeyStatus?.center?.state} - {passkeyStatus?.center?.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              आपका पासकी अनुरोध स्वीकृत हो गया है। अब आप परीक्षा केंद्र से सत्यापन कोड प्राप्त करके परीक्षा शुरू कर सकते हैं।
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsVerifyCard(true);
                                setIsExamCenterModalOpen(true);
                              }}
                              className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              Enter Verification Code & Start Exam
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-yellow-700">⏳ पासकी अनुरोध लंबित | Passkey Request Pending</div>
                          <div className="mt-2 text-gray-700">
                            <p className="mb-1">
                              <span className="font-medium">Exam Center: </span>
                              {passkeyStatus?.center?.name || passkeyStatus?.center?.center_name}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Location: </span>
                              {passkeyStatus?.center?.area && `${passkeyStatus.center.area}, `}
                              {passkeyStatus?.center?.city}, {passkeyStatus?.center?.state} - {passkeyStatus?.center?.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              आपका पासकी अनुरोध सबमिट हो चुका है और एडमिन की स्वीकृति की प्रतीक्षा में है। स्वीकृति मिलते ही आपको सूचित किया जाएगा।
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center px-4 py-2 rounded-md bg-gray-400 text-white cursor-not-allowed"
                            >
                              Waiting for Admin Approval
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            {(eligibilityLoading || jobApplyLoading) ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="w-full">
                      {/* Skeleton for title */}
                      <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
                      
                      {/* Skeleton for content */}
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                      
                      {/* Skeleton for button */}
                      <div className="h-10 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : hasEligibleJobs ? (
                <div className={`rounded-xl border p-4 sm:p-6 mb-4 ${
                  hasAppliedJobs
                    ? "border-blue-400 bg-blue-50"
                    : "border-primary bg-primary/5"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="w-full">
                      {hasAppliedJobs ? (
                        <>
                          <div className="text-xl font-semibold text-blue-700">💼 नौकरी आवेदन सक्रिय | Job Applications Active</div>
                          <div className="mt-2 text-gray-700">
                            <p className="mb-1">
                              आपने <span className="font-semibold">{appliedJobsCount}</span> पदों के लिए आवेदन किया है। 
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              You have applied for <span className="font-semibold">{appliedJobsCount}</span> job position(s). Your applications are being reviewed by recruiters.
                              <br />
                              आपके आवेदन की समीक्षा भर्तीकर्ताओं द्वारा की जा रही है।
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => navigate("/teacher/job-apply")}
                              className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Manage Applications
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-semibold text-primary">🎉 आप नौकरी के लिए आवेदन कर सकते हैं | You Can Apply for Jobs</div>
                          <div className="mt-2 text-gray-700">
                            <p className="mb-1">
                              बधाई हो! आप <span className="font-semibold">{eligibleExams.length}</span> विषयों में नौकरी के लिए पात्र हैं।
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Congratulations! You are eligible to apply for jobs in <span className="font-semibold">{eligibleExams.length}</span> subject(s).
                              <br />
                              अभी आवेदन करें और स्कूल/संस्थानों से जुड़ें।
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => navigate("/teacher/job-apply")}
                              className="inline-flex items-center px-5 py-2.5 rounded-md bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-500 shadow-md hover:shadow-lg transition-all"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Apply for Jobs Now
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            {/* Interview eligibility and status banner */}
              {shouldShowInterviewSection && (
                <div className="rounded-xl border border-success bg-green-100 p-4 sm:p-6 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      {hasScheduledInterview ? (
                        <div>
                          <div className="text-xl font-semibold text-success">आपका आगामी इंटरव्यू | You have an upcoming interview</div>
                          {nextInterview && (
                            <div className="mt-1 text-gray-700">
                              <span className="font-medium">Class Category: {nextInterview?.class_category?.name}</span>
                              {" "}·{" "}
                              <span>{nextInterview?.subject?.subject_name}</span>
                              {nextInterview?.time && (
                                <>
                                  {" "}·{" "}
                                  <span>
                                    {new Date(nextInterview.time).toLocaleString('en-US', {
                                      hour: 'numeric',
                                      minute: 'numeric',
                                      hour12: true,
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>                            </>
                              )}
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {nextInterview?.link && (
                              <a
                                href={nextInterview.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-md bg-success text-white hover:opacity-90"
                              >
                                Join Interview
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={scrollToInterview}
                              className="inline-flex items-center px-4 py-2 rounded-md border border-success text-success hover:bg-success/10"
                            >
                              Manage Interviews
                            </button>
                          </div>
                        </div>
                      ) : hasRequestedInterview ? (
                        <div>
                          <div className="text-xl font-semibold text-success">इंटरव्यू अनुरोध स्वीकृति लंबित | Interview request pending approval</div>
                          <p className="mt-1 text-gray-700">आपके इंटरव्यू की तारीख तय होने पर हम आपको सूचित करेंगे। | We will notify you once your interview is scheduled.</p>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={scrollToInterview}
                              className="inline-flex items-center px-4 py-2 rounded-md bg-success/90 hover:bg-success text-white"
                            >
                              View Request
                            </button>
                          </div>
                        </div>
                      ) : isEligibleForInterview ? (
                        <div>
                          <div className="text-xl font-semibold text-success">🎉 बधाई हो! आप इंटरव्यू के लिए योग्य हैं | Congratulations! You're eligible for Interview</div>
                          <p className="mt-1 text-gray-700">
                            <span className="font-sm">Level 2 पास कर लिया है।</span> अब इंटरव्यू शेड्यूल करें और स्कूल/संस्थान में नौकरी के लिए आवेदन करें।
                            <br className="hidden sm:block" />
                            <span className="text-gray-600">Level 2 passed. Schedule your interview now and apply for teaching jobs in schools/institutes.</span>
                          </p>
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={scrollToInterview}
                              className="inline-flex items-center px-5 py-2.5 rounded-md bg-green-700 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
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


            {/* Show preference form if user doesn't have class categories */}
            {!hasClassCategories ? (
              <div className="">
                <PrefrenceProfile forceEdit={true} />
              </div>
            ) : (
              <>
                {/* Interview management placed prominently at the top when eligible or existing interviews */}
                {shouldShowInterviewSection && (
                    <InterviewCard />
                )}

                {/* Show less prominent interview history for completed interviews */}
                {hasPassedInterview && interviews.length > 0 && !shouldShowInterviewSection && (
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
                    <div ref={interviewSectionRef} className="hidden">
                      <InterviewCard />
                    </div>
                  </div>
                )}

                {/* Other dashboard content */}
                  <FilterdExamCard />
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
