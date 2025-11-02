import { useEffect, useState } from "react";
import { FaLock, FaLockOpen, FaBookOpen } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import Steppers from "./Stepper";
import {
  getExamSet,
  setExam,
  postInterview,
  generatePasskey,
  getAllCenter,
  resetPasskeyResponse,
  verifyPasscode,
  resetInterview,
  getgeneratedPasskey,
} from "../../../features/examQuesSlice";
import {
  getPrefrence,
  getEducationProfile,
} from "../../../features/jobProfileSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

function ExamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { basicData } = useSelector((state) => state.personalProfile);
  const { prefrence } = useSelector((state) => state.jobProfile);
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );
  const subjects = useSelector(
    (state) => state.jobProfile.prefrence.prefered_subject
  );
  const { examSet, allcenter, attempts, error } = useSelector(
    (state) => state.examQues
  );
  

  const getFirstQualifiedOccurrences = () => {
    const seenPairs = new Set(); // Track seen subject-category pairs
    const result = [];

    for (const item of attempts) {
      if (item?.exam?.level_code == 2.0 && item?.isqualified === true) {
        const pairKey = `${item.exam.subject_id}-${item.exam.class_category_id}`;

        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          result.push({
            subjectId: item.exam.subject_id,
            classCategoryId: item.exam.class_category_id,
            subjectName: item.exam.subject_name,
            classCategoryName: item.exam.class_category_name,
            examName: item.exam.name,
            level_code: item.exam.level_code,
          });
        }
      }
    }

    return result;
  };

  const firstQualifiedExams = getFirstQualifiedOccurrences();
  

  const level1ExamSets = examSet?.exams?.filter(
    (exam) => exam.level.level_code == 1.0
  );
  const level2OnlineExamSets = examSet?.exams?.filter(
    (exam) => exam?.level?.level_code == 2.0
  );
  const level2OfflineExamSets = examSet?.exams?.filter(
    (exam) => exam?.level?.level_code == 2.5
  );

  const interviewEligible = examSet?.interview_details;

  
  
  
  const { userData } = useSelector((state) => state?.auth);
  const { interview, exam, passkeyresponse, verifyresponse } = useSelector(
    (state) => state.examQues
  );
  
  
  
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

  
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getPrefrence()).unwrap();
      await dispatch(getEducationProfile()).unwrap();
      setIsLoading(false); // Data fetching is complete
    };
    fetchData();
    const subject = prefrence?.prefered_subject;
  }, [dispatch]);

  // Set activeTab after prefrence is fetched
  useEffect(() => {
    if (!isLoading && prefrence?.class_category?.length > 0) {
      setActiveTab(prefrence.class_category[0].id);
    }
  }, [isLoading, prefrence]);

  const exam_id = passkeyresponse?.exam?.id;
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
  const [loading, setLoading] = useState(false);

  // Check localStorage on component mount to see if a reminder is needed
  useEffect(() => {
    const isReminderSet = localStorage.getItem("showReminder");
    if (isReminderSet === "true") {
      setShowReminderMessage(true);
    }
  }, []);

  useEffect(() => {
    dispatch(getgeneratedPasskey());
    dispatch(getAllCenter());
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
    
    setActiveTab(category?.id); // Update activeTab
    setSelectedSubject(""); // Reset subject on category change
  };

  useEffect(() => {
    if (activeTab !== null) {
      const subject = prefrence?.prefered_subject || [];
      

      const filteredSubjects = subject.filter(
        (subject) => subject.class_category === activeTab
      );

      setFilteredSubjects(filteredSubjects);
      
    }
  }, [activeTab]); // Runs on mount and when activeTab changes
  const handleSubjectChange = (e) => {
    try {
      const subject = e.target.value;

      // Validate input
      if (!subject?.id || !subject?.subject_name) {
        console.error("Invalid subject selection");
        return;
      }

      // Update state
      setSelectedSubject(subject.id);
      setSelectedSubjectName(subject.subject_name);

      console.log("Selected subject:", {
        id: subject.id,
        name: subject.subject_name,
      });
      
      setLoading(true);

      if (activeTab) {
        dispatch(
          getExamSet({
            subject_id: subject.id,
            class_category_id: activeTab,
          })
        )
          .unwrap()
          .then(() => {
            
            setLoading(false);
            return true;
          })
          .catch((error) => {
            console.error("Failed to fetch exam sets:", error);
            setLoading(false);
            return false;
          });
      } else {
        
        return false;
      }
    } catch (error) {
      console.error("Error in subject change handler:", error);
      // Optionally reset subject selection
      setSelectedSubject(null);
      setSelectedSubjectName("");
    }
  };
  // useEffect(() => {
  //   
  // }, [interviewEligible]);

  // useEffect(() => {
  //   const checkEligibility = () => {
  //     if (activeTab && selectedSubject) {
  //       const isQualified = firstQualifiedExams.some(
  //         (exam) =>
  //           exam.classCategoryId === activeTab &&
  //           exam.subjectId === selectedSubject
  //       );
  //       setInterviewEligible(isQualified);
  //       
  //     }
  //   };
  //   
  //   checkEligibility();
  // }, [activeTab, selectedSubject, firstQualifiedExams]);

  const handleExam = (exam) => {
    dispatch(setExam(exam));
    navigate("/exam");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedDateTime) {
      alert("Please select a date and time");
      return;
    }

    if (!selectedSubject || !activeTab) {
      alert("Missing required information");
      return;
    }

    try {
      // Set loading state
      // setIsSubmitting(true);

      // Dispatch the interview scheduling action
      const result = await dispatch(
        postInterview({
          subject: selectedSubject,
          class_category: activeTab,
          time: selectedDateTime,
          level: interviewEligible?.interview?.level?.level_code,
        })
      ).unwrap(); // Using unwrap() to properly handle the Promise

      
      dispatch(
        getExamSet({
          subject_id: selectedSubject,
          class_category_id: activeTab,
        })
      );
      // Only update state if successful
      setIsSubmitted(true);
      dispatch(resetInterview());

      // Optional: Reset form or show success message
      // setSelectedDateTime('');
      // alert("Interview scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule interview:", error);

      // Handle specific error cases
      if (error.message.includes("time slot")) {
        alert(
          "This time slot is no longer available. Please choose another time."
        );
      } else if (error.message.includes("conflict")) {
        alert("You already have an interview scheduled at this time.");
      } else {
        alert("Failed to schedule interview. Please try again.");
      }

      // Keep form editable for corrections
      setIsSubmitted(false);
    }
  };
  const handleCenterChange = (e) => {
    setSelectedCenterId(e.target.value); // Update the selected center ID
  };
  const user_id = userData?.id;

  // Handle verification code submission
  const handleGeneratePasskey = async (event, exam) => {
    event.preventDefault();

    try {
      
      setExam(exam);

      // Validate center selection
      if (!selectedCenterId) {
        alert("Please select an exam center before submitting.");
        return;
      }

      
      // Dispatch the passkey generation action
      const result = await dispatch(
        generatePasskey({
          user_id,
          exam_id: exam,
          center_id: selectedCenterId,
        })
      ).unwrap(); // Using unwrap() to properly handle the Promise

      // Only proceed if successful
      

      // Clear reminders and update UI
      localStorage.removeItem("showReminder");
      setShowReminderMessage(false);
      setCenterSelectionPopup(false);
      setShowVerificationCard(true);

      // Navigate after successful operation
      navigate("/teacher");
    } catch (error) {
      console.error("Passkey generation failed:", error);

      // Handle different error cases
      if (error.message.includes("network")) {
        alert("Network error. Please check your connection and try again.");
      } else if (error.message.includes("center")) {
        alert(
          "Invalid exam center selection. Please choose a different center."
        );
      } else {
        alert("Failed to generate passkey. Please try again later.");
      }

      // Keep the popup open for corrections
      setCenterSelectionPopup(true);
    }
  };

  const handleverifyPasskey = async (event) => {
    event.preventDefault();
    

    if (!passcode) {
      alert("Please enter a verification code");
      return;
    }

    try {
      
      // Dispatch the verification action and wait for response
      const result = await dispatch(
        verifyPasscode({
          user_id,
          exam_id: exam_id,
          passcode,
        })
      ).unwrap();

      if (result.error) {
        // If verification failed
        alert("Wrong passcode! Please try again.");
        return;
      }

      // If verification succeeded
      // dispatch(setExam(level2OfflineExamSets[0]?.id));
      dispatch(resetPasskeyResponse());
      alert("Verification successful! You can now proceed with the exam.");
      navigate("/exam");
    } catch (error) {
      console.error("Verification failed:", error);
      alert("An error occurred during verification. Please try again.");
    }
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
      <div className=" mx-auto p-4 shadow">
        {/* Stepper Component */}
        {attempts && (
          <div className="col-span-3">
            <Steppers />
          </div>
        )}
        {isProfileComplete ? (
          <>
            {" "}
            {/* Modern Tab Switching */}
            {classCategories && (
              <div className="md:space-y-6 space-y-4 p-2">
                {/* Category Selection Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ">
                  <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-1">
                    Choose a Class Category
                  </h3>
                  {classCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        activeTab === category.id
                          ? "border-[#3E98C7] bg-blue-50 shadow-inner"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            activeTab === category.id
                              ? "text-[#3E98C7]"
                              : "text-gray-700"
                          }`}
                        >
                          {category.name}
                        </span>
                        {activeTab === category.id && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-[#3E98C7]"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subject Selection Card */}
                {activeTab && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">
                        <span className="text-gray-600">
                          Selected Category:
                        </span>{" "}
                        <span className="text-[#3E98C7]">
                          {
                            classCategories.find((cat) => cat.id === activeTab)
                              ?.name
                          }
                        </span>
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Choose Subject
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {filteredSubjects?.length > 0 ? (
                            filteredSubjects.map((subject) => (
                              <div
                                key={subject.id}
                                onClick={() =>
                                  handleSubjectChange({
                                    target: { value: subject },
                                  })
                                }
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  selectedSubject === subject.id
                                    ? "border-[#3E98C7] bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      selectedSubject === subject.id
                                        ? "bg-[#3E98C7]"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span
                                    className={`font-medium ${
                                      selectedSubject === subject.id
                                        ? "text-[#3E98C7]"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {subject.subject_name}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full p-4 text-center text-gray-500">
                              No subjects available for this category
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 ">
              {classCategories && !selectedSubject && (
                <div className="col-span-3 bg-blue-50 p-8 rounded-2xl border border-dashed border-blue-200 text-center">
                  <CiLock className="mx-auto text-4xl text-teal-500 mb-2 size-14" />
                  <h3 className="text-xl font-semibold text-teal-600 mb-2">
                    Select a Subject to Begin
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Choose a subject from the dropdown above to view available
                    exams and interview options for your selected class category
                  </p>
                </div>
              )}

              {selectedSubject && examSet && (
                <>
                  {loading && <Loader />}
                  {error && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
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
                  {!error && (
                    <>
                      {/* Level 1 Exam Card */}
                      {level1ExamSets?.map((exam) => (
                        <div
                          key={exam.id}
                          className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                              {exam?.level?.name}
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

                      {level1ExamSets?.length === 0 && (
                        <div className="relative min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2">
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                                {exam?.level?.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                Basic Level
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">
                              {selectedSubject} Basic
                            </h4>
                            <div className="space-y-2 text-sm text-gray-600 opacity-75">
                              <p>• 75 Scenario-based Questions</p>
                              <p>• 90 Minute Duration</p>
                              <p>• Complex Problem Solving</p>
                            </div>
                            <div className="mt-6 text-center">
                              <FaLock className="mx-auto text-3xl text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                Complete Level 1 to unlock
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Level 2 Online Exam Sets */}
                      {level2OnlineExamSets?.length > 0 &&
                        level2OnlineExamSets?.map((exam) => (
                          <div
                            key={exam.id}
                            className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-medium">
                                {exam?.level?.name}
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
                              <p>• Advanced Problem Solving</p>
                            </div>
                            <button
                              onClick={() => handleExam(exam)}
                              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300"
                            >
                              <FaLockOpen className="w-5 h-5" />
                              {exam?.level?.name}
                            </button>
                          </div>
                        ))}

                      {/* Locked Level 2 Card (if no Level 2 exams are available) */}
                      {level2OnlineExamSets?.length === 0 &&
                        level2OfflineExamSets?.length === 0 && (
                          <div className="relative min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2">
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                                  {exam?.level?.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Advanced Level
                                </span>
                              </div>
                              <h4 className="text-xl font-bold text-gray-800 mb-3">
                                {selectedSubject} Advanced
                              </h4>
                              <div className="space-y-2 text-sm text-gray-600 opacity-75">
                                <p>• 75 Scenario-based Questions</p>
                                <p>• 90 Minute Duration</p>
                                <p>• Complex Problem Solving</p>
                              </div>
                              <div className="mt-6 text-center">
                                <FaLock className="mx-auto text-3xl text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  Complete Level 1 to unlock
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {level2OfflineExamSets?.length > 0 ? (
                        <div>
                          {centerSelectionPopup ? (
                            <>
                              {/* Reminder message */}
                              {showReminderMessage && (
                                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg text-yellow-700">
                                  <p className="font-medium">
                                    Your exam center selection is pending.
                                    Please select your exam center to proceed.
                                  </p>
                                </div>
                              )}

                              {/* Card for selecting exam center */}
                              <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                                <div className="p-6">
                                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                                    Select Exam Center
                                  </h3>
                                  <form
                                    onSubmit={(event) =>
                                      handleGeneratePasskey(
                                        event,
                                        level2OfflineExamSets[0]?.id
                                      )
                                    }
                                    className="space-y-4"
                                  >
                                    <div className="flex flex-col gap-4">
                                      <select
                                        value={selectedCenterId}
                                        onChange={handleCenterChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      >
                                        <option value="">
                                          Select Exam Center
                                        </option>
                                        {allcenter &&
                                          allcenter?.map((center) => (
                                            <option
                                              key={center.id}
                                              value={center.id}
                                            >
                                              {center.center_name}
                                            </option>
                                          ))}
                                      </select>
                                      <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                                      >
                                        Generate Passkey for Offline Exam
                                      </button>
                                    </div>
                                  </form>
                                </div>

                                {/* Remind me later button inside the card */}
                                <div className="bg-gray-50 p-4 border-t border-gray-100">
                                  <button
                                    onClick={handleRemindMeLater}
                                    className="w-full text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                                  >
                                    Remind me later
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : showVerificationCard ? (
                            // Verification Card
                            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 mt-6">
                              <div className="px-6 py-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                  Offline Exam Verification
                                </h2>
                                <p className="text-gray-600 mb-4">
                                  Your exam center is{" "}
                                  <strong>{passkeyresponse.center_name}</strong>
                                  . You will receive your passkey at the center.
                                  Please enter the verification code provided to
                                  proceed with the exam.
                                </p>
                                <form
                                  onSubmit={handleverifyPasskey}
                                  className="space-y-4"
                                >
                                  <input
                                    type="text"
                                    value={passcode}
                                    onChange={(e) =>
                                      setPasscode(e.target.value)
                                    }
                                    placeholder="Enter Verification Code"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                                  >
                                    Verify and Proceed to Exam
                                  </button>
                                </form>
                              </div>
                            </div>
                          ) : (
                            <>
                              {level2OfflineExamSets?.map((exam) => (
                                <div
                                  key={exam.id}
                                  className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-medium">
                                      {exam?.level?.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Advanced Level
                                    </span>
                                  </div>
                                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                                    {exam.subject.subject_name} Advanced{" "}
                                    {exam.name}
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
                                    <p>• Advanced Problem Solving</p>
                                  </div>

                                  <button
                                    onClick={() => {
                                      if (
                                        Object.entries(passkeyresponse).length >
                                        0
                                      ) {
                                        setShowVerificationCard(true);
                                      } else {
                                        setCenterSelectionPopup(true);
                                        // Show center selection popup
                                      }
                                    }}
                                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300"
                                  >
                                    <FaLockOpen className="w-5 h-5" />
                                    {exam?.level?.name}
                                  </button>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                  {/* Interviews Section */}
                  {interviewEligible && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Pending - Show Scheduling Form */}
                      {interviewEligible?.interview?.status === "pending" && (
                        <form onSubmit={handleSubmit} className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Schedule Interview
                            </span>
                            <span className="text-sm text-gray-500">
                              Select Date & Time
                            </span>
                          </div>

                          <h4 className="text-xl font-semibold text-gray-800 mb-5">
                            Choose a Date and Time for Your Interview{" "}
                            {interviewEligible?.interview?.level?.name}
                          </h4>

                          <div className="space-y-5">
                            <div>
                              <label
                                htmlFor="datetime"
                                className="block text-sm font-medium text-gray-700 mb-2"
                              >
                                Date and Time
                              </label>
                              <div className="relative">
                                <Flatpickr
                                  options={{
                                    enableTime: true,
                                    dateFormat: "Y-m-d H:i:S",
                                    time_24hr: true,
                                    minDate: "today",
                                  }}
                                  value={selectedDateTime}
                                  onChange={([date]) => {
                                    const formatted = date
                                      .toISOString()
                                      .replace("T", " ")
                                      .replace(/\.\d+Z/, "");
                                    setSelectedDateTime(formatted);
                                  }}
                                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Submit Request
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Requested - Show Pending Card */}
                      {interviewEligible?.interview?.status === "requested" && (
                        <div className="p-6">
                          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition-all">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-50 p-2.5 rounded-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-blue-600"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Interview Request
                                  </h3>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Pending
                                  </span>
                                </div>

                                <div className="mt-3 space-y-2.5">
                                  {/* Requested Time */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        Requested time:
                                      </span>{" "}
                                      {interviewEligible?.interview?.time}
                                    </p>
                                  </div>

                                  {/* Subject */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        Subject:
                                      </span>{" "}
                                      {interviewEligible?.interview?.subject
                                        ?.subject_name || "Not specified"}
                                    </p>
                                  </div>

                                  {/* Class Category */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        Class Category:
                                      </span>{" "}
                                      {interviewEligible?.interview
                                        ?.class_category?.name ||
                                        "Not specified"}
                                    </p>
                                  </div>

                                  {/* Level */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        Level:
                                      </span>{" "}
                                      {interviewEligible?.interview?.level
                                        ?.name || "Not specified"}
                                    </p>
                                  </div>

                                  {/* Status */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        Status:
                                      </span>{" "}
                                      Under admin review
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <p className="flex items-start gap-2 text-sm text-blue-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 flex-shrink-0"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span>
                                      We'll email you once approved. Usually
                                      within 24 hours.
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Approved - Show Approved Card */}
                      {interviewEligible?.interview?.status === "scheduled" && (
                        <div className="p-6">
                          <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Approved
                              </span>
                              <span className="text-sm text-gray-600">
                                Ready to Join
                              </span>
                            </div>

                            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                              Interview Scheduled
                            </h4>

                            <div className="space-y-3">
                              <div className="flex items-start">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div>
                                  <p className="text-gray-700">
                                    <span className="font-medium">
                                      Class Category
                                    </span>{" "}
                                    {interviewEligible?.interview
                                        ?.class_category?.name || "N/A"}
                                  </p>
                                  <p className="text-gray-700">
                                    <span className="font-medium">
                                      Subject:
                                    </span>{" "}
                                    {interviewEligible?.interview?.subject?.subject_name || "N/A"}
                                  </p>
                                  <p className="text-gray-700">
                                    <span className="font-medium">
                                     Level
                                    </span>{" "}
                                    {interviewEligible?.interview
                                        ?.level?.name || "N/A"}
                                  </p>
                                  <p className="text-gray-700">
                                    <span className="font-medium">Time:</span>{" "}
                                    {new Date(interviewEligible?.interview?.time).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {interviewEligible?.interview?.link && (
                                <div className="mt-4 text-center">
                                  <a
                                    href={interviewEligible?.interview?.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-2"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                    </svg>
                                    Join Interview
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
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
