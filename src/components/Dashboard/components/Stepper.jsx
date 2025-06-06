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

const Steppers = () => {
  const dispatch = useDispatch();
  const { attempts } = useSelector((state) => state.examQues);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("progress"); // progress or details

  const allLevels = ["1st Level", "2nd Level Online", "2nd Level Offline", "Interview"];

  // Check if an interview is completed (has grade or fulfilled status)
  const isInterviewCompleted = (interviews) => {
    if (!interviews || !interviews.length) return false;
    return interviews.some(interview => 
      interview.grade || interview.status === "fulfilled"
    );
  };

  // Get the latest interview grade
  const getLatestInterviewGrade = (interviews) => {
    if (!interviews || !interviews.length) return null;
    const completedInterviews = interviews.filter(
      interview => interview.grade || interview.status === "fulfilled"
    );
    if (!completedInterviews.length) return null;
    
    // Sort by created_at in descending order and get the most recent
    return completedInterviews.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0].grade;
  };

  useEffect(() => {
    dispatch(attemptsExam());
  }, [dispatch]);

  useEffect(() => {
    if (attempts) {
      const qualified = attempts.filter(item => item.isqualified);
      const uniqueCategories = [...new Set(qualified.map(item => item.exam.class_category_name))];
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    }
  }, [attempts]);

  useEffect(() => {
    if (selectedCategory && attempts) {
      const qualified = attempts.filter(item => 
        item.isqualified && 
        item.exam.class_category_name === selectedCategory
      );
      const uniqueSubjects = [...new Set(qualified.map(item => item.exam.subject_name))];
      setSubjects(uniqueSubjects);
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      }
    }
  }, [selectedCategory, attempts]);

  // Hide component if no categories available
  if (categories.length === 0) {
    return null;
  }

  const filteredAttempts = attempts?.filter(item => 
    item.isqualified &&
    item.exam.class_category_name === selectedCategory &&
    item.exam.subject_name === selectedSubject
  ) || [];

  const calculateProgress = () => {
    if (!filteredAttempts.length) return 0;
    
    // Find highest completed level index
    const highestLevelIndex = Math.max(
      ...filteredAttempts.map(item => 
        allLevels.findIndex(level => level === item.exam.level_name)
      )
    );
    
    // Check if interview is completed
    let progressValue = ((highestLevelIndex + 1) / allLevels.length) * 100;
    
    // Check if we have interview data and if it's completed (final step)
    const hasInterviewData = filteredAttempts.some(item => item.interviews && item.interviews.length > 0);
    if (hasInterviewData) {
      const interviewCompleted = filteredAttempts.some(item => isInterviewCompleted(item.interviews));
      if (interviewCompleted) {
        progressValue = 100; // Interview completed, so progress is 100%
      }
    }
    
    return progressValue;
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
    return "text-cyan-600";
  };

  const statusColor = getStatusColor(calculateProgress());
  const progressValue = Math.round(calculateProgress());
  const nextStep = getNextStep();

  console.log("Filtered Attempts:", filteredAttempts);

  return (
    <div className="bg-white rounded shadow-sm overflow-hidden mb-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-700 text-white p-2 rounded-lg">
              <FiBarChart2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Job Qualification Progress</h2>
          </div>
          
          <div className="flex mt-4 md:mt-0">
            <button 
              onClick={() => setActiveTab("progress")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md 
                ${activeTab === "progress" 
                  ? "bg-cyan-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Progress
            </button>
            <button 
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md 
                ${activeTab === "details" 
                  ? "bg-cyan-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="py-5 px-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Category</label>
            <div className="relative">
              <select
                className="w-full py-2.5 pl-3 pr-10 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <div className="relative">
              <select
                className="w-full py-2.5 pl-3 pr-10 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedCategory}
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedCategory && selectedSubject && (
        <div className="p-4 bg-white">
          {activeTab === "progress" ? (
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
                      {selectedSubject} Qualification Progress
                    </h3>
                    
                    <div className="flex items-center mb-4">
                      <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full uppercase bg-blue-100 text-blue-700 mr-2">
                        {selectedCategory}
                      </span>
                      <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full uppercase bg-purple-100 text-purple-700">
                        {selectedSubject}
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
                            : "Qualified"}
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
                  const isCompleted = filteredAttempts.some(
                    item => item.exam.level_name === level
                  );
                  const isActive = index <= Math.floor(calculateProgress() / 25);
                  const isNext = index === Math.floor(calculateProgress() / 25) && !isCompleted;
                  
                  // Get interview grade if this level is "Interview" and we have interviews
                  const interviewGrade = level === "Interview" ? 
                    filteredAttempts.flatMap(item => item.interviews || [])
                      .filter(interview => interview.grade !== null || interview.status === "fulfilled")
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.grade
                    : null;

                  return (
                    <div 
                      key={level} 
                      className={`
                        relative rounded-lg overflow-hidden shadow-sm transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md
                        ${isCompleted ? 'bg-[#EBF5FA] border border-[#3E98C7]/30' : 
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
                      
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center mr-3
                            ${isCompleted ? 'bg-[#3E98C7] text-white' : 
                             isNext ? 'bg-cyan-500 text-white' :
                             isActive ? 'bg-indigo-500 text-white' : 
                             'bg-gray-300 text-gray-500'}
                          `}>
                            {isCompleted ? (
                              <FiCheckCircle className="w-5 h-5" />
                            ) : isNext || isActive ? (
                              <FiUnlock className="w-5 h-5" />
                            ) : (
                              <FiLock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className={`
                              text-sm font-semibold
                              ${isCompleted ? 'text-[#2A6F97]' : 
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
                        
                        <div className="flex justify-between items-center">
                          <div className={`
                            text-xs px-2 py-1 rounded-full text-center font-medium
                            ${isCompleted ? 'bg-[#3E98C7]/20 text-[#2A6F97]' : 'bg-blue-100 text-blue-700'}
                          `}>
                            {isCompleted ? 'Completed' : 
                             isNext ? 'Current' :
                             isActive ? (interviewGrade !== null && interviewGrade !== undefined) ? "Qualified": 'Available' : 'Locked'}
                          </div>
                          
                          {/* Show interview grade if available */}
                          {interviewGrade !== null && interviewGrade !== undefined && (
                            <div className="ml-2 flex items-center">
                              <div className="bg-[#3E98C7]/20 text-[#2A6F97] text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                                <FiAward className="w-3 h-3 mr-1" />
                                <span>{interviewGrade}/10</span>
                              </div>
                            </div>
                          )}
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
                <div className="bg-[#EBF5FA] border border-cyan-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-cyan-600 text-white p-2 rounded-full mr-3">
                      <FiAward className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Qualification Complete!</h4>
                      <p className="text-sm text-gray-600">You've successfully completed all qualification stages</p>
                    </div>
                  </div>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Details Tab Content
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="px-5 py-3">
                    <h3 className="text-lg font-semibold text-gray-800">Exam Attempt Details</h3>
                  </div>
                </div>
                
                <div className="px-5 py-3">
                  {filteredAttempts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAttempts.map((attempt, index) => (
                            <tr key={index}>
                              <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.exam.level_name}</td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(attempt.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                {attempt.score}%
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Qualified
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No qualified attempts for this subject.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-5 py-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Qualification Path</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete all four levels to qualify for {selectedSubject} teaching positions in {selectedCategory}.
                  </p>
                  
                  <div className="space-y-4">
                    {allLevels.map((level, idx) => (
                      <div key={idx} className="flex">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            filteredAttempts.some(a => a.exam.level_name === level)
                              ? "border-green-500 bg-green-100"
                              : "border-gray-300 bg-white"
                          }`}>
                            {filteredAttempts.some(a => a.exam.level_name === level) && (
                              <svg className="w-4 h-4 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a 1 1 0 01-1.414 0l-4-4a 1 1 0 011.414-1.414L8 12.586l7.293-7.293a 1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">{level}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {level === "1st Level" && "Basic qualification exam to test fundamental knowledge"}
                            {level === "2nd Level Online" && "Advanced theoretical knowledge assessment"}
                            {level === "2nd Level Offline" && "Practical application of teaching skills"}
                            {level === "Interview" && "Final evaluation by expert panel"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Interview Details Card (if interview exists) */}
              {filteredAttempts.some(item => item.interviews && item.interviews.length > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-gray-200">
                    <div className="px-5 py-3">
                      <h3 className="text-lg font-semibold text-gray-800">Interview Status</h3>
                    </div>
                  </div>
                  
                  <div className="px-5 py-4">
                    {filteredAttempts.flatMap(item => item.interviews).map((interview, idx) => {
                      const hasGrade = interview.grade !== null;
                      const isFulfilled = interview.status === "fulfilled";
                      const isCompleted = hasGrade || isFulfilled;
                      
                      return (
                        <div key={idx} className={`
                          mb-3 last:mb-0 p-4 rounded-lg border 
                          ${isCompleted ? 'bg-[#EBF5FA] border-[#3E98C7]/30' : 'bg-blue-50 border-blue-200'}
                        `}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center mr-3
                                ${isCompleted ? 'bg-[#3E98C7] text-white' : 'bg-blue-500 text-white'}
                              `}>
                                {isCompleted ? (
                                  <FiCheckCircle className="w-5 h-5" />
                                ) : (
                                  <FiUnlock className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{interview.subject} Interview</h4>
                                <p className="text-sm text-gray-600">Class Category: {interview.class_category}</p>
                                <p className="text-sm text-gray-600">
                                  Scheduled: {new Date(interview.time).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`
                                text-sm px-3 py-1 rounded-full font-medium
                                ${isCompleted ? 'bg-[#3E98C7]/20 text-[#2A6F97]' : 'bg-blue-100 text-blue-700'}
                              `}>
                                {isCompleted ? 'Completed' : 'Scheduled'}
                              </div>
                              
                              {hasGrade && (
                                <div className="mt-2 flex flex-col items-end">
                                  <span className="text-xs text-gray-500">Grade</span>
                                  <span className="text-2xl font-bold text-[#2A6F97]">{interview.grade}/10</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Steppers;