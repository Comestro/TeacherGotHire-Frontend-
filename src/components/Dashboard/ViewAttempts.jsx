import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../features/examQuesSlice";
import { MdOutlineMenuBook } from "react-icons/md";

function ViewAttempts() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredExamResults, setFilteredExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const apiOutput1 = useSelector((state) => state.examQues?.attemptCount);
  const apiOutput2 = useSelector((state) => state.examQues?.attempts);
  const dispatch = useDispatch();

  console.log('attempt count checking', apiOutput2)

  // Get unique attempted categories with better null handling
  const attemptedCategories = [
    ...new Set(
      apiOutput2
        ?.filter((result) => 
          result?.exam && 
          result.exam.class_category_name && 
          result.isqualified !== undefined
        )
        ?.map((result) => result.exam.class_category_name)
    ),
  ] || [];

  useEffect(() => {
    dispatch(attemptsExam());
  }, [dispatch]);

  useEffect(() => {
    // Add debug logs
    console.log('Raw API Output:', apiOutput2);

    // Filter results based on selected category with more lenient filtering
    const validResults = apiOutput2?.filter(result => {
      // Log invalid results to help debugging
      if (!result?.exam) {
        console.log('Invalid result:', result);
        return false;
      }
      return true;
    }) || [];

    console.log('Valid Results:', validResults);

    const results = validResults.filter((result) => {
      if (selectedCategory === "All") return true;
      return result.exam?.class_category_name === selectedCategory;
    });

    console.log('Filtered Results:', results);
    setFilteredExamResults(results);
    
    // More lenient subject extraction
    const subjectNames = [...new Set(
      results
        .filter(result => result?.exam?.subjet_name || result?.exam?.subject_name) // Check both possible property names
        .map(result => result.exam?.subjet_name || result.exam?.subject_name)
    )];

    console.log('Subject Names:', subjectNames);
    setSubjects(subjectNames);
  }, [selectedCategory, apiOutput2]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl text-[#3E98C7] font-bold flex items-center gap-2">
            <MdOutlineMenuBook className="size-7" />
            Exam Attempts
          </h1>
          
          <div className="w-full md:w-72">
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Select Class Category
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Class Categories</option>
                {attemptedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
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

        {apiOutput2?.some(result => result.exam === null) && (
          <div className="mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-yellow-700">
                  Some exam results are invalid or incomplete and have been filtered out.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h2 className="text-gray-700 font-medium">
                Showing results for: {selectedCategory === "All" ? "All Categories" : selectedCategory}
              </h2>
            </div>

            {subjects.length === 0 ? (
              <p className="px-5">No exam results found.</p>
            ) : (
              subjects.map((subject) => (
                <SubjectResults
                  key={subject}
                  subject={subject}
                  examResults={filteredExamResults}
                  apiOutput1={apiOutput1}
                  selectedCategory={selectedCategory}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getLevelOrder(levelName) {
  if (levelName.includes("1st")) return 1;
  if (levelName.includes("Online")) return 2;
  if (levelName.includes("Offline")) return 3;
  return 4; // Interview level
}

function SubjectResults({ subject, examResults, selectedCategory }) {
  const subjectResults = examResults
    ?.filter((result) => {
      const subjectMatch = result?.exam?.subject_name === subject;
      return result?.exam && subjectMatch;
    }) || [];

  // Separate exam results and interviews
  const examRows = [];
  const interviewRows = [];

  subjectResults.forEach(result => {
    const level_id = result.exam.level_id;
    const levelKey = `level${level_id}`;
    

    // Add exam result
    examRows.push({
      levelOrder: getLevelOrder(result.exam.level_name),
      levelName: result.exam.level_name,
      type: "Exam",
      classCategory: result.exam.class_category_name,
      subject: result.exam.subject_name,
      level: result.exam.level_name,
      language: result.language || 'N/A',
      status: result.isqualified ? "Passed" : "Failed",
      score: `${result.calculate_percentage}%`,
      date: new Date(result.created_at).toLocaleDateString(),
      attemptCount: result.attempt || '1',
    });

    // Add interviews if any - filter out pending interviews
    if (result.interviews?.length) {
      result.interviews
        // Filter out interviews with "pending" status
        .filter(interview => interview.status !== "pending")
        .forEach(interview => {
          if (interview.subject === subject) { // Show all non-pending interviews for matching subject
            // Determine interview level based on the parent exam
            const interviewLevel = `Interview - ${result.exam.level_name}`;
            
            interviewRows.push({
              levelOrder: 4, // Interview is always last
              levelName: "Interview",
              type: "Interview",
              classCategory: interview.class_category,
              subject: interview.subject,
              level: interviewLevel, // Set the level based on parent exam level
              language: '-',
              status: interview.status === "fulfilled" ? "Completed" : 
                     interview.status === "scheduled" ? "Scheduled" : 
                     interview.status === "requested" ? "Requested" : interview.status,
              score: interview.grade ? `${interview.grade}/10` : 'N/A',
              attemptCount: interview.attempt || '-',
              date: interview.time ? new Date(interview.time).toLocaleDateString() : '-',
              interviewDate: new Date(interview.created_at).toLocaleDateString(),
            });
          }
        });
    }
  });

  // Combine and sort all rows
  const allRows = [...examRows, ...interviewRows].sort((a, b) => {
    if (a.levelOrder !== b.levelOrder) {
      return a.levelOrder - b.levelOrder;
    }
    // For same level, sort by date descending
    return new Date(b.date) - new Date(a.date);
  });

  // Don't render anything if no valid results
  if (!allRows.length) return null;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {subject}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#E5F1F9] text-[#3E98C7] text-sm font-semibold">
                <th className="py-2 px-4 border-b">Record Type</th>
                <th className="py-2 px-4 border-b">Class Category</th>
                <th className="py-2 px-4 border-b">Subject</th>
                <th className="py-2 px-4 border-b">Level</th>
                <th className="py-2 px-4 border-b">Language</th>
                <th className="py-2 px-4 border-b">Result/Status</th>
                <th className="py-2 px-4 border-b">Score</th>
                <th className="py-2 px-4 border-b">Attempt Count</th>
                <th className="py-2 px-4 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, index) => {
                const statusColor = 
                  row.type === "Interview" 
                    ? row.status === "Completed" ? "text-green-600" 
                    : row.status === "Scheduled" ? "text-blue-600"
                    : row.status === "Requested" ? "text-yellow-600"
                    : "text-gray-600"
                    : row.status === "Passed" ? "text-green-600" : "text-red-600";
                
                return (
                <tr 
                  key={index} 
                  className={`text-sm ${
                    row.type === "Interview" ? "bg-gray-50" : ""
                  }`}
                >
                  <td className="py-2 px-4 border-b text-center font-medium">
                    {row.type}
                  </td>
                  <td className="py-2 px-4 border-b text-center">{row.classCategory}</td>
                  <td className="py-2 px-4 border-b text-center">{row.subject}</td>
                  <td className="py-2 px-4 border-b text-center">{row.level}</td>
                  <td className="py-2 px-4 border-b text-center">{row.language}</td>
                  <td className={`py-2 px-4 border-b text-center ${statusColor}`}>
                    {row.status}
                  </td>
                  <td className="py-2 px-4 border-b text-center">{row.score}</td>
                  <td className="py-2 px-4 border-b text-center">{row.attemptCount}</td>
                  <td className="py-2 px-4 border-b text-center">{row.date}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewAttempts;