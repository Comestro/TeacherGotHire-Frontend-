import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../../features/examQuesSlice";
import { 
  FiCheckCircle, 
  FiLock, 
  FiUnlock, 
  FiBarChart2, 
  FiArrowRight,
  FiAward,
  FiTrendingUp
} from "react-icons/fi";
import { motion } from "framer-motion";

const Steppers = ({ onCategoryChange, onSubjectChange, activeTab, selectedSubject }) => {
  const dispatch = useDispatch();
  const { attempts } = useSelector((state) => state.examQues);
  const { prefrence } = useSelector((state) => state.jobProfile);
  const classCategories = useSelector((state) => state.jobProfile.prefrence.class_category);
  
  // States moved from ExamManagement
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  
  // Updated level progression
  const allLevels = ["1st Level", "2nd Level Online", "2nd Level Offline", "Interview"];

  useEffect(() => {
    dispatch(attemptsExam());
  }, [dispatch]);

  // Handle filtered subjects based on active category
  useEffect(() => {
    if (activeTab !== null) {
      const subject = prefrence?.prefered_subject || [];
      const filteredSubjects = subject.filter(
        (subject) => subject.class_category === activeTab
      );
      setFilteredSubjects(filteredSubjects);
    }
  }, [activeTab, prefrence]);

  // If there are no categories available, don't render the stepper
  if (!classCategories || classCategories.length === 0) {
    return null;
  }

  // Filter attempts based on selected category and subject
  const filteredAttempts = attempts?.filter(item => 
    item.isqualified &&
    item.exam.class_category_id === activeTab &&
    item.exam.subject_id === selectedSubject
  ) || [];

  // Check for interview data in the nested interviews array
  const findInterviewData = () => {
    // Look through all attempt items for the selected subject/category
    for (const attempt of filteredAttempts) {
      if (attempt.interviews && attempt.interviews.length > 0) {
        // Find an interview with the correct subject/category and "fulfilled" status
        const interview = attempt.interviews.find(int => 
          int.subject === selectedSubject && 
          int.class_category === activeTab &&
          int.status === "fulfilled" &&
          int.grade !== null && 
          int.grade !== undefined
        );
        
        if (interview) {
          return interview;
        }
      }
    }
    return null;
  };
  
  const interviewData = findInterviewData();
  const isInterviewActive = interviewData !== null;
  const isInterviewCompleted = isInterviewActive && interviewData.status === "fulfilled";

  const calculateProgress = () => {
    if (!filteredAttempts.length) return 0;
    
    // Check for completed levels first
    let completedLevels = 0;
    
    // Check exam levels
    for (const level of allLevels.slice(0, 3)) { // First 3 levels are exams
      if (filteredAttempts.some(item => item.exam.level_name === level)) {
        completedLevels++;
      }
    }
    
    // Check interview level separately
    if (isInterviewCompleted) {
      completedLevels++;
    }
    
    return (completedLevels / allLevels.length) * 100;
  };

  const getNextStep = () => {
    const progress = calculateProgress();
    const nextStepIndex = Math.floor(progress / 25);
    if (nextStepIndex >= allLevels.length) return null;
    return allLevels[nextStepIndex];
  };

  // Get status color based on progress
  const getStatusColor = (progress) => {
    if (progress < 25) return "text-orange-600";
    if (progress < 50) return "text-blue-600";
    if (progress < 75) return "text-indigo-600";
    return "text-green-600";
  };

  const statusColor = getStatusColor(calculateProgress());
  const progressValue = Math.round(calculateProgress());
  const nextStep = getNextStep();

  const handleCategoryClick = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleSubjectClick = (subject) => {
    if (onSubjectChange) {
      onSubjectChange(subject);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FiBarChart2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Job Qualification Progress</h2>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="p-5 bg-white border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Choose a Class Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {classCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
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
                    className="h-4 w-4 text-[#3E98C7]"
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
      </div>

      {/* Subject Selection */}
      {activeTab && (
        <div className="p-5 bg-white border-b border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Select a Subject</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredSubjects?.length > 0 ? (
              filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSubject === subject.id
                      ? "border-[#3E98C7] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        selectedSubject === subject.id
                          ? "bg-[#3E98C7]"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`font-medium text-sm ${
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
      )}

      {/* Progress Section - Only show if category and subject are selected */}
      {activeTab && selectedSubject && (
        <div className="p-5 bg-white">
          <div className="space-y-6">
            {/* Progress Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Progress Indicator */}
                <div className="relative w-full md:w-1/3 p-5 flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
                  <div className="relative">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E9ECEF"
                        strokeWidth="2"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={progressValue >= 75 ? "#48BB78" : progressValue >= 50 ? "#4F46E5" : progressValue >= 25 ? "#3B82F6" : "#F97316"}
                        strokeWidth="2"
                        strokeDasharray={`${progressValue}, 100`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <text x="18" y="20.5" textAnchor="middle" fontSize="9px" fill={progressValue >= 75 ? "#48BB78" : progressValue >= 50 ? "#4F46E5" : progressValue >= 25 ? "#3B82F6" : "#F97316"} fontWeight="bold">
                        {`${progressValue}%`}
                      </text>
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-2xl font-bold ${statusColor}`}>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 font-semibold text-gray-700">Overall Progress</p>
                </div>
                
                {/* Details */}
                <div className="p-5 w-full md:w-2/3 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {filteredSubjects.find(s => s.id === selectedSubject)?.subject_name || "Subject"} Qualification Progress
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full uppercase bg-blue-100 text-blue-700 mr-2">
                      {classCategories.find(c => c.id === activeTab)?.name || "Category"}
                    </span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full uppercase bg-purple-100 text-purple-700">
                      {filteredSubjects.find(s => s.id === selectedSubject)?.subject_name || "Subject"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className={`text-sm font-semibold ${statusColor}`}>{progressValue}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="h-2 rounded-full"
                        style={{ 
                          background: progressValue >= 75 
                            ? "linear-gradient(90deg, #48BB78 0%, #38A169 100%)" 
                            : progressValue >= 50 
                            ? "linear-gradient(90deg, #4F46E5 0%, #4338CA 100%)" 
                            : progressValue >= 25 
                            ? "linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)" 
                            : "linear-gradient(90deg, #F97316 0%, #EA580C 100%)"
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValue}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Status</div>
                      <div className="text-sm font-medium mt-1">
                        {progressValue < 25 ? "Just Started" 
                          : progressValue < 50 ? "In Progress" 
                          : progressValue < 75 ? "Almost There" 
                          : progressValue < 100 ? "Nearly Complete" 
                          : "Certification Completed"}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Next Step</div>
                      <div className="text-sm font-medium mt-1 whitespace-nowrap">
                        {nextStep || "Completed All Steps"}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Completed</div>
                      <div className="text-sm font-medium mt-1">
                        {Math.floor(progressValue / 25)} of {allLevels.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {allLevels.map((level, index) => {
                const isCompleted = level === "Interview" 
                  ? isInterviewCompleted 
                  : filteredAttempts.some(item => item.exam.level_name === level);
                
                // Special handling for interview level
                const isInterviewLevel = level === "Interview";
                const isActive = isInterviewLevel 
                  ? (isInterviewActive && !isInterviewCompleted) || index <= Math.floor(calculateProgress() / 25)
                  : index <= Math.floor(calculateProgress() / 25);
                  
                const isNext = index === Math.floor(calculateProgress() / 25) && !isCompleted;

                return (
                  <div 
                    key={level} 
                    className={`
                      relative rounded-lg overflow-hidden transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md
                      ${isCompleted ? 'bg-green-50 border border-green-200' : 
                       isNext ? 'bg-blue-50 border border-blue-200' : 
                       isActive ? 'bg-indigo-50 border border-indigo-200' : 
                       'bg-gray-50 border border-gray-200'}
                    `}
                  >
                    {isNext && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                        NEXT
                      </div>
                    )}
                    
                    {isInterviewLevel && isInterviewActive && !isInterviewCompleted && (
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                        ACTIVE
                      </div>
                    )}
                    
                    {isInterviewLevel && isInterviewCompleted && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                        GRADE: {interviewData.grade}
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mr-3
                          ${isCompleted ? 'bg-green-500 text-white' : 
                           (isInterviewLevel && isInterviewActive && !isInterviewCompleted) ? 'bg-purple-500 text-white' :
                           isNext ? 'bg-blue-500 text-white' :
                           isActive ? 'bg-indigo-500 text-white' : 
                           'bg-gray-300 text-gray-500'}
                        `}>
                          {isCompleted ? (
                            <FiCheckCircle className="w-5 h-5" />
                          ) : (isInterviewLevel && isInterviewActive && !isInterviewCompleted) || isNext || isActive ? (
                            <FiUnlock className="w-5 h-5" />
                          ) : (
                            <FiLock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className={`
                            text-sm font-semibold
                            ${isCompleted ? 'text-green-700' : 
                             (isInterviewLevel && isInterviewActive && !isInterviewCompleted) ? 'text-purple-700' :
                             isNext ? 'text-blue-700' :
                             isActive ? 'text-indigo-700' : 
                             'text-gray-500'}
                          `}>
                            {level}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Stage {index + 1} of {allLevels.length}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`
                        text-xs px-2 py-1 rounded-full w-full text-center font-medium
                        ${isCompleted ? 'bg-green-100 text-green-700' : 
                         (isInterviewLevel && isInterviewActive && !isInterviewCompleted) ? 'bg-purple-100 text-purple-700' :
                         isNext ? 'bg-blue-100 text-blue-700' :
                         isActive ? 'bg-indigo-100 text-indigo-700' : 
                         'bg-gray-100 text-gray-500'}
                      `}>
                        {isCompleted ? 'Completed' : 
                         (isInterviewLevel && isInterviewActive && !isInterviewCompleted) ? 'Active' :
                         isNext ? 'Current' :
                         isActive ? 'Available' : 'Locked'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Info Card */}
            {getNextStep() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white p-2 rounded-full mr-3">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Next Step: {nextStep}</h4>
                    <p className="text-sm text-gray-600">Continue your job qualification process</p>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center">
                  Continue <FiArrowRight className="ml-1" />
                </button>
              </div>
            )}
            
            {progressValue === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-2 rounded-full mr-3">
                    <FiAward className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Qualification Complete!</h4>
                    <p className="text-sm text-gray-600">You've successfully completed all qualification stages</p>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Steppers;
