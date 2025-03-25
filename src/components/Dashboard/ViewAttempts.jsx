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

  // Get unique attempted categories
  const attemptedCategories = [
    ...new Set(
      apiOutput2
        ?.filter((result) => result.isqualified !== undefined)
        ?.map((result) => result.exam.class_category_name)
    ),
  ] || [];

  useEffect(() => {
    dispatch(attemptsCount());
    dispatch(attemptsExam());
  }, [dispatch]);

  useEffect(() => {
    // Filter results based on selected category
    const results = apiOutput2?.filter((result) => {
      if (selectedCategory === "All") return true;
      return result.exam.class_category_name === selectedCategory;
    }) || [];

    setFilteredExamResults(results);
    
    // Extract unique subjects from filtered results
    const subjectNames = [...new Set(results.map((result) => result?.exam?.subjet_name))];
    setSubjects(subjectNames);
  }, [selectedCategory, apiOutput2]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-[#3E98C7] font-bold mb-4 flex items-center gap-1">
        <MdOutlineMenuBook className="size-7" />
        Exam Attempts
      </h1>

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

function SubjectResults({ subject, examResults, apiOutput1, selectedCategory }) {
  const subjectResults = examResults?.filter(
    (result) => result.exam.subjet_name === subject
  ) || [];

  const attemptData = subjectResults?.map((result) => {
    const level_id = result.exam.level_id;
    const levelKey = `level${level_id}`;
    
    // Calculate attempt count
    let attemptCount = 0;
    if (selectedCategory === "All") {
      // Sum attempts across all categories for this subject/level
      Object.values(apiOutput1 || {}).forEach(category => {
        attemptCount += category?.[subject]?.[levelKey] || 0;
      });
    } else {
      attemptCount = apiOutput1?.[selectedCategory]?.[subject]?.[levelKey] || 0;
    }

    return {
      classCategory: result.exam.class_category_name,
      subject: subject,
      language: result.language,
      level: result.exam.level_name,
      result: result.isqualified ? "Passed" : "Failed",
      percentage: result.calculate_percentage,
      attemptCount: attemptCount,
      date: new Date(result.created_at).toLocaleDateString(),
    };
  });

  return (
    <div className="mb-8 px-5">
      <div className="rounded-lg overflow-hidden border border-gray-300">
        <table className="w-full">
          <thead>
            <tr className="bg-[#E5F1F9] text-[#3E98C7] text-sm font-semibold">
              <th className="py-2 px-4 border-b">Class Category</th>
              <th className="py-2 px-4 border-b">Subject</th>
              <th className="py-2 px-4 border-b">Language</th>
              <th className="py-2 px-4 border-b">Level</th>
              <th className="py-2 px-4 border-b">Result</th>
              <th className="py-2 px-4 border-b">Percentage</th>
              <th className="py-2 px-4 border-b">Attempt Count</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {attemptData?.map((data, index) => (
              <tr key={index} className="text-sm text-gray-600">
                <td className="py-2 px-4 border-b text-center">{data.classCategory}</td>
                <td className="py-2 px-4 border-b text-center">{data.subject}</td>
                <td className="py-2 px-4 border-b text-center">{data.language}</td>
                <td className="py-2 px-4 border-b text-center">{data.level}</td>
                <td className="py-2 px-4 border-b text-center">{data.result}</td>
                <td className="py-2 px-4 border-b text-center">{data.percentage}%</td>
                <td className="py-2 px-4 border-b text-center">{data.attemptCount}</td>
                <td className="py-2 px-4 border-b text-center">{data.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewAttempts;