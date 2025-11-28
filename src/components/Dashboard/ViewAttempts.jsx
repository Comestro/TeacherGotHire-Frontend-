import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../features/examQuesSlice";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineChevronDown,
  HiOutlineFolderOpen,
  HiOutlineBookOpen
} from "react-icons/hi2";
import ErrorMessage from "../ErrorMessage";

function ViewAttempts() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredExamResults, setFilteredExamResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);

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
    const fetchData = async () => {
      try {
        await dispatch(attemptsExam()).unwrap();
      } catch (err) {
        setFetchError("Failed to load exam attempts. Please try again later.");
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    // Filter results based on selected category with more lenient filtering
    const validResults = apiOutput2?.filter(result => {
      if (!result?.exam) {
        return false;
      }
      return true;
    }) || [];

    const results = validResults.filter((result) => {
      if (selectedCategory === "All") return true;
      return result.exam?.class_category_name === selectedCategory;
    });

    setFilteredExamResults(results);

    // More lenient subject extraction
    const subjectNames = [...new Set(
      results
        .filter(result => result?.exam?.subjet_name || result?.exam?.subject_name) // Check both possible property names
        .map(result => result.exam?.subjet_name || result.exam?.subject_name)
    )];

    setSubjects(subjectNames);
  }, [selectedCategory, apiOutput2]);

  return (
    <div className="w-full mx-auto">
      <div className="space-y-6">
        <ErrorMessage
          message={fetchError}
          onDismiss={() => setFetchError(null)}
        />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <HiOutlineDocumentText className="h-6 w-6" aria-hidden="true" />
              </span>
              Exam Attempts
              <span className="text-slate-400 text-lg font-normal">/ परीक्षा प्रयास</span>
            </h1>
            <p className="text-sm text-slate-500 ml-14">View all your exam attempts and interview records</p>
          </div>

          <div className="w-full lg:w-72">
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              Filter by Category
              <span className="ml-2 text-slate-400 text-xs font-normal">/ श्रेणी द्वारा फ़िल्टर करें</span>
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium text-slate-700 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Class Categories</option>
                {attemptedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category} class
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <HiOutlineChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {apiOutput2?.some(result => result.exam === null) && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0 text-amber-600">
                <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 text-sm mb-0.5">Data Notice</h3>
                <p className="text-xs text-amber-700">
                  Some exam results are invalid or incomplete and have been filtered out from the display.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-teal-50/50 rounded-lg border border-teal-100">
              <div className="p-1.5 bg-teal-100 rounded-lg text-teal-600">
                <HiOutlineFolderOpen className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Showing Results For</p>
                <h2 className="text-slate-800 font-bold text-sm">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory + " class"}
                </h2>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                  <HiOutlineDocumentText className="h-8 w-8 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="text-slate-800 text-lg font-bold mb-1">No exam results found</h3>
                <p className="text-slate-500 text-sm">Try selecting a different category or take an exam to see your results here.</p>
              </div>
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
  if (levelName.includes("Interview")) return 5; // Interviews should be last
  return 4; // Other levels
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
    const level_id = result?.exam?.level_id;
    const levelKey = `level${level_id}`;


    // Add exam result
    examRows.push({
      levelOrder: getLevelOrder(result?.exam?.level_name),
      levelName: result?.exam?.level_name,
      type: "Exam",
      classCategory: result?.exam?.class_category_name,
      subject: result?.exam?.subject_name,
      level: result?.exam?.level_name,
      language: result?.language || 'N/A',
      status: result?.isqualified ? "Passed" : "Failed",
      score: `${result?.calculate_percentage}%`,
      date: new Date(result?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(result?.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      attemptCount: result?.attempt || '1',
    });

    // Add interviews if any - filter out pending interviews
    if (result?.interviews?.length) {
      result.interviews
        // Filter out interviews with "pending" status
        .filter(interview => interview?.status !== "pending")
        .forEach(interview => {
          if (interview?.subject === subject) { // Show all non-pending interviews for matching subject
            // Determine interview level based on the parent exam
            const interviewLevel = `Interview - ${result?.exam?.level_name}`;

            interviewRows.push({
              levelOrder: 5, // Interview is always last
              levelName: "Interview",
              type: "Interview",
              classCategory: interview?.class_category,
              subject: interview?.subject,
              level: interviewLevel, // Set the level based on parent exam level
              language: '-',
              status: interview?.status === "fulfilled" ? "Completed" :
                interview?.status === "scheduled" ? "Scheduled" :
                  interview?.status === "requested" ? "Requested" : interview?.status,
              score: interview?.grade ? `${interview.grade}/10` : 'N/A',
              attemptCount: interview?.attempt || '-',
              date: interview?.time ? new Date(interview.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date(interview.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-',
              interviewDate: interview?.created_at ? new Date(interview.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + new Date(interview.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-',
            });
          }
        });
    }
  });

  // Combine and sort all rows - interviews should be last
  const allRows = [...examRows, ...interviewRows].sort((a, b) => {
    // Interviews always last
    if (a.type === "Interview" && b.type !== "Interview") return 1;
    if (a.type !== "Interview" && b.type === "Interview") return -1;

    // For same type, sort by level order
    if (a.levelOrder !== b.levelOrder) {
      return a.levelOrder - b.levelOrder;
    }

    // For same level, sort by date descending
    return new Date(b.date) - new Date(a.date);
  });

  // Don't render anything if no valid results
  if (!allRows.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all hover:border-teal-200">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-teal-600 shadow-sm">
          <HiOutlineBookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          {subject}
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Record Type</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class Category</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Language</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Result/Status</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Attempt</th>
              <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allRows.map((row, index) => (
              <DesktopRow key={index} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {allRows.map((row, index) => (
          <MobileCard key={index} row={row} />
        ))}
      </div>
    </div>
  );
}

function getStatusBadge(row) {
  if (row.type === "Interview") {
    if (row.status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
          <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Completed
        </span>
      );
    } else if (row.status === "Scheduled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
          <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
          Scheduled
        </span>
      );
    } else if (row.status === "Requested") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-100">
          <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
          Requested
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
          {row.status}
        </span>
      );
    }
  } else {
    if (row.status === "Passed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
          <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Passed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
          <HiOutlineXCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Failed
        </span>
      );
    }
  }
}

function DesktopRow({ row }) {
  return (
    <tr className={`text-sm hover:bg-slate-50 transition-colors ${row.type === "Interview" ? "bg-slate-50/50" : "bg-white"}`}>
      <td className="py-3 px-4">
        <span className={`font-semibold ${row.type === "Interview" ? "text-indigo-600" : "text-teal-600"}`}>
          {row.type}
        </span>
      </td>
      <td className="py-3 px-4 text-slate-600">{row.classCategory}</td>
      <td className="py-3 px-4 text-slate-600 font-medium">{row.subject}</td>
      <td className="py-3 px-4 text-slate-600">{row.level}</td>
      <td className="py-3 px-4 text-slate-600">{row.language}</td>
      <td className="py-3 px-4">{getStatusBadge(row)}</td>
      <td className="py-3 px-4">
        <span className="font-semibold text-slate-700">{row.score}</span>
      </td>
      <td className="py-3 px-4 text-slate-600">{row.attemptCount}</td>
      <td className="py-3 px-4 text-slate-500 text-xs">{row.date}</td>
    </tr>
  );
}

function MobileCard({ row }) {
  return (
    <div className={`p-4 ${row.type === "Interview" ? "bg-slate-50/50" : "bg-white"}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${row.type === "Interview" ? "text-indigo-600" : "text-teal-600"}`}>
            {row.type}
          </span>
          <h4 className="font-bold text-slate-800 text-sm mt-0.5">{row.subject}</h4>
          <p className="text-xs text-slate-500">{row.classCategory}</p>
        </div>
        {getStatusBadge(row)}
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
        <div>
          <p className="text-xs text-slate-400">Level</p>
          <p className="text-slate-700 font-medium">{row.level}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-slate-700 font-bold">{row.score}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Language</p>
          <p className="text-slate-700">{row.language}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Attempt</p>
          <p className="text-slate-700">{row.attemptCount}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
        <HiOutlineClock className="h-3.5 w-3.5" />
        {row.date}
      </div>
    </div>
  );
}

export default ViewAttempts;