
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getLevels,
  getExamSet,
  setExam,
  attemptsExam,
  generatePasskey,
} from '../../../features/examQuesSlice';
import { useNavigate } from 'react-router-dom';

const ExamLevels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State variables
  const [profileComplete, setProfileComplete] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // 'online' or 'offline' for Level 2
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState('');

  const { levels, loading, error, examSet, attempts } = useSelector(
    (state) => state.examQues
  );

  const {userData} = useSelector((state)=>state?.auth)

  useEffect(() => {
    dispatch(getLevels());
    dispatch(attemptsExam());
    // Assuming there's an action or method to check if profile is complete
    // Replace this with your actual implementation
     setProfileComplete(checkIfProfileComplete());
  }, [dispatch]);

  // Function to check if the user's profile is complete
  const checkIfProfileComplete = () => {
    // Implement your logic to check profile completeness
    // For demonstration, let's assume the profile is complete
    return true;
  };


  const handleLevelClick = (levelId) => {
    setSelectedLevel(levelId);
    setSelectedOption(null);
    setSelectedSubject(null);
    setMessage('');
  };

  const handleOptionClick = (option) => {
    console.log("option",option)
    setSelectedOption(option);
    setSelectedSubject(null);
    setMessage('');
  };

  const handleSubjectClick = (subjectId) => {
    setSelectedSubject(subjectId);

    // Fetch exam set based on level, option, and subject
    dispatch(
      getExamSet({
        level_id: selectedLevel,
        subject_id: subjectId,
        type: selectedOption, // Include option for Level 2
      })
    );
  };
  console.log("attempts",attempts)

  const guideline = (exam) => {
    dispatch(setExam(exam));
  
    // Corrected property name
    const hasQualifiedAttempt = attempts?.some(({ exam, isqualified }) =>
      exam?.level?.id === 2 && isqualified
    );

    
    console.log("hasQualifiedAttempt", hasQualifiedAttempt);

    if (selectedOption === 'offline' && hasQualifiedAttempt ) {
      // Get the user_id from state or props
      const user_id = userData.id
      console.log("attempts",attempts);
      const exam_id = attempts
    ?.find(({ exam, isqualified }) => exam?.level?.id === 2 && isqualified)
    ?.exam?.id;
    
    console.log("exam_ids", exam_id);

      dispatch(generatePasskey({ user_id, exam_id }));
      navigate('/exam-mode');
    } else {
      navigate('/exam-guide');
    }
  };
  // Available levels based on data
  const availableLevels =  levels ||  [];


  // Level IDs for levels that are not yet unlocked (for displaying locks)
  const lockedLevelIds = [];
  if (!profileComplete) {
    lockedLevelIds.push(1);
  } else {
    // If Level 1 is available but Level 2 is not in levels data, consider it locked
    const levelIdsInData = availableLevels.map((level) => level.level_id);
    if (!levelIdsInData.includes(2)) {
      lockedLevelIds.push(2);
    }
  }

  // Get subjects based on selected level and option
  let filteredSubjects = [];
  if (selectedLevel && levels) {
    const selectedLevelData = levels.find(
      (level) => level.level_id === selectedLevel
    );
    if (selectedLevelData) {
      if (selectedLevel === 2 && selectedOption) {
        // For Level 2, use 'subjects_by_type'
        filteredSubjects =
          selectedLevelData.subjects_by_type?.[selectedOption] || [];
      } else {
        // For Level 1, use 'subjects'
        filteredSubjects = selectedLevelData.subjects || [];
      }
    }
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* Loading and Error States */}
      {loading && <div className="text-blue-500">Loading levels...</div>}
      {/* {error && <div className="text-red-500">{error}</div>} */}

      {!profileComplete ? (
        // Profile Incomplete Message
        <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Please Complete Your Profile
          </h2>
          <p className="text-gray-700 mb-6">
            To unlock Level 1, please fill out your profile information.
          </p>
          {/* Button to navigate to Profile page */}
          <button
            // onClick={goToProfile}
            className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            Go to Profile
          </button>
        </div>
      ) : (
        <>
          {/* Level Unlock Messages */}
          {availableLevels.find((lvl) => lvl.level_id === 1) && (
            <div className="text-green-600 text-xl mb-4">
             
            </div>
          )}
          {availableLevels.find((lvl) => lvl.level_id === 2) && (
            <div className="text-green-600 text-xl mb-4">
              Both Levels Are Unlocked!
            </div>
          )}

          {/* Level Cards */}
          <div className="flex items-center justify-center space-x-8 w-full max-w-3xl my-6">
            {/* Level 1 Card */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  availableLevels.find((lvl) => lvl.level_id === 1)
                    ? 'bg-green-500'
                    : 'bg-red-500'
                } text-white text-2xl cursor-pointer`}
                onClick={() => handleLevelClick(1)}
                title={`Select Level 1`}
              >
                {availableLevels.find((lvl) => lvl.level_id === 1)
                  ? '🔓'
                  : '🔒'}
              </div>
              <p className="text-gray-700 mt-2 font-medium">Level 1</p>
            </div>
            {/* Level 2 Card */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg ${
                  availableLevels.find((lvl) => lvl.level_id === 2)
                    ? 'bg-green-500'
                    : 'bg-red-500'
                } text-white text-2xl ${
                  availableLevels.find((lvl) => lvl.level_id === 2)
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                onClick={() =>
                  availableLevels.find((lvl) => lvl.level_id === 2)
                    ? handleLevelClick(2)
                    : null
                }
                title={`Select Level 2`}
              >
                {availableLevels.find((lvl) => lvl.level_id === 2)
                  ? '🔓'
                  : '🔒'}
              </div>
              <p className="text-gray-700 mt-2 font-medium">Level 2</p>
            </div>
          </div>

          {/* Display Messages */}
          {message && <div className="text-red-500 mt-2">{message}</div>}

          {/* Subjects for Level 1 */}
          {selectedLevel === 1 && (
            <div className="w-full max-w-3xl">
              <h2 className="text-xl font-semibold mb-4">
                Subjects for Level 1
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
                      <div className="text-center font-semibold">
                        {subject.subject_name}
                      </div>
                    </button>
                  ))
                ) : (
                  <div>No subjects available for this level.</div>
                )}
              </div>
            </div>
          )}


            {selectedLevel === 2 && (
              <div className="w-full max-w-3xl">
                <h2 className="text-xl font-semibold mb-4">
                  Select an Option for Level 2
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Determine availability of options */}
                  {(() => {
                    const level2Data = availableLevels.find(
                      (level) => level.level_id === 2
                    );

                    const isOnlineAvailable =
                      level2Data &&
                      level2Data.subjects_by_type &&
                      level2Data.subjects_by_type.online &&
                      level2Data.subjects_by_type.online.length > 0;

                    const isOfflineAvailable =
                      level2Data &&
                      level2Data.subjects_by_type &&
                      level2Data.subjects_by_type.offline &&
                      level2Data.subjects_by_type.offline.length > 0;

                    return (
                      <>
                        {/* Online Option */}
                        {isOnlineAvailable ? (
                          <button
                            onClick={() => handleOptionClick('online')}
                            className={`cursor-pointer px-4 py-2 rounded-md border
                              ${
                                selectedOption === 'online'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-800 border-gray-300'
                              } transition duration-200 ease-in-out transform hover:scale-105`}
                          >
                            <div className="text-center font-semibold">Online</div>
                          </button>
                        ) : (
                          <div className="opacity-50 cursor-not-allowed px-4 py-2 rounded-md border bg-gray-200 text-gray-500">
                            <div className="text-center font-semibold">Online</div>
                          </div>
                        )}

                        {/* Offline Option */}
                        {isOfflineAvailable ? (
                          <button
                            onClick={() => handleOptionClick('offline')}
                            className={`cursor-pointer px-4 py-2 rounded-md border
                              ${
                                selectedOption === 'offline'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-800 border-gray-300'
                              } transition duration-200 ease-in-out transform hover:scale-105`}
                          >
                            <div className="text-center font-semibold">Offline</div>
                          </button>
                        ) : (
                          <div className="opacity-50 cursor-not-allowed px-4 py-2 rounded-md border bg-gray-200 text-gray-500">
                            <div className="text-center font-semibold">Offline</div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          {/* Subjects List for Level 2 Option */}
          {selectedLevel === 2 && selectedOption && (
            <div className="w-full max-w-3xl">
              <h2 className="text-xl font-semibold mb-4">
                Subjects for Level 2 -{' '}
                {selectedOption.charAt(0).toUpperCase() +
                  selectedOption.slice(1)}
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
                      <div className="text-center font-semibold">
                        {subject.subject_name}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-red-500">
                    {selectedOption === 'offline'
                      ? 'No subjects available. Pass the Level 2 Online Exam to unlock.'
                      : 'No subjects available for this option.'}
                  </div>
                )}
              </div>
            </div>
          )}

           {/* Exam Card for Level 1*/}
           {selectedLevel === 1 && selectedSubject && (
            <div className="w-full max-w-3xl mt-6">
              {examSet ? (
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                    onClick={() => guideline(examSet)}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {examSet.name}
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-semibold">Subject:</span>{' '}
                      {examSet?.subject?.subject_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Level:</span>{' '}
                      {examSet?.level?.id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Type:</span>{' '}
                      {examSet?.type}
                    </p>
                    {selectedOption && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Option:</span>{' '}
                        {selectedOption.charAt(0).toUpperCase() +
                          selectedOption.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No exams available</p>
              )}
            </div>
          )}

          {/* Exam Card Rendering for level 1*/}
          {selectedLevel === 2 && selectedSubject && (
            <div className="w-full max-w-3xl mt-6">
              {examSet ? (
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                    onClick={() => guideline(examSet.online_exam)}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {examSet?.online_exam?.name}
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-semibold">Subject:</span>{' '}
                      {examSet?.online_exam?.subject?.subject_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Level:</span>{' '}
                      {examSet?.online_exam?.level?.id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Type:</span>{' '}
                      {examSet?.online_exam?.type}
                    </p>
                    {selectedOption && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Option:</span>{' '}
                        {selectedOption.charAt(0).toUpperCase() +
                          selectedOption.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No exams available</p>
              )}
            </div>
          )}
          {selectedLevel === 2 && selectedSubject   &&   (
            <div className="w-full max-w-3xl mt-6">
              {examSet ? (
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                    onClick={() => guideline(examSet.offline_exam)}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {examSet?.offline_exam?.name}
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-semibold">Subject:</span>{' '}
                      {examSet?.offline_exam?.subject?.subject_name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Level:</span>{' '}
                      {examSet?.offline_exam?.level?.id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Type:</span>{' '}
                      {examSet?.offline_exam?.type}
                    </p>
                    {selectedOption && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Option:</span>{' '}
                        {selectedOption.charAt(0).toUpperCase() +
                          selectedOption.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No exams available</p>
              )}
            </div>
          )}

         
        </>
      )}

      
    </div>
  );
};

export default ExamLevels;

