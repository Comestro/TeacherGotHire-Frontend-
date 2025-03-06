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
import {getPrefrence,getEducationProfile} from "../../../features/jobProfileSlice"

import { useNavigate } from "react-router-dom";

function ExamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { basicData } = useSelector((state) => state.personalProfile);
  const { prefrence} = useSelector((state) => state.jobProfile);
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );
  console.log("prefrence",prefrence)
  
  const subjects = useSelector(
    (state) => state.jobProfile.prefrence.prefered_subject
  );
  const { examSet,allcenter,attempts } = useSelector((state) => state.examQues); 
  const { userData } = useSelector((state) => state?.auth);
  const { interview,exam, passkeyresponse, verifyresponse } = useSelector(
    (state) => state.examQues
  );
  const exams = verifyresponse?.offline_exam;
  const isProfileComplete =
    ( basicData && Object.keys(basicData).length > 0 &&
    prefrence && Object.values(prefrence).some(val => 
        (Array.isArray(val) && val.length > 0) || 
        (typeof val === "object" && val !== null && Object.keys(val).length > 0) || 
        (typeof val === "string" && val.trim() !== "") 
    ));

  console.log("isProfileComplete",isProfileComplete)
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

  
  const[filteredSubjects,setFilteredSubjects]= useState([]);
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
  const [offlineSet,SetOfflineSet] = useState("");

  

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
    setShowReminderMessage(true)
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
  

  const simulateAdminApproval = () => {
    // Simulate admin approval after 3 seconds
    setTimeout(() => {
      setApprovedDateTime(selectedDateTime); // Use the selected date/time as approved
      setIsApproved(true);
    }, 3000);
  };

  const handleCenterChange = (e) => {
    setSelectedCenterId(e.target.value); // Update the selected center ID
  };
  const user_id = userData.id;
  // const pass_exam_id = attempts?.find(
  //   ({ exam, isqualified }) => exam?.level?.id === 2 && isqualified
  // )?.exam?.id;

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
    dispatch(verifyPasscode({user_id,exam_id:offlineSet,passcode}))
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
         {
          attempts && (<div className="col-span-3">
          <Steppers />
          </div>
        ) }
      

        {isProfileComplete ? (
          <>
            {" "}
            {/* Modern Tab Switching */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex gap-6 -mb-px overflow-x-auto scrollbar-hide">
                {classCategories &&
                  classCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`group relative min-w-fit pb-4 px-1 text-sm font-medium transition-all duration-300 ${
                        activeTab === category.id
                          ? "text-[#3E98C7]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {category.name}
                      {activeTab === category.id && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#3E98C7] transition-all duration-300 origin-left scale-x-100" />
                      )}
                      {!activeTab === category.id && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#3E98C7] transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100 group-hover:w-full" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
            {/* Subject Selection */}
            {classCategories && classCategories.length > 0 && (
              <div className="space-y-4 p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-gray-700">
                    Selected Category:{" "}
                    <span className="font-semibold text-gray-900">
                      {
                        classCategories.find((cat) => cat.id === activeTab)
                          ?.name
                      }
                    </span>
                  </h3>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="block text-sm font-medium text-gray-600">
                      Choose Subject
                    </label>
                    <div className="relative flex-1 w-full">
                      <select
                        className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white 
              focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none 
              transition-all cursor-pointer text-gray-700"
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                      >
                        <option value="" className="text-gray-400">
                          Select a subject
                        </option>
                        {filteredSubjects?.map((subject, index) => (
                          <option key={index} value={subject.id}>
                            {subject.subject_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
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
                  {examSet[0] && (
                    <div className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                          Level 1
                        </span>
                        <span className="text-sm text-gray-500">
                          Basic Level
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        {examSet[0].subject.subject_name} Fundamentals{" "}
                        {examSet[0].name}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          • {examSet[0].questions.length} Multiple Choice
                          Questions
                        </p>
                        <p>• {examSet[0].duration} Minute Duration</p>
                        <p>• {examSet[0].total_marks} Total Marks</p>
                        <p>• Basic Concepts Assessment</p>
                      </div>

                      <button
                        onClick={() => {
                          handleExam(examSet[0]);
                        }}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-300"
                      >
                        <FaLockOpen className="w-5 h-5" />
                        Start Level 1 Exam
                      </button>
                    </div>
                  )}

                  {examSet[1] ? (
                    <div className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                          Level 2
                        </span>
                        <span className="text-sm text-gray-500">
                          Advanced Level
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        {examSet[1].subject.subject_name} Advanced{" "}
                        {examSet[1].name}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          • {examSet[1].questions.length} Multiple Choice
                          Questions
                        </p>
                        <p>• {examSet[1].duration} Minute Duration</p>
                        <p>• {examSet[1].total_marks} Total Marks</p>
                        <p>• Basic Concepts Assessment</p>
                      </div>
                      <button
                        onClick={() => {
                          handleExam(examSet[1]);
                        }}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-300"
                      >
                        <FaLockOpen className="w-5 h-5" />
                        Start Level 2 Exam
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Level 2 Locked Card */}
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
                    </>
                  )}

                  {examSet[2] ? (
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
                                  handleGeneratePasskey(event, examSet[2].id)
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
                        // Start Exam Card
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                                Level 2
                              </span>
                              <span className="text-sm text-gray-500">
                                Advanced Level
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">
                              {examSet[2].subject.subject_name} Advanced{" "}
                              {examSet[2].name}
                            </h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>
                                • {examSet[2].questions.length} Multiple Choice
                                Questions
                              </p>
                              <p>• {examSet[2].duration} Minute Duration</p>
                              <p>• {examSet[2].total_marks} Total Marks</p>
                              <p>• Basic Concepts Assessment</p>
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
                              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300"
                            >
                              <FaLockOpen className="w-5 h-5" />
                              Start Level 2 Exam
                            </button>
                          </div>
                        </div>
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
                  {examSet[2] ? (
                    <div className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2">
                      {!isSubmitted ? (
                        // Form to select date and time
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
                      ) : interview &&
                          interview.length > 0 ? (
                        // Pending card after submission
                        <div>
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
                              • Your selected date and time: {selectedDateTime}
                            </p>
                            <p>• Admin will confirm your request soon.</p>
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                              Thank you for submitting your request. We will
                              notify you once it is approved.
                            </p>
                          </div>
                          {/* Simulate admin approval (for demonstration purposes) */}
                          <button
                            onClick={simulateAdminApproval}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-300"
                          >
                            Simulate Admin Approval
                          </button>
                        </div>
                      ) : (
                        // Approved card after admin confirmation
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium">
                              Approved
                            </span>
                            <span className="text-sm text-gray-500">
                              Confirmed
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-3">
                            Interview Scheduled
                          </h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              • Your approved date and time: {approvedDateTime}
                            </p>
                            <p>
                              • Please ensure you are available at the scheduled
                              time.
                            </p>
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                              Your interview has been confirmed. We look forward
                              to seeing you!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="min-w-64">
                      {/* Online Interview Card */}
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
                  )}
                </>
              )}
            </div>
          </>
        ) : (
           
        <>      
        {/* Access Level 1 Message */}
        <div className="mt-6 p-5 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700 text-sm">
          <p>Please complete your profile, and complete your missing details then select a subject to access Level 1.</p>
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
                  <span className="text-sm text-gray-500">{card.subtitle}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {selectedSubject} {card.title}
                </h4>
                <div className="space-y-2 text-sm text-gray-600 opacity-75">
                  <p>• 75 Scenario-based Questions</p>
                  <p>• 90 Minute Duration</p>
                  <p>• {card.title === "Level 1" ? "Basic Concepts" : card.title === "Level 2" ? "Complex Problem Solving" : card.title === "Center" ? "Practice Sessions" : "Mock Interviews"}</p>
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
