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
    const subjectNames = [...new Set(
      results
        .filter(result => result?.exam?.subjet_name || result?.exam?.subject_name) // Check both possible property names
        .map(result => result.exam?.subjet_name || result.exam?.subject_name)
    )];

    setSubjects(subjectNames);
  }, [selectedCategory, apiOutput2]);

  const formatAvgTime = (seconds) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const avgTimePerLevel = React.useMemo(() => {
    const levelStats = {};
    if (apiOutput2 && Array.isArray(apiOutput2)) {
      apiOutput2.forEach((attempt) => {
        const level = attempt?.exam?.level_name;
        const time = attempt?.time_taken_seconds;
        if (level && typeof time === "number" && time > 0) {
          if (!levelStats[level]) levelStats[level] = { total: 0, count: 0 };
          levelStats[level].total += time;
          levelStats[level].count += 1;
        }
      });
    }

    return Object.fromEntries(
      Object.entries(levelStats).map(([level, data]) => [
        level,
        formatAvgTime(data.total / data.count),
      ]),
    );
  }, [apiOutput2]);

  const formatDate = (value, { dateOnly } = { dateOnly: false }) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      if (dateOnly)
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return String(value);
    }
  };

  const getAnalyticalRows = () => {
    if (!filteredExamResults || filteredExamResults.length === 0) return [];

    const groupedData = [];

    filteredExamResults.forEach((attempt) => {
      const exam = attempt.exam || {};
      const classCat = exam.class_category_name || "Unknown";
      const subject = exam.subject_name || exam.subjet_name || "Unknown";
      const medium = attempt.language || exam.language || "Unknown";
      const level = exam.level_name || "Unknown";

      let classGroup = groupedData.find((g) => g.name === classCat);
      if (!classGroup) {
        classGroup = { name: classCat, subjects: [], rowCount: 0 };
        groupedData.push(classGroup);
      }

      let subGroup = classGroup.subjects.find((s) => s.name === subject && s.medium === medium);
      if (!subGroup) {
        subGroup = { name: subject, medium: medium, levels: [], rowCount: 0 };
        classGroup.subjects.push(subGroup);
      }

      let levelGroup = subGroup.levels.find((l) => l.name === level);
      if (!levelGroup) {
        levelGroup = { name: level, attempts: [], rowCount: 0 };
        subGroup.levels.push(levelGroup);
      }

      levelGroup.attempts.push(attempt);
      levelGroup.rowCount++;
      subGroup.rowCount++;
      classGroup.rowCount++;
    });

    const rows = [];
    groupedData.forEach((classGroup, cIdx) => {
      classGroup.subjects.forEach((subGroup, sIdx) => {
        subGroup.levels.forEach((levelGroup, lIdx) => {
          let levelPrimaryInterview = {};
          for (const att of levelGroup.attempts) {
            const ivs = (att.interviews || []).filter(iv => 
              String(iv.status || "").toLowerCase() === "fulfilled" || iv.grade !== "N/A"
            );
            if (ivs.length > 0) {
              levelPrimaryInterview = ivs[0];
              break;
            }
          }

          levelGroup.attempts.forEach((attempt, aIdx) => {
            const resultVal = attempt.calculate_percentage;
            const resultDisplay = (resultVal !== null && resultVal !== undefined) ? `${resultVal}%` : "-";
            const timeVal = attempt.time_taken_seconds;
            const timeDisplay = (timeVal !== null && timeVal !== undefined && timeVal > 0) ? formatAvgTime(timeVal) : "-";

            rows.push({
              classCat: classGroup.name,
              subject: subGroup.name,
              medium: subGroup.medium,
              level: levelGroup.name,
              attemptNumber: attempt.attempt || (aIdx + 1),
              examResult: resultDisplay,
              examDuration: timeDisplay,
              examDate: attempt.created_at ? formatDate(attempt.created_at, { dateOnly: true }) : "-",
              interviewAttempt: levelPrimaryInterview.attempt || "-",
              interviewResult: (levelPrimaryInterview.grade !== "N/A" && levelPrimaryInterview.grade != null) ? `${Math.round(levelPrimaryInterview.grade * 10)}%` : "-",
              interviewDate: levelPrimaryInterview.created_at ? formatDate(levelPrimaryInterview.created_at, { dateOnly: true }) : "-",
              
              classSpan: (sIdx === 0 && lIdx === 0 && aIdx === 0) ? classGroup.rowCount : 0,
              subSpan: (lIdx === 0 && aIdx === 0) ? subGroup.rowCount : 0,
              levelSpan: (aIdx === 0) ? levelGroup.rowCount : 0,
            });
          });
        });
      });
    });
    return rows;
  };

  const analyticalRows = getAnalyticalRows();

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
            <p className="text-sm text-slate-500 ml-14 mb-3">View all your exam attempts and interview records</p>
            {Object.keys(avgTimePerLevel).length > 0 && (
              <div className="flex flex-wrap gap-2 items-center lg:ml-14">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Avg Time:</span>
                {Object.entries(avgTimePerLevel).map(([lvl, time]) => (
                  <span key={lvl} className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold rounded shadow-sm">
                    {lvl}: {time}
                  </span>
                ))}
              </div>
            )}
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

            {filteredExamResults.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                  <HiOutlineDocumentText className="h-8 w-8 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="text-slate-800 text-lg font-bold mb-1">No exam results found</h3>
                <p className="text-slate-500 text-sm">Try selecting a different category or take an exam to see your results here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Category", "Subject", "Medium", "Level", "Exam Attempt", "Exam Result", "Exam Duration", "Exam Date", "Interview Atpt", "Interview Result", "Interview Date"].map((h) => (
                          <th key={h} className="p-3 text-left font-bold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-r-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticalRows.length > 0 ? analyticalRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {row.classSpan > 0 && <td rowSpan={row.classSpan} className="p-3 font-bold text-gray-800 border-r border-gray-200 align-top">{row.classCat}</td>}
                          {row.subSpan > 0 && <td rowSpan={row.subSpan} className="p-3 font-semibold text-teal-700 border-r border-gray-200 align-top">{row.subject}</td>}
                          {row.subSpan > 0 && <td rowSpan={row.subSpan} className="p-3 text-gray-600 border-r border-gray-200 align-top">{row.medium}</td>}
                          {row.levelSpan > 0 && <td rowSpan={row.levelSpan} className="p-3 font-medium text-gray-700 border-r border-gray-200 align-top">{row.level}</td>}
                          <td className="p-3 text-gray-600 border-r border-gray-200">{row.attemptNumber}</td>
                          <td className="p-3 border-r border-gray-200">
                            <span className={`font-bold ${parseFloat(row.examResult) >= 60 ? 'text-green-600' : 'text-rose-600'}`}>{row.examResult}</span>
                          </td>
                          <td className="p-3 text-gray-600 border-r border-gray-200 whitespace-nowrap">{row.examDuration}</td>
                          <td className="p-3 text-gray-500 whitespace-nowrap italic border-r border-gray-200">{row.examDate}</td>
                          {row.levelSpan > 0 && <td rowSpan={row.levelSpan} className="p-3 text-gray-600 text-center border-r border-gray-200 align-middle bg-gray-50/30">{row.interviewAttempt}</td>}
                          {row.levelSpan > 0 && <td rowSpan={row.levelSpan} className="p-3 font-bold text-gray-800 text-center border-r border-gray-200 align-middle bg-gray-50/30">{row.interviewResult}</td>}
                          {row.levelSpan > 0 && <td rowSpan={row.levelSpan} className="p-3 text-gray-500 whitespace-nowrap text-center italic align-middle bg-gray-50/30">{row.interviewDate}</td>}
                        </tr>
                      )) : (
                        <tr><td colSpan={11} className="p-8 text-center text-gray-400 italic">No analytical records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewAttempts;