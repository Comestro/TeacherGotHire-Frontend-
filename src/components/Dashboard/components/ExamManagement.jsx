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
} from "../../../features/examQuesSlice";
import {
  getPrefrence,
  getEducationProfile,
} from "../../../features/jobProfileSlice";

import { useNavigate } from "react-router-dom";

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
  const { examSet, allcenter, attempts } = useSelector(
    (state) => state.examQues
  );
  console.log("attempts",attempts)

  const level1ExamSets = examSet?.filter(
    (exam) => exam.level.name === "1st Level"
  );
  const level2OnlineExamSets = examSet?.filter(
    (exam) => exam.level.name === "2nd Level Online"
  );
  const level2OfflineExamSets = examSet?.filter(
    (exam) => exam.level.name === "2nd Level Offline"
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

  // if (isLoading) {
  //   return <div>Loading...</div>; // Show a loading spinner or message
  // }

  const exam_id = passkeyresponse?.exam?.id;

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
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

  // Check localStorage on component mount to see if a reminder is needed
  useEffect(() => {
    const isReminderSet = localStorage.getItem("showReminder");
    if (isReminderSet === "true") {
      setShowReminderMessage(true);
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

  useEffect(() => {
    dispatch(getAllCenter());
    if (classCategories) {
      setActiveTab(classCategories[0]?.id);
    }
  }, []);

  // Handle category switch
  const handleCategoryChange = (category) => {
    console.log("category", category);
    setActiveTab(category?.id); // Update activeTab
    setSelectedSubject(""); // Reset subject on category change
  };

  useEffect(() => {
    if (activeTab !== null) {
      const subject = prefrence?.prefered_subject || [];
      console.log("prefrence", subject);

      const filteredSubjects = subject.filter(
        (subject) => subject.class_category === activeTab
      );

      setFilteredSubjects(filteredSubjects);
      console.log("filteredSubjects", filteredSubjects);
    }
  }, [activeTab]); // Runs on mount and when activeTab changes

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    console.log("selectedSubject", subjectId);
    dispatch(
      getExamSet({
        subject_id: subjectId,
        class_category_id: activeTab,
      })
    );
  };

  const handleExam = (exam) => {
    dispatch(setExam(exam));
    navigate("/exam");
  };

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
    dispatch(setExam(examSet[2]?.id));
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
      <div className=" mx-auto p-6 bg-white rounded-lg border">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#3E98C7] to-gray-800 rounded-xl p-6 shadow">
            <div className="flex items-center justify-center space-x-4">
              <FaBookOpen className="text-4xl text-white/90" />
              <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">
                  Exam Management Portal
                </h1>
                <p className="text-white/90 text-sm mt-1 font-medium">
                  Comprehensive Examination Control Panel
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <span className="h-1 w-12 bg-white/40 rounded-full"></span>
              <span className="h-1 w-8 bg-white/40 rounded-full"></span>
              <span className="h-1 w-4 bg-white/40 rounded-full"></span>
            </div>
          </div>
        </div>

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
  <div className="space-y-6">
    {/* Category Selection Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
            <span className={`font-medium ${
              activeTab === category.id ? "text-[#3E98C7]" : "text-gray-700"
            }`}>
              {category.name}
            </span>
            {activeTab === category.id && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3E98C7]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
            <span className="text-gray-600">Selected Category:</span>{" "}
            <span className="text-[#3E98C7]">
              {classCategories.find((cat) => cat.id === activeTab)?.name}
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
                    onClick={() => handleSubjectChange({ target: { value: subject.id } })}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSubject === subject.id
                        ? "border-[#3E98C7] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        selectedSubject === subject.id ? "bg-[#3E98C7]" : "bg-gray-300"
                      }`}></div>
                      <span className={`font-medium ${
                        selectedSubject === subject.id ? "text-[#3E98C7]" : "text-gray-700"
                      }`}>
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
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 ">
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
                  {/* Level 1 Exam Card */}
                  {level1ExamSets.map((exam) => (
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
                        <p>
                          • {exam.questions.length} Multiple Choice Questions
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

                  {level1ExamSets.length === 0 && (
                    <div className="relative min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                            Level 1
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
                  {level2OnlineExamSets.length > 0 &&
                    level2OnlineExamSets.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
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
                          <p>
                            • {exam.questions.length} Multiple Choice Questions
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
                          Start Level 2 Online Exam
                        </button>
                      </div>
                    ))}

                  {/* Locked Level 2 Card (if no Level 2 exams are available) */}
                  {level2OnlineExamSets.length === 0 &&
                    level2OfflineExamSets.length === 0 && (
                      <div className="relative min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2">
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                              Level 2
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

                  {level2OfflineExamSets ? (
                    <div>
                      {centerSelectionPopup ? (
                        <>
                          {/* Reminder message */}
                          {showReminderMessage && (
                            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg text-yellow-700">
                              <p className="font-medium">
                                Your exam center selection is pending. Please
                                select your exam center to proceed.
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
                                    level2OfflineExamSets[0].id
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
                                    <option value="">Select Exam Center</option>
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
                              <strong>{passkeyresponse.center_name}</strong>.
                              You will receive your passkey at the center.
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
                                onChange={(e) => setPasscode(e.target.value)}
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
                          {level2OfflineExamSets.map((exam) => (
                            <div
                              key={exam.id}
                              className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-medium">
                                  Level 2 Exam
                                </span>
                                <span className="text-sm text-gray-500">
                                  Advanced Level
                                </span>
                              </div>
                              <h4 className="text-xl font-bold text-gray-800 mb-3">
                                {exam.subject.subject_name} Advanced {exam.name}
                              </h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <p>
                                  • {exam.questions.length} Multiple Choice
                                  Questions
                                </p>
                                <p>• {exam.duration} Minute Duration</p>
                                <p>• {exam.total_marks} Total Marks</p>
                                <p>• Advanced Problem Solving</p>
                              </div>

                              <button
                                onClick={() => {
                                  if (
                                    Object.entries(passkeyresponse).length > 0
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
                                Start Level 2 Center Exam
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    // Level 2 Locked Card
                    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                      <div className="relative z-10 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                            Level 2
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

                  {/* Interviews Section */}
                  {/* {level2OfflineExamSets.length > 0 ? (
                    <div className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2">
                      {!isSubmitted && !interview.length > 0 ? (
                        
                        <form onSubmit={handleSubmit}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                              Schedule Interview
                            </span>
                            <span className="text-sm text-gray-500">
                              Select Date & Time
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">
                            Choose a Date and Time for Your Interview
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="datetime"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Date and Time
                              </label>
                              <input
                                type="datetime-local"
                                id="datetime"
                                name="datetime"
                                value={selectedDateTime}
                                onChange={(e) =>
                                  setSelectedDateTime(e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-300"
                            >
                              Submit Request
                            </button>
                          </div>
                        </form>
                      ) : (
                        interview.length > 0 &&
                        interview.map((item) => (
                          <div className="flex flex-col items-center mt-10">
                            <div
                              key={item.id}
                              className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden mb-4 "
                            >
                              <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">
                                  {item.status === false ? (
                                    <>
                                      <div className="flex items-center justify-between mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500 text-white text-sm font-medium">
                                          Pending Approval
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          Admin Confirmation
                                        </span>
                                      </div>
                                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                                        Interview Request Submitted
                                      </h4>
                                      <div className="space-y-2 text-sm text-gray-600">
                                        <p>
                                          • Your selected date and time:{" "}
                                          {item.time}
                                        </p>
                                        <p>
                                          • Admin will confirm your request
                                          soon.
                                        </p>
                                      </div>
                                      <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-500">
                                          Thank you for submitting your request.
                                          We will notify you once it is
                                          approved.
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-green-600">
                                        Approved
                                      </span>
                                      <p className="text-gray-700 text-base">
                                        <strong>Subject:</strong>{" "}
                                        {item.subject_name || "N/A"}
                                      </p>
                                      <p className="text-gray-700 text-base">
                                        <strong>Time:</strong>{" "}
                                        {new Date(item.time).toLocaleString()}
                                      </p>
                                      {item.status !== false && item.link && (
                                        <div className="px-6 py-4 bg-gray-100">
                                          <p className="text-blue-600 font-semibold">
                                            <a
                                              href={item.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              Join Interview
                                            </a>
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>

                  
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="min-w-64">
                     
                      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold text-gray-800">
                            Online Interview
                          </h5>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">
                            Virtual
                          </span>
                        </div>
                        <div className="text-center py-4">
                          <FaLock className="mx-auto text-3xl text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500 mb-4">
                            Available after completing both exam levels
                          </p>
                          <div className="space-y-1 text-sm text-gray-600 text-left">
                            <p>• Video Conference Setup</p>
                            <p>• Practical Assessment</p>
                            <p>• Q&A Session</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )} */}
                  {level2OfflineExamSets.length > 0 ? (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    {!isSubmitted && !interview.length > 0 ? (
      // Scheduling Form
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Schedule Interview
          </span>
          <span className="text-sm text-gray-500">
            Select Date & Time
          </span>
        </div>
        
        <h4 className="text-xl font-semibold text-gray-800 mb-5">
          Choose a Date and Time for Your Interview
        </h4>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
              Date and Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Submit Request
          </button>
        </div>
      </form>
    ) : (
      // Interview Status Cards
      interview.length > 0 && interview.map((item) => (
        <div key={item.id} className="p-6">
          {item.status === false ? (
            // Pending Approval Card
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Pending Approval
                </span>
                <span className="text-sm text-gray-600">
                  Admin Confirmation
                </span>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Interview Request Submitted
              </h4>
              
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Your selected date and time: <span className="font-medium">{item.time}</span></span>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>Admin will confirm your request soon</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  Thank you for submitting your request. We will notify you once it is approved.
                </p>
              </div>
            </div>
          ) : (
            // Approved Interview Card
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Subject:</span> {item.subject_name || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Time:</span> {new Date(item.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {item.link && (
                  <div className="mt-4 text-center">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      Join Interview
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
) : (
  // Online Interview Card
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-semibold text-gray-800 text-lg">
          Online Interview
        </h5>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          </svg>
          Virtual
        </span>
      </div>
      
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Available after completing both exam levels
        </p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Video Conference Setup</span>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Practical Assessment</span>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Q&A Session</span>
          </div>
        </div>
      </div>
    </div>
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
