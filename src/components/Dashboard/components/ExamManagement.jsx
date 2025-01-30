import { useState } from "react";
import { FaLock, FaLockOpen, FaBookOpen } from "react-icons/fa";
import { CiLock } from "react-icons/ci";

export default function ExamManagement() {
  
  
  const classCategories = [
    {
      id: 1,
      name: "Class 1 to 5",
      subjects: ["Maths", "English", "Science"],
    },
    {
      id: 2,
      name: "Class 6 to 8",
      subjects: ["History", "Geography", "Biology"],
    },
  ];

  const [activeTab, setActiveTab] = useState(classCategories[0].id); // Default category
  const [subjects, setSubjects] = useState(classCategories[0].subjects);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Handle category switch
  const handleCategoryChange = (categoryId) => {
    setActiveTab(categoryId);
    const category = classCategories.find((cat) => cat.id === categoryId);
    setSubjects(category?.subjects || []);
    setSelectedSubject(""); // Reset subject on category change
  };

  return (
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
          {classCategories.map((category) => (
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
      {subjects.length > 0 && (
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
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="" className="text-gray-400">
                    Select a subject
                  </option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 ">
        {!selectedSubject && (
          <div className="col-span-3 bg-blue-50 p-8 rounded-2xl border border-dashed border-blue-200 text-center">
            <CiLock  className="mx-auto text-4xl text-teal-500 mb-2 size-14" />
            <h3 className="text-xl font-semibold text-teal-600 mb-2">
              Select a Subject to Begin
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Choose a subject from the dropdown above to view available exams
              and interview options for your selected class category
            </p>
          </div>
        )}

        {selectedSubject && (
          <>
            {/* Level 1 Exam Card */}
            <div className="bg-white min-w-64 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 mb-2">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-medium">
                  Level 1
                </span>
                <span className="text-sm text-gray-500">Basic Level</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                {selectedSubject} Fundamentals
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 50 Multiple Choice Questions</p>
                <p>• 60 Minute Duration</p>
                <p>• Basic Concepts Assessment</p>
              </div>
              <button className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-300">
                <FaLockOpen className="w-5 h-5" />
                Start Level 1 Exam
              </button>
            </div>

            {/* Level 2 Locked Card */}
            <div className="relative min-w-64 bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-2">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
                    Level 2
                  </span>
                  <span className="text-sm text-gray-500">Advanced Level</span>
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

            {/* Interviews Section */}
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
            <div className="min-w-64">
              {/* Offline Interview Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-gray-800">
                    Offline Interview
                  </h5>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                    In-Person
                  </span>
                </div>
                <div className="text-center py-4">
                  <FaLock className="mx-auto text-3xl text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-4">
                    Schedule after online interview completion
                  </p>
                  <div className="space-y-1 text-sm text-gray-600 text-left">
                    <p>• Classroom Observation</p>
                    <p>• Teaching Demonstration</p>
                    <p>• Panel Interview</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
