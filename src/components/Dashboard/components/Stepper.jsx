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

  // Set initial categories
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

  // Set initial subjects when category changes
  useEffect(() => {
    if (selectedCategory && attempts) {
      const qualified = attempts.filter(item => 
        item.isqualified && item.exam.class_category_name === selectedCategory
      );
      const uniqueSubjects = [...new Set(qualified.map(item => item.exam.subjet_name))];
      setSubjects(uniqueSubjects);
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      }
    }
  }, [selectedCategory, attempts]);

  // Get filtered attempts
  const filteredAttempts = attempts?.filter(item => 
    item.isqualified &&
    item.exam.class_category_name === selectedCategory &&
    item.exam.subjet_name === selectedSubject
  ) || [];

  // Calculate progress
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
    <div className=" mx-auto p-6 bg-white mb-5 border rounded-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Exam Progress Tracker</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Class Category</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

      {selectedCategory && selectedSubject && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedSubject} Progress
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {allLevels.map((level, index) => {
              const isCompleted = filteredAttempts.some(
                item => item.exam.level_name === level
              );
              const isActive = index <= Math.floor(calculateProgress() / 25);

              return (
                <div key={level} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500 text-white' : 
                     isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <FiCheckCircle  className="w-6 h-6" />
                    ) : isActive ? (
                      <FiUnlock  className="w-6 h-6" />
                    ) : (
                      <FiLock  className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600 mt-2 text-center">{level}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center text-gray-600 text-sm">
            Completed {Math.floor(calculateProgress() / 25)} of {allLevels.length} stages
          </div>
        </div>
      )}

      {!selectedCategory && (
        <div className="text-center py-8 text-gray-500">
          Please select a class category and subject to view progress
        </div>
      )}
    </div>
  );
};

export default Steppers;