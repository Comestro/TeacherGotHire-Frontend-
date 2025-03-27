import { useEffect, useState } from "react";
import { FaLock, FaLockOpen, FaBookOpen } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import Steppers from "./Stepper";
import Loader from "./Loader"; // Import the Loader component
import {
  getExamSet,
  setExam,
  postInterview,
  generatePasskey,
  getAllCenter,
  resetPasskeyResponse,
  verifyPasscode,
} from "../../../features/examQuesSlice";
import {
  getPrefrence,
  getEducationProfile,
} from "../../../features/jobProfileSlice";
import InterviewCard from "../components/InterviewCard";

import { useNavigate } from "react-router-dom";

function ExamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading your dashboard...");

  // State variables for selections
  const [activeTab, setActiveTab] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [approvedDateTime, setApprovedDateTime] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [centerSelectionPopup, setCenterSelectionPopup] = useState(false);
  const [showReminderMessage, setShowReminderMessage] = useState(false);
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [offlineSet, SetOfflineSet] = useState("");

  const { basicData } = useSelector((state) => state.personalProfile);
  const { prefrence } = useSelector((state) => state.jobProfile);
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );

  console.log("classCategories", classCategories);

  const subjects = useSelector(
    (state) => state.jobProfile.prefrence.prefered_subject
  );
  const { examSet, allcenter, attempts, error } = useSelector(
    (state) => state.examQues
  );
  console.log("allcenter", allcenter);
  console.log("error", error);

  const level1ExamSets = examSet?.filter(
    (exam) => exam.level.name === "1st Level"
  );
  const level2OnlineExamSets = examSet?.filter(
    (exam) => exam.level.name === "2nd Level Online"
  );
  const level2OfflineExamSets = examSet?.filter(
    (exam) => exam.level.name === "2nd Level Offline"
  );

  // Add check for level completion
  const hasCompletedLevel1 = attempts?.some(
    attempt => 
      attempt.isqualified && 
      attempt.exam.subject_id === selectedSubject && 
      attempt.exam.class_category_id === activeTab &&
      attempt.exam.level_name === "1st Level"
  );

  const hasCompletedLevel2Online = attempts?.some(
    attempt => 
      attempt.isqualified && 
      attempt.exam.subject_id === selectedSubject && 
      attempt.exam.class_category_id === activeTab &&
      attempt.exam.level_name === "2nd Level Online"
  );

  console.log("level2OfflineExamSets", level2OfflineExamSets);
  console.log("level2OnlineExamSets", level2OnlineExamSets);
  const { userData } = useSelector((state) => state?.auth);
  const { interview, exam, passkeyresponse, verifyresponse } = useSelector(
    (state) => state.examQues
  );
  console.log("interview", interview);
  console.log("examSet", examSet);
  const exams = verifyresponse?.offline_exam;
  const isProfileComplete =
    basicData &&
    Object.keys(basicData).length > 0 &&
    prefrence &&
    Object.values(prefrence).some(
      (val) =>
        (Array.isArray(val) && val.length > 0) ||
        (typeof val === "object" &&
          val !== null &&
          Object.keys(val).length > 0) ||
        (typeof val === "string" && val.trim() !== "")
    );

  console.log("isProfileComplete", isProfileComplete);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingMessage("Loading your profile data...");
      try {
        await dispatch(getPrefrence()).unwrap();
        await dispatch(getEducationProfile()).unwrap();
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Set activeTab after prefrence is fetched
  useEffect(() => {
    if (!isLoading && prefrence?.class_category?.length > 0) {
      setActiveTab(prefrence.class_category[0].id);
    }
  }, [isLoading, prefrence]);

  // if (isLoading) {
  //   return <div>Loading...</div>; // Show a loading spinner or message
  // }

  const exam_id = passkeyresponse?.exam?.id;

  // Check localStorage on component mount to see if a reminder is needed
  useEffect(() => {
    const isReminderSet = localStorage.getItem("showReminder");
    if (isReminderSet === "true") {
      setShowReminderMessage(true);
    }
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoading(true);
      setLoadingMessage("Loading exam centers...");
      try {
        await dispatch(getAllCenter());
      } catch (error) {
        console.error("Error loading centers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCenters();
    
    if (classCategories) {
      setActiveTab(classCategories[0]?.id);
    }
  }, []);

  // Handle "Remind me later" button click
  const handleRemindMeLater = () => {
    // Set a flag in localStorage to show the reminder on refresh
    localStorage.setItem("showReminder", "true");

    // Hide the card and show the reminder message
    setCenterSelectionPopup(false);
    setShowReminderMessage(true);
  };

  // Handle category switch
  const handleCategoryChange = (category) => {
    console.log("category", category);
    setActiveTab(category?.id); // Update activeTab
    setSelectedSubject(""); // Reset subject on category change
  };

  useEffect(() => {
    if (activeTab !== null) {
      const subject = prefrence?.prefered_subject || [];
      console.log("subject", subject);

      const filteredSubjects = subject.filter(
        (subject) => subject.class_category === activeTab
      );

      setFilteredSubjects(filteredSubjects);
      console.log("filteredSubjects", filteredSubjects);
    }
  }, [activeTab]); // Runs on mount and when activeTab changes

  // const handleSubjectChange = (e) => {
  //   const subjectId = e.target.value;
  //   setSelectedSubject(subjectId.id);
  //   setSelectedSubjectName(subjectId.subject_name);
  //   console.log("selectedSubject", subjectId);
  //   dispatch(
  //     getExamSet({
  //       subject_id: subjectId?.id,
  //       class_category_id: activeTab,
  //     })
  //   );
  // };

  const handleSubjectChange = (subject) => {
    console.log("selectedSubject", subject);
    setSelectedSubject(subject.id);
    setSelectedSubjectName(subject.subject_name);
    dispatch(
      getExamSet({
        subject_id: subject.id,
        class_category_id: activeTab,
      })
    );
  };
  const handleExam = (exam) => {
    setIsExamLoading(true);
    setLoadingMessage("Preparing your exam...");
    
    setTimeout(() => {
      dispatch(setExam(exam));
      navigate("/exam");
      setIsExamLoading(false);
    }, 1000); // Add a slight delay for the loader to be noticeable
  };
  console.log("selectedSubject",selectedSubject)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission (e.g., API call)
    console.log("Selected Date and Time:", selectedDateTime);
    
    // Update state to show pending card
    dispatch(
      postInterview({
        subject: selectedSubject,
        class_category: activeTab,
        time: selectedDateTime,
      })
    );
    setIsSubmitted(true);
  };
  const handleCenterChange = (e) => {
    setSelectedCenterId(e.target.value); // Update the selected center ID
  };
  const user_id = userData.id;
  // const handleGeneratePasskey = async (event, exam) => {
  //   event.preventDefault();
  //   console.log("exam", exam);
  //   SetOfflineSet(exam);
  //   if (selectedCenterId) {
  //     console.log("selectedCenterId", selectedCenterId);
  //     dispatch(
  //       generatePasskey({ user_id, exam_id: exam, center_id: selectedCenterId })
  //     );
  //     navigate("/teacher");
  //     setCenterSelectionPopup(false);
  //   } else {
  //     alert("Please select a center before submitting.");
  //   }

  //   // Clear the reminder flag from localStorage
  //   localStorage.removeItem("showReminder");
  //   setShowVerificationCard(true);
  //   // Hide the reminder message
  //   setShowReminderMessage(false);
  // };

  // Handle verification code submission
  const handleGeneratePasskey = async (event, exam) => {
    event.preventDefault();
    console.log("exam", exam);
    SetOfflineSet(exam);
    if (selectedCenterId) {
      console.log("selectedCenterId", selectedCenterId);
      dispatch(
        generatePasskey({ user_id, exam_id: exam, center_id: selectedCenterId })
      );
      navigate("/teacher");
      setCenterSelectionPopup(false);
    } else {
      alert("Please select a center before submitting.");
    }

    // Clear the reminder flag from localStorage
    localStorage.removeItem("showReminder");
    setShowVerificationCard(true);
    // Hide the reminder message
    setShowReminderMessage(false);
  };

  // Handle verification code submission
  const handleverifyPasskey = (event) => {
    event.preventDefault();
    console.log("Verification code submitted:", passcode);
    dispatch(setExam(level2OfflineExamSets[0]?.id));
    dispatch(verifyPasscode({ user_id, exam_id: offlineSet, passcode }));
    dispatch(resetPasskeyResponse());
    navigate("/exam");
    // Add your verification logic here
    alert("Verification successful! You can now proceed with the exam.");
  };
  // Simulate page refresh behavior
  useEffect(() => {
    const isVerificationCardShown = localStorage.getItem(
      "showVerificationCard"
    );
    if (isVerificationCardShown === "true") {
      setShowVerificationCard(true);
    }
  }, []);
  return (
    <>
      {/* Main Loader */}
      <Loader isLoading={isLoading} message={loadingMessage} />
      
      {/* Exam Loading */}
      <Loader isLoading={isExamLoading} message={loadingMessage} />
      
      {/* Interview Loading */}
      <Loader isLoading={isInterviewLoading} message={loadingMessage} />
      
      {/* Passkey Loading */}
      <Loader isLoading={isPasskeyLoading} message={loadingMessage} />
      
      {/* Verify Loading */}
      <Loader isLoading={isVerifyLoading} message={loadingMessage} />
      
      <div className="mx-auto p-6 bg-white rounded-lg border">
        {/* Updated Stepper Component with passed props */}
        {attempts && isProfileComplete && (
          <div className="mb-8">
            <Steppers 
              onCategoryChange={handleCategoryChange}
              onSubjectChange={handleSubjectChange}
              activeTab={activeTab}
              selectedSubject={selectedSubject}
            />
          </div>
        )}
        
        {/* Rest of UI - only show if profile is complete but no subject selected */}
        {isProfileComplete && !selectedSubject && (
          <div className="col-span-3 bg-blue-50 p-8 rounded-2xl border border-dashed border-blue-200 text-center mt-4">
            <CiLock className="mx-auto text-4xl text-teal-500 mb-2 size-14" />
            <h3 className="text-xl font-semibold text-teal-600 mb-2">
              Select a Subject Above to Begin
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose a class category and subject from the options above to view available
              exams and interview options
            </p>
          </div>
        )}

        {/* Rest of existing UI for when a subject is selected */}
        {isProfileComplete && selectedSubject && examSet && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {error && (
              <div className="col-span-3 mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No Exam Available
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {typeof error === "string"
                          ? error
                          : "You've completed all attempts for this exam."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Level 1 Exam Card */}
            {!error && level1ExamSets.map((exam) => (
              // ...existing level 1 exam UI...
              <div
                key={exam.id}
                className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                    Level 1
                  </span>
                  <span className="text-sm text-gray-500">
                    Basic Level
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {exam.subject.subject_name} Fundamentals {exam.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="m-0 flex items-center gap-1">
                    • {exam.questions?.length || 0} Questions
                    {exam.questions?.length > 0 && (
                      <>
                        <span className="ml-1">(</span>
                        <span
                          className="text-primary-500 font-medium cursor-help"
                          title="English Questions"
                        >
                          {
                            exam.questions.filter(
                              (q) => q.language === "English"
                            ).length
                          }{" "}
                          EN
                        </span>
                        <span> / </span>
                        <span
                          className="text-secondary-500 font-medium cursor-help"
                          title="Hindi Questions"
                        >
                          {
                            exam.questions.filter(
                              (q) => q.language === "Hindi"
                            ).length
                          }{" "}
                          HI
                        </span>
                        <span>)</span>
                      </>
                    )}
                  </p>
                  <p>• {exam.duration} Minute Duration</p>
                  <p>• {exam.total_marks} Total Marks</p>
                  <p>• Basic Concepts Assessment</p>
                </div>
                <button
                  onClick={() => handleExam(exam)}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-300"
                >
                  <FaLockOpen className="w-5 h-5" />
                  Start Level 1 Exam
                </button>
              </div>
            ))}

            {/* Level 2 Online Exam Card - Only show if Level 1 is completed */}
            {!error && hasCompletedLevel1 && level2OnlineExamSets.map((exam) => (
              <div
                key={exam.id}
                className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100 mb-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-medium">
                    Level 2 Online
                  </span>
                  <span className="text-sm text-gray-500">
                    Advanced Level
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {exam.subject.subject_name} Advanced {exam.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="m-0 flex items-center gap-1">
                    • {exam.questions?.length || 0} Questions
                    {exam.questions?.length > 0 && (
                      <>
                        <span className="ml-1">(</span>
                        <span
                          className="text-primary-500 font-medium cursor-help"
                          title="English Questions"
                        >
                          {
                            exam.questions.filter(
                              (q) => q.language === "English"
                            ).length
                          }{" "}
                          EN
                        </span>
                        <span> / </span>
                        <span
                          className="text-secondary-500 font-medium cursor-help"
                          title="Hindi Questions"
                        >
                          {
                            exam.questions.filter(
                              (q) => q.language === "Hindi"
                            ).length
                          }{" "}
                          HI
                        </span>
                        <span>)</span>
                      </>
                    )}
                  </p>
                  <p>• {exam.duration} Minute Duration</p>
                  <p>• {exam.total_marks} Total Marks</p>
                  <p>• Advanced Online Assessment</p>
                </div>
                <button
                  onClick={() => handleExam(exam)}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300"
                >
                  <FaLockOpen className="w-5 h-5" />
                  Start Level 2 Online Exam
                </button>
              </div>
            ))}

            {/* Level 2 Offline Exam Card - Only show if Level 2 Online is completed */}
            {!error && hasCompletedLevel2Online && level2OfflineExamSets.map((exam) => (
              <div
                key={exam.id}
                className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-100 mb-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 text-white text-sm font-medium">
                    Level 2 Offline
                  </span>
                  <span className="text-sm text-gray-500">
                    Practical Assessment
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {exam.subject.subject_name} Practical {exam.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Visit a Test Center</p>
                  <p>• {exam.duration} Minute Duration</p>
                  <p>• {exam.total_marks} Total Marks</p>
                  <p>• Hands-on Teaching Skills Assessment</p>
                </div>
                <button
                  onClick={() => {
                    setCenterSelectionPopup(true);
                    SetOfflineSet(exam.id);
                  }}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors duration-300"
                >
                  <FaLockOpen className="w-5 h-5" />
                  Select Test Center
                </button>
              </div>
            ))}

            {/* Rest of the exam cards and content */}
            {/* ...existing remaining content... */}
          </div>
        )}
        
        {!isProfileComplete && (
          // Existing profile incomplete UI
          <>
            {/* Access Level 1 Message */}
            <div className="mt-6 p-5 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700 text-sm">
              <p>
                Please complete your profile, and complete your missing details
                then select a subject to access Level 1.
              </p>
            </div>

            {/* Cards Section */}
            <div className="flex flex-wrap gap-5 mt-6">
              {[
                { title: "Level 1", subtitle: "Beginner Level" },
                { title: "Level 2", subtitle: "Advanced Level" },
                { title: "Center", subtitle: "Practice Center" },
                { title: "Interview", subtitle: "Interview Prep" },
              ].map((card, index) => (
                <div
                  key={index}
                  className="relative flex-1 min-w-[250px] sm:min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2"
                >
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                        {card.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {card.subtitle}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">
                      {selectedSubject} {card.title}
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600 opacity-75">
                      <p>• 75 Scenario-based Questions</p>
                      <p>• 90 Minute Duration</p>
                      <p>
                        •{" "}
                        {card.title === "Level 1"
                          ? "Basic Concepts"
                          : card.title === "Level 2"
                          ? "Complex Problem Solving"
                          : card.title === "Center"
                          ? "Practice Sessions"
                          : "Mock Interviews"}
                      </p>
                    </div>
                    <div className="mt-6 text-center">
                      <FaLock className="mx-auto text-3xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {card.title === "Level 1"
                          ? "Complete Profile to unlock"
                          : card.title === "Level 2"
                          ? "Complete Level 1 to unlock"
                          : card.title === "Center"
                          ? "Unlock with Level 2"
                          : "Unlock with Interview Prep"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ExamManagement;
