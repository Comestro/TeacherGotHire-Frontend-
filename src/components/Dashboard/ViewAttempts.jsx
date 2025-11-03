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
    dispatch(attemptsExam());
  }, [dispatch]);

  useEffect(() => {
    // Add debug logs
    

    // Filter results based on selected category with more lenient filtering
    const validResults = apiOutput2?.filter(result => {
      // Log invalid results to help debugging
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
    <div className="md:max-w-8xl mx-auto">
      <div className="p-3 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-xl font-bold text-text flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HiOutlineDocumentText className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              Exam Attempts
              <span className="ml-2 text-secondary text-base font-normal">/ परीक्षा प्रयास</span>
            </h1>
            <p className="text-sm text-secondary ml-14">View all your exam attempts and interview records</p>
          </div>
          
          <div className="w-full lg:w-80">
            <label className="block text-text font-semibold mb-2 text-sm">
              Filter by Category
              <span className="ml-2 text-secondary text-xs font-normal">/ श्रेणी द्वारा फ़िल्टर करें</span>
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border-2 border-secondary/30 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-medium text-text"
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
                <HiOutlineChevronDown className="h-5 w-5 text-secondary" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        {apiOutput2?.some(result => result.exam === null) && (
          <div className="mb-6">
            <div className="bg-warning/5 border-2 border-warning/30 p-5 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/10 rounded-lg flex-shrink-0">
                  <HiOutlineExclamationTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-warning mb-1">Data Notice</h3>
                  <p className="text-sm text-warning/80">
                    Some exam results are invalid or incomplete and have been filtered out from the display.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HiOutlineFolderOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Showing Results For</p>
                <h2 className="text-text font-bold">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory + " class"}
                </h2>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-16 bg-background/50 rounded-xl border-2 border-dashed border-secondary/30">
                <div className="p-4 bg-secondary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <HiOutlineDocumentText className="h-10 w-10 text-secondary" aria-hidden="true" />
                </div>
                <h3 className="text-text text-xl font-bold mb-2">No exam results found</h3>
                <p className="text-secondary">Try selecting a different category or take an exam to see your results here.</p>
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
    <div className="mb-6">
      <div className="bg-white rounded-xl border border-secondary/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-5 border-b border-secondary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <h3 className="text-xl font-bold text-text flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HiOutlineBookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            {subject}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-br from-background to-background/50">
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Record Type</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Class Category</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Subject</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Level</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Language</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Result/Status</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Score</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Attempt</th>
                <th className="py-3 px-2 border-b border-secondary/10 text-left text-xs font-bold text-text/70 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, index) => {
                // Determine status styling
                let statusBadge;
                if (row.type === "Interview") {
                  if (row.status === "Completed") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-semibold border border-success/20">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Completed
                      </span>
                    );
                  } else if (row.status === "Scheduled") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                        <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
                        Scheduled
                      </span>
                    );
                  } else if (row.status === "Requested") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-semibold border border-warning/20">
                        <HiOutlineClock className="h-3.5 w-3.5" aria-hidden="true" />
                        Requested
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center px-3 py-1.5 bg-background text-secondary rounded-full text-xs font-semibold border border-secondary/30">
                        {row.status}
                      </span>
                    );
                  }
                } else {
                  if (row.status === "Passed") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-semibold border border-success/20">
                        <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Passed
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-full text-xs font-semibold border border-error/20">
                        <HiOutlineXCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Failed
                      </span>
                    );
                  }
                }
                
                return (
                <tr 
                  key={index} 
                  className={`text-sm hover:bg-primary/5 transition-all duration-200 ${
                    row.type === "Interview" ? "bg-background/30" : ""
                  }`}
                >
                  <td className="py-3 px-2 border-b border-secondary/10">
                    <span className="font-semibold text-text">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70">{row.classCategory}</td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70 font-medium">{row.subject}</td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70">{row.level}</td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70">{row.language}</td>
                  <td className="py-3 px-2 border-b border-secondary/10">
                    {statusBadge}
                  </td>
                  <td className="py-3 px-2 border-b border-secondary/10">
                    <span className="font-semibold text-text">{row.score}</span>
                  </td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70">{row.attemptCount}</td>
                  <td className="py-3 px-2 border-b border-secondary/10 text-text/70">{row.date}</td>
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