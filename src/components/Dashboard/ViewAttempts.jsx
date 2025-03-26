import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsCount, attemptsExam } from "../../features/examQuesSlice";
import { MdOutlineMenuBook } from "react-icons/md";

function ViewAttempts() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredExamResults, setFilteredExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const apiOutput1 = useSelector((state) => state.examQues?.attemptCount);
  const apiOutput2 = useSelector((state) => state.examQues?.attempts);
  const dispatch = useDispatch();

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
    dispatch(attemptsCount());
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
      <h1 className="text-2xl text-[#3E98C7] font-bold mb-4 flex items-center gap-1">
        <MdOutlineMenuBook className="size-7" />
        Exam Attempts
      </h1>

      {apiOutput2?.some(result => result.exam === null) && (
        <div className="mb-4 px-5">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            <p className="text-sm">
              Note: Some exam results are invalid or incomplete and have been filtered out.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 px-5 ">
        <label className="block text-gray-700 mb-2 text-lg font-semibold">
          Select Class Category:
        </label>
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full"
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
      </div>

      {selectedCategory && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#3E98C7] px-5">
            Showing results for: {selectedCategory === "All" ? "All Categories" : selectedCategory}
          </h2>

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
  );
}

function getLevelOrder(levelName) {
  if (levelName.includes("1st")) return 1;
  if (levelName.includes("Online")) return 2;
  if (levelName.includes("Offline")) return 3;
  return 4; // Interview level
}

function SubjectResults({ subject, examResults, apiOutput1, selectedCategory }) {
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
    
    let attemptCount = 0;
    if (selectedCategory === "All") {
      Object.values(apiOutput1 || {}).forEach(category => {
        attemptCount += category?.[subject]?.[levelKey] || 0;
      });
    } else {
      attemptCount = apiOutput1?.[selectedCategory]?.[subject]?.[levelKey] || 0;
    }

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
      attemptCount,
      date: new Date(result.created_at).toLocaleDateString(),
    });

    // Add interviews if any
    if (result.interviews?.length) {
      result.interviews.forEach(interview => {
        if (interview.subject === subject) { // Only add interviews for matching subject
          interviewRows.push({
            levelOrder: 4, // Interview is always last
            levelName: "Interview",
            type: "Interview",
            classCategory: interview.class_category,
            subject: interview.subject,
            level: "Interview",
            language: '-',
            status: interview.status ? "Completed" : "Pending",
            score: interview.grade ? `${interview.grade}/10` : 'N/A',
            attemptCount: '-',
            date: new Date(interview.time).toLocaleDateString(),
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

  // Remove duplicate interviews (keep only latest)
  const uniqueRows = allRows.filter((row, index, self) =>
    row.type !== "Interview" ||
    index === self.findIndex(r => 
      r.type === "Interview" && 
      r.classCategory === row.classCategory && 
      r.subject === row.subject
    )
  );

  // Don't render anything if no valid results
  if (!uniqueRows.length) return null;

  return (
    <div className="mb-8 px-5">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">{subject}</h3>
      <div className="rounded-lg overflow-x-scroll md:overflow-hidden border border-gray-300">
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
            {uniqueRows.map((row, index) => (
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
                <td className={`py-2 px-4 border-b text-center ${
                  row.type === "Interview" 
                    ? row.status === "Completed" ? "text-green-600" : "text-yellow-600"
                    : row.status === "Passed" ? "text-green-600" : "text-red-600"
                }`}>
                  {row.status}
                </td>
                <td className="py-2 px-4 border-b text-center">{row.score}</td>
                <td className="py-2 px-4 border-b text-center">{row.attemptCount}</td>
                <td className="py-2 px-4 border-b text-center">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewAttempts;