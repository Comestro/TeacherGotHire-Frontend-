import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getLevels,
  getExamSet,
  setExam,
  attemptsExam,
  postInterview,
} from "../../../features/examQuesSlice";
import {
  getPrefrence
} from "../../../features/jobProfileSlice";
import { useNavigate } from "react-router-dom";

const ExamLevels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State variables
  const [profileComplete, setProfileComplete] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); // 'online' or 'offline' for Level 2
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [showExamCard, setShowExamCard] = useState(true); // Controls visibility of the exam card
  const [interviewDateTime,setInterviewDateTime] = useState("");
  const [isPopupInterviewOpen, setPopupInterviewOpen] = useState(false);
  const [isPopupCenterOpen, setPopupCenterOpen] = useState(false);
  

  const { levels, loading, error, examSet,attempts} = useSelector((state) => state.examQues);
  const { userData } = useSelector((state) => state?.auth);
  const { basicData } = useSelector((state) => state?.personalProfile);
  const { prefrence, educationData } = useSelector(
    (state) => state?.jobProfile
  );
  const category = prefrence?.class_category;
  console.log("category checking", category);
  

  useEffect(()=>{
    dispatch(getPrefrence());
  },[])

  useEffect(() => {
    if(selectedCategory){
      const class_category_id = selectedCategory;
      dispatch(getLevels({class_category_id}));
    }
    dispatch(attemptsExam());
    if (selectedOption === "interview" && selectedSubject) {
      setPopupInterviewOpen(true);
    }
    
    // Check if the profile is complete
    setProfileComplete(checkIfProfileComplete());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, basicData, prefrence, educationData,selectedOption, selectedSubject]);

  // Function to check if the user's profile is complete
  const checkIfProfileComplete = () => {
    return basicData !== null && prefrence !== null && educationData !== null;
  };

  
  const handleClassCategory =(e)=>{
    setSelectedCategory(e.target.value)
  }
  const handleLevelChange = (e) => {
    const levelId = e.target.value;
    setSelectedLevel(levelId);
    setSelectedOption("");
    setSelectedSubject("");
    setMessage("");
    setShowExamCard(true); // Reset exam card visibility when level changes
  };

  const handleOptionChange = (e) => {
    const option = e.target.value;
    setSelectedOption(option);
      setSelectedSubject("");
      setMessage("");
      setShowExamCard(true); // Reset exam card visibility when option changes
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    // Ensure the exam card is shown upon subject selection
    console.log("selectcat",selectedCategory)
    if (selectedOption === "online"|| selectedOption === "offline" || selectedLevel == 1) {
      setShowExamCard(true);
      dispatch(
        getExamSet({
          level_id: selectedLevel,
          subject_id: subjectId,
          type: selectedOption, // Include option for Level 2
          class_category_id: selectedCategory,
        })
      );
    }

    // Fetch exam set based on level, option, and subject
  };

  const  handleInterview =(e)=>{
    e.preventDefault();
   console.log("selectcat",selectedCategory)
    dispatch(
      postInterview({
        subject: selectedSubject,
        class_category: selectedCategory,
        time:interviewDateTime,
      }) 
     );
     setPopupInterviewOpen(false);
  }

  const closePopup = () => {
    setPopupInterviewOpen(false);
  };
  const guideline = (exam) => {
    dispatch(setExam(exam));

    console.log("exam",exam);

    // Check if the user has any qualified attempts for Level 2
    const hasQualifiedAttempt = attempts?.some(
      ({ exam, isqualified }) => exam?.level?.id === 2 && isqualified
    );

    if (selectedOption === "offline" && hasQualifiedAttempt) {
      // Get the user_id from state or props
      const user_id = userData.id;
      const exam_id = attempts?.find(
        ({ exam, isqualified }) => exam?.level?.id === 2 && isqualified
      )?.exam?.id;
     
      // dispatch(generatePasskey({ user_id, exam_id }));
      navigate("/exam-mode");
    } else {
      navigate("/exam");
    }
  };

  // Available levels based on data
  const availableLevels = levels || [];

  //Get subjects based on selected level and option
  let filteredSubjects = [];
  if (selectedLevel && levels) {
    const selectedLevelData = levels.find(
      (level) => level.level_id === parseInt(selectedLevel)
    );
    if (selectedLevelData) {
      if (selectedLevelData.level_id === 2 && selectedOption) {
        // For Level 2, use 'subjects_by_type'
        filteredSubjects =
          selectedLevelData.subjects_by_type?.[selectedOption] || [];
      } else {
        // For Level 1 or other levels without options, use 'subjects'
        filteredSubjects = selectedLevelData.subjects || [];
      }
    }
  }

  // Handler to close the exam card
  const handleCloseExamCard = () => {
    setSelectedSubject("");
    setShowExamCard(false);
  };

  // Determine if a level should be disabled based on profile completion
  const isLevelDisabled = (levelId) => {
    if (levelId === "1") return false; // Level 1 is always accessible
    return !profileComplete;
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Loading and Error States */}
      {/* {loading && <div className="text-blue-500">Loading levels...</div>} */}
      {/* {error && <div className="text-red-500">{error}</div>}  */}

      {/* Always show Level Selection */}
      <div className="flex flex-col w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mb-4">
        {/* Class Category selection */}
        <div className="lex flex-col mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Class Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleClassCategory}
            className="border border-gray-300 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            <option value="">Select a category</option>
            {category && category?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Level Selection */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Level
          </label>
          <select
            value={selectedLevel}
            onChange={handleLevelChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">-- Select Level --</option>
            {availableLevels.map((level) => (
              <option
                key={level.level_id}
                value={level.level_id}
                disabled={isLevelDisabled(level.level_id)}
                title={
                  level.level_id === "1"
                    ? "Accessible to all users"
                    : !profileComplete
                    ? "Complete your profile to access this level"
                    : ""
                }
              >
                {level.level_id === "1"
                  ? `Level ${level.level_id}`
                  : profileComplete
                  ? `Level ${level.level_id}`
                  : `Level ${level.level_id} (Locked)`}
              </option>
            ))}
          </select>
          {/* Show message if Level is selected but locked */}
          {selectedLevel && isLevelDisabled(selectedLevel) && (
            <p className="text-red-500 mt-2">
              Please complete your profile to access Level {selectedLevel}.
            </p>
          )}
        </div>

        {/* Exam Mode Selection (for Level 2) */}
        {selectedLevel === "2" && (
          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Select Exam Mode
            </label>
            <select
              value={selectedOption}
              onChange={handleOptionChange}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={isLevelDisabled(selectedLevel)}
            >
              <option value="">-- Select Exam Mode --</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="interview">Interview</option>
            </select>
            {/* Show message if Exam Mode is selected but locked */}
            {selectedLevel === "2" && isLevelDisabled(selectedLevel) && (
              <p className="text-red-500 mt-2">
                Please complete your profile to select exam mode.
              </p>
            )}
          </div>
        )}

        {/* Subject Selection */}
        {(selectedLevel === "1" ||
          (selectedLevel === "2" && selectedOption)) && (
          <div className="flex flex-col">
            <label className="block text-gray-700 font-semibold mb-2">
              Select Subject
            </label>
            {filteredSubjects.length > 0 ? (
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={
                  isLevelDisabled(selectedLevel) ||
                  (selectedLevel === "2" && !selectedOption)
                }
              >
                <option value="">-- Select Subject --</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-red-500">
               First complete your Online Exam
              </p>
            )}
            {/* Show message if Subject is selected but locked */}
            {selectedLevel !== "1" && isLevelDisabled(selectedLevel) && (
              <p className="text-red-500 mt-2">
                Please complete your profile to select a subject.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Display Exam Card */}
      {selectedSubject &&
        examSet &&
        showExamCard &&
        selectedOption != "interview" && (
          <div className="w-full max-w-3xl mt-6 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseExamCard}
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
              aria-label="Close Exam Card"
            >
              &#10005; {/* Unicode for 'X' */}
            </button>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* For Level 1 */}
              {selectedLevel === "1" && (
                <div
                  className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                  onClick={() => guideline(examSet)}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {examSet.name}
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-semibold">Subject:</span>{" "}
                    {examSet?.subject?.subject_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Level:</span>{" "}
                    {examSet?.level?.id}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Type:</span> {examSet?.type}
                  </p>
                </div>
              )}

              {/* For Level 2 */}
              {selectedLevel === "2" && (
                <>
                  {/* Online Exam */}
                  {selectedOption === "online" && examSet?.online_exam ? (
                    <div
                      className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition relative"
                      onClick={() => guideline(examSet.online_exam)}
                    >
                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleCloseExamCard();
                        }}
                        className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close Exam Card"
                      >
                        &#10005; {/* Unicode for 'X' */}
                      </button>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {examSet.online_exam.name}
                      </h3>
                      <p className="text-gray-600">
                        <span className="font-semibold">Subject:</span>{" "}
                        {examSet.online_exam.subject?.subject_name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Level:</span>{" "}
                        {examSet.online_exam.level?.id}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Type:</span>{" "}
                        {examSet.online_exam.type}
                      </p>
                    </div>
                  ) : null}

                  {/* Offline Exam */}
                  {selectedOption === "offline" && examSet?.offline_exam ? (
                    <div
                      className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition relative"
                      onClick={() => guideline(examSet.offline_exam)}
                    >
                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleCloseExamCard();
                        }}
                        className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
                        aria-label="Close Exam Card"
                      >
                        &#10005; {/* Unicode for 'X' */}
                      </button>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {examSet.offline_exam.name}
                      </h3>
                      <p className="text-gray-600">
                        <span className="font-semibold">Subject:</span>{" "}
                        {examSet.offline_exam.subject?.subject_name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Level:</span>{" "}
                        {examSet.offline_exam.level?.id}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Type:</span>{" "}
                        {examSet.offline_exam.type}
                      </p>
                    </div>
                  ) : (<div>First give an online Exam</div>)}

                  {/* No Exam Available Message */}
                  {selectedOption &&
                    !examSet?.online_exam &&
                    !examSet?.offline_exam && (
                      <p className="text-red-500 text-center">
                        No exam available for this selection.
                      </p>
                    )}
                </>
              )}
            </div>
          </div>
        )}

      {/* No Exam Available Message */}
      {selectedSubject && !examSet && !loading && showExamCard && (
        <p className="text-gray-600 text-center mt-6">
          No exams available for this selection.
        </p>
      )}


      {/* Backdrop */}
      {isPopupInterviewOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10"></div>}


      {/* display interview form request card */}
      {selectedSubject && selectedOption === "interview" && isPopupInterviewOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-20">
                <div className="bg-white border p-6 rounded-lg w-1/3 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Schedule Interview</h2>
                  <form action="" method="post">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Select Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full px-3 py-2 rounded border"
                        value={interviewDateTime}
                        onChange={(e) => setInterviewDateTime(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={closePopup}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Close
                      </button>
                      <input
                        type="submit"
                        onClick={handleInterview}
                        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                      />
                    </div>
                  </form>
                </div>
              </div>
            )}

      {/* Profile Incomplete Message for Levels >=2 */}
      {selectedLevel &&
        isLevelDisabled(selectedLevel) &&
        selectedLevel !== "1" && (
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center mt-4">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Please Complete Your Profile
            </h2>
            <p className="text-gray-700 mb-6">
              To access Level {selectedLevel}, please fill out your profile
              information:
              <ol className="list-decimal list-inside mt-2">
                <li>Basic Information</li>
                <li>Education Information</li>
                <li>Job Preference</li>
              </ol>
            </p>
            {/* Buttons to navigate to Profile pages */}
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => navigate("/teacher/job-profile")}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-200"
              >
                Go to Job Profile
              </button>
              <button
                onClick={() => navigate("/teacher/personal-profile")}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600 transition duration-200"
              >
                Go to Personal Profile
              </button>
            </div>
          </div>
        )}
        {/* Center Selection Page */}
        {/* { isPopupInterviewOpen && (
             <div className="popup-overlay">
              <div className="popup-content">
                <h2>Confirmation Required</h2>
                <p>Are you sure you want to proceed to offline mode?</p>
                
                <button onClick={() => setisPopupInterviewOpen(false)}>Cancel</button>
              </div>
            </div> 
        )}  */}
    </div>
  );
};

export default ExamLevels;
