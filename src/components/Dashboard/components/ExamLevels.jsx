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
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedOption, setSelectedOption] = useState(''); // 'online' or 'offline' for Level 2
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');

  const { levels, loading, error, examSet, attempts } = useSelector(
    (state) => state.examQues
  );

  
  const {userData} =useSelector((state)=>state?.auth)
  const { basicData} = useSelector((state) => state?.personalProfile);
  const { prefrence,educationData} = useSelector((state) => state?.personalProfile);

  useEffect(() => {
    dispatch(getLevels());
    dispatch(attemptsExam());
    // Implement your logic to check if profile is complete
    setProfileComplete(checkIfProfileComplete());
  }, [dispatch]);

  // Function to check if the user's profile is complete
  const checkIfProfileComplete = () => {
   if(basicData !== null && prefrence !== null && educationData !== null){
    return true;
   }else{
    return false;
   }
  };

  const handleLevelChange = (e) => {
    const levelId = e.target.value;
    setSelectedLevel(levelId);
    setSelectedOption('');
    setSelectedSubject('');
    setMessage('');
  };

  const handleOptionChange = (e) => {
    const option = e.target.value;
    setSelectedOption(option);
    setSelectedSubject('');
    setMessage('');
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
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

  const guideline = (exam) => {
    dispatch(setExam(exam));

    // Corrected property name
    const hasQualifiedAttempt = attempts?.some(
      ({ exam, isqualified }) => exam?.level?.id === 2 && isqualified
    );

    if (selectedOption === 'offline' && hasQualifiedAttempt) {
      // Get the user_id from state or props
      const user_id = userData.id;
      const exam_id = attempts?.find(
        ({ exam, isqualified }) => exam?.level?.id === 2 && isqualified
      )?.exam?.id;

      dispatch(generatePasskey({ user_id, exam_id }));
      navigate('/exam-mode');
    } else {
      navigate('/exam');
    }
  };

  // Find the passed Offline Exam attempt for Level 2
  const passedOfflineAttempt = attempts?.find(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.type === 'offline' &&
      attempt.exam?.level?.id === 2
  );

  // Check if the user has passed the Offline Exam
  const passedOfflineExam = !!passedOfflineAttempt;

  // Available levels based on data
  const availableLevels = levels || [];

  // Get subjects based on selected level and option
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

      {/* If user has passed Offline Exam, show congratulatory card */}
      {passedOfflineAttempt && (
        <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center mb-4">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Congratulations!
          </h2>
          <p className="text-gray-700 mb-6">
            Now you are eligible to be a{' '}
            <strong>
              {passedOfflineAttempt.exam?.subject?.subject_name} Teacher.
            </strong>
          </p>
          {/* Display the exam result */}
          <div className="text-gray-700">
            <p>
              <strong>Exam Name:</strong> {passedOfflineAttempt.exam.name}
            </p>
            <p>
              <strong>Score:</strong> {passedOfflineAttempt.correct_answer}
            </p>
            <p>
              <strong>Total Marks:</strong>{' '}
              {passedOfflineAttempt.correct_answer +
                passedOfflineAttempt.is_unanswered}
            </p>
            {/* Add any other exam result data you want to display */}
          </div>
        </div>
      )}

      {!profileComplete ? (
        // Profile Incomplete Message
        <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Please Complete Your Profile
          </h2>
          <p className="text-gray-700 mb-6">
            To unlock Level 1, please fill out your profile information.
            1.Basic Imformation
            2.Education Information
            3.Job Prefrence
          </p>
          {/* Button to navigate to Profile page */}
          <div className='flex space-x-3'>
          <button
            navigate='/teacher/job-profile'
            className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            Go Job Profile
          </button>
          <button
            navigate='/teacher/personal-profile'
            className="w-full bg-blue-500 text-white py-2 rounded shadow hover:bg-blue-600 transition duration-200"
          >
            Go to Personal Profile
          </button>
          </div>
          
        </div>
      ) : (
        <>
          {/* Column-wise Layout */}
          <div className="flex flex-row justify-center items-start space-x-8 w-full max-w-4xl">
            {/* Level Selection */}
            <div className="flex flex-col w-1/3">
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
                  <option key={level.level_id} value={level.level_id}>
                    Level {level.level_id}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Mode Selection (for Level 2) */}
            {selectedLevel === '2' && (
              <div className="flex flex-col w-1/3">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Exam Mode
                </label>
                <select
                  value={selectedOption}
                  onChange={handleOptionChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">-- Select Exam Mode --</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            )}

            {/* Subject Selection */}
            {((selectedLevel === '1') ||
              (selectedLevel === '2' && selectedOption)) && (
              <div className="flex flex-col w-1/3">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Subject
                </label>
                {filteredSubjects.length > 0 ? (
                  <select
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">-- Select Subject --</option>
                    {filteredSubjects.map((subject) => (
                      <option
                        key={subject.subject_id}
                        value={subject.subject_id}
                      >
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-500">
                    No subjects available for this selection.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Display Exam Card */}
          {selectedSubject && examSet && (
            <div className="w-full max-w-3xl mt-6">
              <div className="grid grid-cols-1 gap-4">
                {/* For Level 1 */}
                {selectedLevel === '1' && (
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
                  </div>
                )}

                {/* For Level 2 */}
                {selectedLevel === '2' && (
                  <>
                    {/* Online Exam */}
                    {selectedOption === 'online' && examSet?.online_exam ? (
                      <div
                        className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                        onClick={() => guideline(examSet.online_exam)}
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {examSet.online_exam.name}
                        </h3>
                        <p className="text-gray-600">
                          <span className="font-semibold">Subject:</span>{' '}
                          {examSet.online_exam.subject?.subject_name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Level:</span>{' '}
                          {examSet.online_exam.level?.id}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Type:</span>{' '}
                          {examSet.online_exam.type}
                        </p>
                      </div>
                    ) : null}

                    {/* Offline Exam */}
                    {selectedOption === 'offline' && examSet?.offline_exam ? (
                      <div
                        className="border border-gray-300 rounded-lg shadow-lg p-5 bg-white cursor-pointer hover:shadow-xl transition"
                        onClick={() => guideline(examSet.offline_exam)}
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {examSet.offline_exam.name}
                        </h3>
                        <p className="text-gray-600">
                          <span className="font-semibold">Subject:</span>{' '}
                          {examSet.offline_exam.subject?.subject_name}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Level:</span>{' '}
                          {examSet.offline_exam.level?.id}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Type:</span>{' '}
                          {examSet.offline_exam.type}
                        </p>
                      </div>
                    ) : null}

                    {/* No Exam Available Message */}
                    {selectedOption && !examSet?.online_exam && !examSet?.offline_exam && (
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
          {selectedSubject && !examSet && !loading && (
            <p className="text-gray-600 text-center mt-6">
              No exams available for this selection.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ExamLevels;