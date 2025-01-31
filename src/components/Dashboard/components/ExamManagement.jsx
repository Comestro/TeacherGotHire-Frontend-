import { useEffect, useState } from "react";
import { FaLock, FaLockOpen, FaBookOpen } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import {
  getExamSet,
  setExam,
  postInterview,
  getAllCenterUser,
} from "../../../features/examQuesSlice";
import { useActionData, useNavigate } from "react-router-dom";

export default function ExamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );
  const subjects = useSelector(
    (state) => state.jobProfile.prefrence.prefered_subject
  );
  const { examSet } = useSelector((state) => state.examQues);
  const { attempts,allcenter } = useSelector((state) => state.examQues );

  console.log("examSet", examSet);

  const [activeTab, setActiveTab] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [approvedDateTime, setApprovedDateTime] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [centerSelectionPopup,setCenterSelectionPopup] = useState(false);


  useEffect(()=>{
    dispatch( getAllCenterUser());
  },[])

  // Handle category switch
  const handleCategoryChange = (categoryId) => {
    setActiveTab(categoryId);
    setSelectedSubject(""); // Reset subject on category change
  };

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

  const handleOfflineExam = (exam) => {
    dispatch(setExam(exam));
    setCenterSelectionPopup(true);
    
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
   const handleGeneratePasskey = async(event) => {
      event.preventDefault();
      if (selectedCenterId  && pass_exam_id) {
        console.log("selectedCenterId",selectedCenterId)
        dispatch(generatePasskey({ user_id, exam_id,center_id:selectedCenterId}));
        navigate('/teacher');
        setCenterSelectionPopup(false);
      } else {
        alert("Please select a center before submitting.");
      }
    };

  return (
    <>
      <div className=" mx-auto p-6 bg-white rounded-lg border">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#3E98C7] to-black rounded-xl p-6 shadow">
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

        {/* Modern Tab Switching */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6 -mb-px overflow-x-auto scrollbar-hide">
            {classCategories && classCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
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
        {subjects && subjects.length > 0 && (
          <div className="space-y-4 p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-700">
                Selected Category:{" "}
                <span className="font-semibold text-gray-900">
                  {classCategories.find((cat) => cat.id === activeTab)?.name}
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
                    {subjects.map((subject, index) => (
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
                Choose a subject from the dropdown above to view available exams
                and interview options for your selected class category
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
                    <span className="text-sm text-gray-500">Basic Level</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                    {examSet[0].subject.subject_name} Fundamentals{" "}
                    {examSet[0].name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      • {examSet[0].questions.length} Multiple Choice Questions
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
                    {examSet[1].subject.subject_name} Advanced {examSet[1].name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      • {examSet[1].questions.length} Multiple Choice Questions
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
                    {examSet[2].subject.subject_name} Advanced {examSet[2].name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      • {examSet[2].questions.length} Multiple Choice Questions
                    </p>
                    <p>• {examSet[2].duration} Minute Duration</p>
                    <p>• {examSet[2].total_marks} Total Marks</p>
                    <p>• Basic Concepts Assessment</p>
                  </div>
                  <button
                    onClick={() => {
                      handleOfflineExam(examSet[2]);
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
                  ) : !isApproved ? (
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
                        <p>• Your selected date and time: {selectedDateTime}</p>
                        <p>• Admin will confirm your request soon.</p>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                          Thank you for submitting your request. We will notify
                          you once it is approved.
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
                        <span className="text-sm text-gray-500">Confirmed</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        Interview Scheduled
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Your approved date and time: {approvedDateTime}</p>
                        <p>
                          • Please ensure you are available at the scheduled
                          time.
                        </p>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                          Your interview has been confirmed. We look forward to
                          seeing you!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ):(<div className="min-w-64">
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
              </div>)}
            </>
          )}

          {centerSelectionPopup && 
            <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <form onSubmit={handleGeneratePasskey} className="space-y-4">
               
               <div className="flex flex-col mb-4 gap-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Exam Center
                  </label>
                  <select
                     value={selectedCenterId} // Controlled component bound to state
                     onChange={handleCenterChange}
                    className="border border-gray-300 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                  >
                    <option value="">Select Exam Center</option>
                    {allcenter && allcenter?.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.center_name}
                      </option>
                    ))}
                  </select>
                  <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  By Clicking Generate passkey for Offline Exam
                </button> 
                </div>
              </form>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}
