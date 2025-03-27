import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../../features/examQuesSlice";
import { FiCheckCircle, FiLock, FiUnlock } from "react-icons/fi";

const Steppers = () => {
  const dispatch = useDispatch();
  const { attempts } = useSelector((state) => state.examQues);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const allLevels = ["1st Level", "2nd Level Online", "2nd Level Offline", "Interview"];

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
    const highestLevelIndex = Math.max(
      ...filteredAttempts.map(item => 
        allLevels.findIndex(level => level === item.exam.level_name)
      )
    );
    return ((highestLevelIndex + 1) / allLevels.length) * 100;
  };

  return (
    <div className="mx-auto p-4 md:p-6 bg-white mb-5 border rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Exam Progress Tracker
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Class Category</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm appearance-none pr-10 transition-all"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm appearance-none pr-10 transition-all disabled:opacity-50 disabled:bg-gray-100"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedCategory}
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {selectedCategory && selectedSubject && (
        <div className="space-y-8">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-blue-500 text-white rounded-full p-2 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                {selectedSubject} Progress
              </h3>
              <p className="text-sm text-gray-600">Track your journey through different exam levels</p>
            </div>

            <div className="relative">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden backdrop-blur-sm bg-opacity-20">
                <div
                  className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-bold text-indigo-600">{Math.round(calculateProgress())}%</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="inline-flex items-center text-green-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {Math.floor(calculateProgress() / 25)} Completed
              </span>
              <span className="text-gray-500">
                {allLevels.length - Math.floor(calculateProgress() / 25)} Remaining
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allLevels.map((level, index) => {
              const isCompleted = filteredAttempts.some(
                item => item.exam.level_name === level
              );
              const isActive = index <= Math.floor(calculateProgress() / 25);

              return (
                <div 
                  key={level} 
                  className={`
                    flex flex-col items-center p-4 rounded-lg
                    ${isCompleted ? 'bg-green-50 border-green-200' : 
                     isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}
                    border transition-all duration-300 transform hover:scale-105
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-500 text-white' : 
                     isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}
                    transition-all duration-300
                  `}>
                    {isCompleted ? (
                      <FiCheckCircle className="w-6 h-6" />
                    ) : isActive ? (
                      <FiUnlock className="w-6 h-6" />
                    ) : (
                      <FiLock className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`
                    text-sm font-medium text-center
                    ${isCompleted ? 'text-green-700' : 
                     isActive ? 'text-blue-700' : 'text-gray-500'}
                  `}>
                    {level}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 font-medium">
              Completed {Math.floor(calculateProgress() / 25)} of {allLevels.length} stages
              <span className="ml-2 text-sm text-green-600">
                ({Math.round(calculateProgress())}% Complete)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Steppers;
