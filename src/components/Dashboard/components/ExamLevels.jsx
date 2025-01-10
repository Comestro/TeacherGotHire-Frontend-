
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLevels, getExamSet, setExam,attemptsExam } from "../../../features/examQuesSlice";
import { useNavigate } from 'react-router-dom'; 

const ExamLevels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState(''); // For user feedback

  
  const { levels, loading, error } = useSelector((state) => state.examQues);

  console.log("error",error);
  
  
  useEffect(() => {
    dispatch(getLevels());
  }, []);

  // Function to determine if a level is unlocked
  const isLevelUnlocked = (levelId) => {
    if (!levels || levels.length === 0) return false;
    // Assuming Level 1 is always unlocked
    if (levelId === 1) return true;

    // A level is unlocked if the previous level is selected or completed
    return selectedLevel >= levelId - 1;
  };

  const handleLevelClick = (level) => {
    if (isLevelUnlocked(level.level_id)) {
      setSelectedLevel(level.level_id);
      setSelectedSubject(null); // Reset subject selection
      setMessage(''); // Clear any messages
    } else {
      setMessage('This level is locked.');
    }
  };

  const handleSubjectClick = (subjectId) => {
    setSelectedSubject(subjectId);
    console.log("subjectId",subjectId)
    dispatch(getExamSet({
      level_id: selectedLevel,
      subject_id: subjectId,
    }));
    
  };
  useEffect(() => {
    dispatch(getExamSet());
    dispatch(attemptsExam());
  }, []);
  

  const { examSet } = useSelector((state) => state.examQues);
  const examAttempts = useSelector((state) => state.examQues?.attempts);

  console.log("examSet",examAttempts);

  const guideline = (exam) => {
    navigate('/exam');
    dispatch(setExam(exam));
  
    const hasQualifiedAttempt = examAttempts?.some(({ exam, isqulified }) => 
      exam?.level?.level?.id === 2 && isqulified
    );

    console.log("hasQualified",hasQualifiedAttempt)
  
    if (hasQualifiedAttempt) {
      navigate('/exam-mode');
    } else {
      navigate('/exam-guide');
    }
  };

  // Get subjects for the selected level
  const filteredSubjects = selectedLevel
    ? levels.find((level) => level.level_id === selectedLevel)?.subjects || []
    : [];

    console.log("filter",filteredSubjects)

  return (
    <div className="flex flex-col items-center p-4">
      {/* Loading and Error States */}
      {loading && <div className="text-blue-500">Loading levels...</div>}
      {/* {error && <div className="text-red-500"> {error}</div>} */}

      {/* Level Selection Message */}
      {message && <div className="text-red-500 mt-2">{message}</div>}

    
      {/* Levels Stepper */}
      {!error ? (<>
        <div className="flex items-center justify-center space-x-8 w-full max-w-3xl my-6">
        {levels && levels.length > 0 && levels.map((level, index) => (
          <React.Fragment key={level.level_id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  isLevelUnlocked(level.level_id)
                    ? selectedLevel === level.level_id
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                    : 'bg-red-500'
                } text-white text-2xl`}
                onClick={() => handleLevelClick(level)}
                style={{ cursor: isLevelUnlocked(level.level_id) ? 'pointer' : 'not-allowed' }}
                role="button"
                aria-label={isLevelUnlocked(level.level_id) ? `Select ${level.level_name}` : `${level.level_name} is locked`}
                tabIndex={0}
                title={isLevelUnlocked(level.level_id) ? 'Click to select this level' : 'This level is locked'}
              >
                {isLevelUnlocked(level.level_id) ?  "🔓" : "🔒"}
              </div>
              <p className="text-gray-700 mt-2 font-medium">{level.level_name}</p>
            </div>
            {/* Connector Line */}
            {index < levels.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  isLevelUnlocked(levels[index + 1].level_id) ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      
      {selectedLevel ? (
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">
            Subjects for {levels.find((lvl) => lvl.level_id === selectedLevel)?.level_name}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <button
                  key={subject.subject_id}
                  onClick={() => handleSubjectClick(subject.subject_id)}
                  className={`cursor-pointer px-4 py-2 rounded-md border 
                    ${
                      selectedSubject === subject.subject_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border-gray-300'
                    } transition duration-200 ease-in-out transform hover:scale-105`}
                >
                  <div className="text-center font-semibold">{subject.subject_name}</div>
                </button>
              ))
            ) : (
              <div>No subjects available for this level.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-gray-500">Please select an unlocked level to view subjects.</div>
      )}</>):(
      
         <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Level 1 is Locked
          </h2>
          <p className="text-gray-700 mb-6">
            To unlock Level 1, please fill out your Basic Information, Prefrence Informaion and education in your profile.
          </p>

          {/* Button to navigate to Profile page */}
          <button
            // onClick={goToProfile}
            className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            Personal Details
          </button>
          <button
            // onClick={goToProfile}
            className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            Job Details
          </button>
        </div>
      )}
        

      {/* Exam Card Rendering */}
      {selectedSubject && (
        <div className="w-full max-w-3xl mt-6">
          {examSet && examSet ? (
            <div className="grid grid-cols-1 gap-4">
              <div
                className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                onClick={() => guideline(examSet)}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{examSet.name}</h3>
                <p className="text-gray-600">
                  <span className="font-semibold">Subject:</span> {examSet.subject.subject_name}
                </p>
                <p className="text-gray-600">
                   <span className="font-semibold">Level:</span> {examSet.level.name}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center">No exams available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamLevels;