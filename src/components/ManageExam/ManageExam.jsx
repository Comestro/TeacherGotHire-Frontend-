import React, { useEffect, useState, useMemo } from "react";
import { fetchLevel } from "../../services/examServices";
import { deleteExam, getExam } from "../../services/adminManageExam";
import { useSelector } from "react-redux";
import {
  FiPlus,
  FiBook,
  FiFileText,
  FiSearch,
  FiFilter,
  FiX,
  FiLayers,
  FiBookOpen,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExamSetsTable from "./componets/ExamSetsTable";
import ExamSetterModal from "./componets/ExamSetterModal";
import QuestionModal from "./componets/QuestionModal";

const ManageExam = () => {
  const [level, setLevel] = useState([]);
  const [examSets, setExamSets] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    set_name: "",
    description: "",
    subject: "",
    level: "",
    class_category: "",
    total_marks: "",
    duration: "",
    type: "online",
    total_questions: "", // Add total_questions to formData
  });

  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCopying, setIsCopying] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const setterUser = useSelector((state) => state.examQues.setterInfo);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedClassCategory, setSelectedClassCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all"); // Add level filter
  const [selectedStatus, setSelectedStatus] = useState("all"); // Add status filter
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [examForQuestions, setExamForQuestions] = useState(null);
  useEffect(() => {
    const getLevels = async () => {
      try {
        const response = await fetchLevel();
        setLevel(response);
      } catch (error) {}
    };

    getLevels();
  }, []);
  useEffect(() => {
    const fetchExamSets = async () => {
      try {
        setLoading(true);
        const response = await getExam(page);
        if (response && response.results && Array.isArray(response.results)) {
          setExamSets(response.results || []);
          setTotalCount(response.count || 0);
          setNextUrl(response.next || null);
          setPrevUrl(response.previous || null);
          setPageSize(response.results.length || pageSize);
        } else if (Array.isArray(response)) {
          setExamSets(response);
          setTotalCount(response.length);
          setPageSize(response.length || pageSize);
          setNextUrl(null);
          setPrevUrl(null);
        } else {
          setExamSets(response || []);
          setTotalCount((response && response.length) || 0);
          setPageSize((response && response.length) || pageSize);
          setNextUrl(null);
          setPrevUrl(null);
        }
      } catch (error) {
        toast.error("Failed to fetch exam sets");
      } finally {
        setLoading(false);
      }
    };

    fetchExamSets();
  }, [refreshTrigger, page]); // Re-run when refreshTrigger or page changes
  const classCategories = setterUser?.[0]?.class_category || [];
  const getSubjects = () => {
    let allSubjects = [];
    classCategories.forEach((category) => {
      if (category.subjects && Array.isArray(category.subjects)) {
        const subjectsWithClass = category.subjects.map((subject) => ({
          ...subject,
          displayName: `${category.name} - ${subject.subject_name}`, // Add class name prefix
        }));
        allSubjects = [...allSubjects, ...subjectsWithClass];
      }
    });

    return allSubjects;
  };
  const subjects = getSubjects();
  const getExamClassName = (exam) => {
    if (!exam) return "";
    if (exam.class_category) {
      if (typeof exam.class_category === "object")
        return exam.class_category.name || "";
      return String(exam.class_category);
    }
    return "";
  };

  const getExamSubjectName = (exam) => {
    if (!exam) return "";
    if (exam.subject) {
      if (typeof exam.subject === "object")
        return exam.subject.subject_name || exam.subject.name || "";
      return String(exam.subject);
    }
    return "";
  };

  const getExamLevelName = (exam) => {
    if (!exam) return "";
    if (exam.level) {
      if (typeof exam.level === "object") return exam.level.name || "";
      return String(exam.level);
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyExam = (exam) => {
    setIsCopying(true);
    const normalize = (v) => {
      if (!v && v !== 0) return "";
      if (typeof v === "object")
        return v.id ? v.id.toString() : (v.name || v.label || "").toString();
      return v.toString();
    };

    setFormData({
      set_name: exam.set_name,
      description: exam.description,
      subject: normalize(exam.subject),
      level: normalize(exam.level),
      class_category: normalize(exam.class_category),
      total_marks: exam.total_marks,
      duration: exam.duration,
      type: exam.type,
      total_questions: exam.total_questions || 10, // Add total_questions when copying
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      set_name: "",
      description: "",
      subject: "",
      level: "",
      class_category: "",
      total_marks: "",
      duration: "",
      type: "online",
      total_questions: "", // Add total_questions to reset
    });
    setIsModalOpen(false);
    setEditingExam(null);
    setIsCopying(false);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    const normalize = (v) => {
      if (!v && v !== 0) return "";
      if (typeof v === "object")
        return v.id ? v.id.toString() : (v.name || v.label || "").toString();
      return v.toString();
    };

    setFormData({
      set_name: exam.set_name || "", // Add the set name from exam
      description: exam.description,
      subject: normalize(exam.subject),
      level: normalize(exam.level),
      class_category: normalize(exam.class_category),
      total_marks: exam.total_marks,
      duration: exam.duration,
      type: exam.type,
      total_questions: exam.total_questions || 10, // Add total_questions when editing
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam set?")) {
      setExamSets((prev) => prev.filter((exam) => exam.id !== examId));
      let data = await deleteExam(examId);
      toast.success("Exam deleted successfully!");
    }
  };
  const handleAddQuestionAt = (exam, index) => {
    setExamForQuestions(exam);
    setIsQuestionModalOpen(true);
    sessionStorage.setItem("newQuestionOrder", index);
  };
  const handleSubmitQuestion = async (formData) => {
    try {
      setLoading(true);
      const storedOrder = sessionStorage.getItem("newQuestionOrder");
      const orderPosition = storedOrder ? parseInt(storedOrder) : null;
      const payload = {
        ...formData,
        exam: examForQuestions.id,
        ...(orderPosition !== null ? { order: orderPosition } : {}),
      };

      const response = await createQuestion(payload);

      if (response && response.id) {
        toast.success("Question added successfully!");
        setRefreshTrigger((prev) => prev + 1);
      }
      sessionStorage.removeItem("newQuestionOrder");
      setIsQuestionModalOpen(false);
      setExamForQuestions(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };
  const handleAddQuestions = (examId, position = null) => {
    const exam = examSets.find((exam) => exam.id === examId);
    if (exam) {
      if (position !== null) {
        handleAddQuestionAt(exam, position);
      } else {
        navigate(`/manage-exam/questions/${examId}/add`);
      }
    } else {
      toast.error("Exam not found");
    }
  };
  const handleExamCreated = (newExam) => {
    toast.success("Exam created successfully!");
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
    setIsModalOpen(false); // Close modal after success
    setIsCopying(false); // Reset copying state
  };
  const handleExamUpdated = (updatedExam) => {
    toast.success("Exam updated successfully!");
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
    setIsModalOpen(false); // Close modal after success
  };
  const filteredSubjects = useMemo(() => {
    if (selectedClassCategory === "all") return [];

    const selectedCategory = classCategories.find(
      (cat) => cat.id.toString() === selectedClassCategory
    );

    return selectedCategory?.subjects || [];
  }, [selectedClassCategory, classCategories]);
  const handleClassCategoryChange = (e) => {
    setSelectedClassCategory(e.target.value);
    setSelectedSubject("all");
  };

  const getFilteredExams = () => {
    return examSets.filter((exam) => {
      const matchesSearch =
        searchTerm === "" ||
        (exam.name &&
          exam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exam.description &&
          exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesClassCategory = (() => {
        if (selectedClassCategory === "all") return true;
        if (
          exam.class_category &&
          typeof exam.class_category === "object" &&
          exam.class_category.id
        ) {
          return exam.class_category.id.toString() === selectedClassCategory;
        }
        const selectedClassName = classCategories.find(
          (c) => c.id.toString() === selectedClassCategory
        )?.name;
        if (selectedClassName)
          return getExamClassName(exam) === selectedClassName;
        return false;
      })();
      const matchesSubject = (() => {
        if (selectedSubject === "all") return true;
        if (
          exam.subject &&
          typeof exam.subject === "object" &&
          exam.subject.id
        ) {
          return exam.subject.id.toString() === selectedSubject;
        }
        const selectedSubjectName = subjects.find(
          (s) => s.id && s.id.toString() === selectedSubject
        )?.subject_name;
        if (selectedSubjectName)
          return getExamSubjectName(exam) === selectedSubjectName;
        return false;
      })();
      const matchesLevel = (() => {
        if (selectedLevel === "all") return true;
        if (exam.level && typeof exam.level === "object" && exam.level.id) {
          return exam.level.id.toString() === selectedLevel;
        }
        const selectedLevelName = level.find(
          (l) => l.id.toString() === selectedLevel
        )?.name;
        if (selectedLevelName)
          return getExamLevelName(exam) === selectedLevelName;
        return false;
      })();
      const matchesType =
        selectedType === "all" ||
        (exam.type && String(exam.type) === selectedType);
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "published" && exam.status === true) ||
        (selectedStatus === "draft" && exam.status === false);

      return (
        matchesSearch &&
        matchesClassCategory &&
        matchesSubject &&
        matchesLevel &&
        matchesType &&
        matchesStatus
      );
    });
  };
  const getSortedAndGroupedExams = () => {
    const filtered = getFilteredExams();

    return filtered.sort((a, b) => {
      const classA = a.class_category?.name || "";
      const classB = b.class_category?.name || "";
      if (classA !== classB) {
        return classA.localeCompare(classB);
      }
      const subjectA = a.subject?.subject_name || "";
      const subjectB = b.subject?.subject_name || "";
      if (subjectA !== subjectB) {
        return subjectA.localeCompare(subjectB);
      }
      const levelA = a.level?.id || 0;
      const levelB = b.level?.id || 0;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      const typeOrder = { online: 0, offline: 1 };
      const typeA = typeOrder[a.type] || 0;
      const typeB = typeOrder[b.type] || 0;

      return typeA - typeB;
    });
  };

  const filteredExams = getSortedAndGroupedExams();

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClassCategory("all");
    setSelectedSubject("all");
    setSelectedLevel("all");
    setSelectedType("all");
    setSelectedStatus("all");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-8xl mx-auto text-left">
        {/* Unified Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
          {/* Header & Primary Action */}
          <div className="bg-teal-700 p-3 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center leading-tight">
                <FiBook className="w-4 h-4 mr-2 text-teal-200" />
                Manage Exam Sets
              </h1>
              <p className="text-[10px] text-teal-100 font-medium uppercase tracking-wider">
                Control Center / {totalCount} Exam Sets
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <FiPlus className="w-4 h-4 mr-1.5" /> Create Exam Set
            </button>
          </div>

          {/* Toolbar - Filters & Search */}
          <div className="p-2 sm:p-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <FiSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search exam sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                  isFilterExpanded ||
                  selectedClassCategory !== "all" ||
                  selectedSubject !== "all" ||
                  selectedType !== "all" ||
                  selectedStatus !== "all"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FiFilter className="w-3.5 h-3.5 mr-1.5" />
                Filters
                {(selectedClassCategory !== "all" ||
                  selectedSubject !== "all" ||
                  selectedType !== "all" ||
                  selectedLevel !== "all" ||
                  selectedStatus !== "all") && (
                  <span className="ml-1.5 bg-teal-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    {(selectedClassCategory !== "all" ? 1 : 0) +
                      (selectedSubject !== "all" ? 1 : 0) +
                      (selectedType !== "all" ? 1 : 0) +
                      (selectedLevel !== "all" ? 1 : 0) +
                      (selectedStatus !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase">View</span>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {filteredExams.length}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Results</span>
              </div>
            </div>
          </div>

          {/* Filter Drawer - Compact */}
          {isFilterExpanded && (
            <div className="px-3 py-3 bg-white border-b border-gray-100 grid grid-cols-2 lg:grid-cols-5 gap-3 animate-dropdown">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                <select
                  value={selectedClassCategory}
                  onChange={handleClassCategoryChange}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Category</option>
                  {classCategories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                  disabled={selectedClassCategory === "all"}
                >
                  <option value="all">
                    {selectedClassCategory === "all" ? "Select category" : "All Subject"}
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id.toString()}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Level</option>
                  {level.map((lvl) => (
                    <option key={lvl.id} value={lvl.id.toString()}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Exam Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Type</option>
                  <option value="online">Home Exam</option>
                  <option value="offline">Exam Centre</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex justify-between">
                  <span>Status</span>
                  <button onClick={clearFilters} className="text-teal-600 hover:underline">Clear</button>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          )}
        </div>

          {/* Active filter badges - Improved wrapping and compact */}
          {(selectedClassCategory !== "all" ||
            selectedSubject !== "all" ||
            selectedType !== "all" ||
            selectedLevel !== "all" ||
            selectedStatus !== "all") && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedClassCategory !== "all" && (
                <div className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {classCategories.find(
                    (c) => c.id.toString() === selectedClassCategory
                  )?.name || "Class"}
                  <button
                    onClick={() => {
                      setSelectedClassCategory("all");
                      setSelectedSubject("all");
                    }}
                    className="ml-1.5 text-teal-400 hover:text-teal-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {selectedSubject !== "all" && (
                <div className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                  <FiBookOpen className="mr-1 h-3 w-3" />
                  {filteredSubjects.find(
                    (s) => s.id.toString() === selectedSubject
                  )?.subject_name || "Subject"}
                  <button
                    onClick={() => setSelectedSubject("all")}
                    className="ml-1.5 text-blue-400 hover:text-blue-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {selectedLevel !== "all" && (
                <div className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {level.find((l) => l.id.toString() === selectedLevel)?.name ||
                    "Level"}
                  <button
                    onClick={() => setSelectedLevel("all")}
                    className="ml-1.5 text-green-400 hover:text-green-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {selectedType !== "all" && (
                <div className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                  <FiFilter className="mr-1 h-3 w-3" />
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                  <button
                    onClick={() => setSelectedType("all")}
                    className="ml-1.5 text-purple-400 hover:text-purple-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}

              {selectedStatus !== "all" && (
                <div className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {selectedStatus.charAt(0).toUpperCase() +
                    selectedStatus.slice(1)}
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="ml-1.5 text-orange-400 hover:text-orange-600"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile view count */}
          <div className="text-gray-500 text-[11px] block sm:hidden text-center mt-3">
            Showing{" "}
            <span className="font-semibold">{filteredExams.length}</span> of{" "}
            {totalCount} exam sets
          </div>
        </div>

        {/* Show empty state or exam sets table */}
        {!loading && filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <FiFileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {examSets.length === 0
                  ? "No Exam Sets Found"
                  : "No Matching Exam Sets"}
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                {examSets.length === 0
                  ? "Get started by creating your first exam set. You can add questions after creating an exam set."
                  : "Try adjusting your search or filter settings to find what you're looking for."}
              </p>
              {examSets.length === 0 ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center justify-center space-x-2 mx-auto transition-all shadow-lg hover:shadow-xl"
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create First Exam Set</span>
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center justify-center space-x-2 mx-auto"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <ExamSetsTable
            examSets={filteredExams}
            onAddQuestions={handleAddQuestions}
            onEdit={handleEdit}
            onCopy={handleCopyExam}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Pagination controls for paginated API responses */}
        {totalCount > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
              Total: {totalCount} exam sets
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || !prevUrl}
                className={`px-3 py-1 rounded-md border ${
                  page <= 1 || !prevUrl
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Prev
              </button>

              <div className="text-sm text-gray-700">
                Page {page} of{" "}
                {Math.max(1, Math.ceil(totalCount / (pageSize || 1)))}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!nextUrl}
                className={`px-3 py-1 rounded-md border ${
                  !nextUrl
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal remains unchanged */}
        <ExamSetterModal
          isOpen={isModalOpen}
          onClose={resetForm}
          editingExam={editingExam}
          isCopying={isCopying}
          formData={formData}
          onInputChange={handleInputChange}
          subjects={subjects}
          level={level}
          classCategories={classCategories}
          onExamCreated={handleExamCreated}
          onExamUpdated={handleExamUpdated}
        />

        {/* Import the QuestionModal component */}
        {examForQuestions && (
          <QuestionModal
            isOpen={isQuestionModalOpen}
            onClose={() => {
              setIsQuestionModalOpen(false);
              setExamForQuestions(null);
              sessionStorage.removeItem("newQuestionOrder");
            }}
            onSubmit={handleSubmitQuestion}
            examId={examForQuestions?.id}
            editingQuestion={null}
          />
        )}
      </div>

      {/* Loading state - unchanged */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam sets...</p>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ManageExam;
