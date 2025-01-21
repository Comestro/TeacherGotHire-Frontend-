import React, { useState, useEffect } from "react";
// import { apiOutput1, apiOutput2 } from './data';
import { useDispatch, useSelector } from "react-redux";
import { attemptsCount, attemptsExam } from "../../features/examQuesSlice";
import { MdOutlineMenuBook } from "react-icons/md";

function ViewAttempts() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredExamResults, setFilteredExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const apiOutput1 = useSelector((state) => state.examQues?.attemptCount);
  const apiOutput2 = useSelector((state) => state.examQues?.attempts);

  console.log("apiout", apiOutput1);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(attemptsCount());
    dispatch(attemptsExam());
    // Extract categories from apiOutput1
    const categoryNames = Object.keys(apiOutput1);
    setCategories(categoryNames);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Filter exam results based on the selected category
      const results = apiOutput2.filter(
        (result) => result.exam.class_category.name === selectedCategory
      );
      setFilteredExamResults(results);

      // Extract subjects
      const subjectNames = [
        ...new Set(results.map((result) => result.exam.subject.subject_name)),
      ];
      setSubjects(subjectNames);
    } else {
      setFilteredExamResults([]);
      setSubjects([]);
    }
  }, [selectedCategory]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-[#3E98C7] font-bold mb-4 flex items-center gap-1">
        <MdOutlineMenuBook className="size-7" />
        Exam Attempts
      </h1>
      {/* Category Selection */}
      <div className="mb-6 px-5 ">
        <label
          htmlFor="categorySelect"
          className="block text-gray-700 mb-2 text-lg font-semibold"
        >
          Select Class Category:
        </label>
        <select
          id="categorySelect"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" disabled>
            Choose Class Category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Display Results */}
      {selectedCategory && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#3E98C7]">
            Class Category: {selectedCategory}
          </h2>

          {subjects.length === 0 ? (
            <p>No exam results found for this category.</p>
          ) : (
            subjects.map((subject) => (
              <SubjectResults
                key={subject}
                subject={subject}
                examResults={filteredExamResults}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SubjectResults({ subject, examResults }) {
  // Filter results for the subject
  const subjectResults = examResults.filter(
    (result) => result.exam.subject.subject_name === subject
  );

  // Map data to include required fields
  const attemptData = subjectResults.map((result, index) => {
    const totalQuestions = result.exam.questions.length;
    const correctAnswers = result.correct_answer;
    const totalMarks = result.exam.total_marks;
    const score = (correctAnswers / totalQuestions) * totalMarks;
    const percentage = (score / totalMarks) * 100;

    return {
      attempt: index + 1,
      level: result.exam.level.name,
      result: result.isqualified ? "Passed" : "Failed",
      percentage: percentage.toFixed(2),
      date: new Date(result.created_at),
    };
  });

  // Sort attemptData in descending order of percentage
  attemptData.sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="mb-8 px-5">
      <h3 className="text-lg font-medium mb-2 text-gray-700">Subject: {subject}</h3>

      <div className="rounded-lg overflow-hidden border border-gray-300">
        <table className="w-full ">
          <thead>
            <tr className="bg-[#E5F1F9] text-[#3E98C7] text-sm font-semibold">
              <th className="py-2 px-4 border-b">Attempt</th>
              <th className="py-2 px-4 border-b">Level</th>
              <th className="py-2 px-4 border-b">Result</th>
              <th className="py-2 px-4 border-b">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {attemptData.map((data) => (
              <tr key={data.attempt} className="text-sm text-gray-600">
                <td className="py-2 px-4 border-b text-center">
                  {data.attempt}
                </td>
                <td className="py-2 px-4 border-b text-center">{data.level}</td>
                <td className="py-2 px-4 border-b text-center">
                  {data.result}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {data.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewAttempts;
src/App.js

