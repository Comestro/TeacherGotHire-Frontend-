import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiFileText,
  FiAward,
  FiBook,
  FiFilter,
  FiSearch,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiX,
  FiLayers,
  FiBookOpen,
} from "react-icons/fi";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import QuestionCard from "./componets/QuestionCard";
import QuestionModal from "./componets/QuestionModal";
import {
  createQuestion,
  updateQuestion,
  getExamById,
  deleteQuestion,
} from "../../services/adminManageExam";
import { reorderQuestions } from "../../services/apiService";

const ManageQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const examId = location.state?.exam?.id;

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const examData = location.state?.exam;
        if (!examData) {
          toast.error("No exam data found");
          navigate("/manage-exam");
          return;
        }

        // Fetch fresh exam data using examId
        const response = await getExamById(examData.id);
        console.log("Fetched Exam Data:", response);

        setExam(response);
        setQuestions(response.questions || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam:", error);
        toast.error("Failed to fetch exam details");
        setLoading(false);
        navigate("/manage-exam");
      }
    };

    fetchExamData();
  }, [location.state, navigate]);

  // Organize questions by order and handle missing order numbers
  const organizeQuestionsByOrder = () => {
    // Find the maximum order number to know the range we need to display
    const maxOrder = Math.max(...questions.map((q) => q.order || 0), 0);

    // Create arrays for English and Hindi with placeholders for missing orders
    // Add +1 to account for 1-based indexing (orders start at 1, not 0)
    const englishByOrder = Array(maxOrder + 1).fill(null);
    const hindiByOrder = Array(maxOrder + 1).fill(null);

    // Place questions in their respective arrays by order
    questions.forEach((question) => {
      // Make sure we use the actual order from the question
      const orderNum = question.order || 0;
      if (question.language === "English") {
        englishByOrder[orderNum] = question;
      } else if (question.language === "Hindi") {
        hindiByOrder[orderNum] = question;
      }
    });

    // Remove the first element (index 0) if we're using 1-based indexing
    // and there are no questions with order 0
    if (!englishByOrder[0] && !hindiByOrder[0]) {
      englishByOrder.shift();
      hindiByOrder.shift();
    }

    return {
      englishByOrder,
      hindiByOrder,
      maxOrder,
    };
  };

  // Handle drag end with improved order handling and parallel order updates
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      setIsReordering(true);

      // Get the active question and target question
      const activeQuestion = questions.find((q) => q.id === active.id);
      const overQuestion = questions.find((q) => q.id === over.id);

      if (!activeQuestion || !overQuestion) return;

      // Get the active language
      const activeLanguage = activeQuestion.language;
      // Get the other language
      const otherLanguage = activeLanguage === "English" ? "Hindi" : "English";

      // Get all questions of the active language
      const activeLanguageQuestions = questions
        .filter((q) => q.language === activeLanguage)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      // Find the old and new indices in the active language array
      const oldIndex = activeLanguageQuestions.findIndex((q) => q.id === active.id);
      const newIndex = activeLanguageQuestions.findIndex((q) => q.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder the active language questions array
      const reorderedActiveLanguageQuestions = arrayMove(
        activeLanguageQuestions,
        oldIndex,
        newIndex
      );

      // Create a deep copy of all questions to update
      const updatedQuestions = [...questions];

      // Create a mapping of order positions between languages
      // This helps us identify which questions in different languages correspond to each other
      const orderMappings = {};
      
      // First update the active language questions with their new orders
      reorderedActiveLanguageQuestions.forEach((question, idx) => {
        const newOrder = idx;
        const oldOrder = question.order || 0;
        
        // Track the mapping from old order to new order
        orderMappings[oldOrder] = newOrder;
        
        // Update in our local state
        const qIndex = updatedQuestions.findIndex((q) => q.id === question.id);
        if (qIndex !== -1) {
          updatedQuestions[qIndex] = {
            ...updatedQuestions[qIndex],
            order: newOrder,
          };
        }
      });

      // Now update any corresponding questions in the other language based on the same order positions
      const otherLanguageQuestions = questions.filter(
        (q) => q.language === otherLanguage
      );
      
      otherLanguageQuestions.forEach((question) => {
        const oldOrder = question.order || 0;
        // If there's a mapping for this order, update it
        if (orderMappings[oldOrder] !== undefined) {
          const newOrder = orderMappings[oldOrder];
          const qIndex = updatedQuestions.findIndex((q) => q.id === question.id);
          if (qIndex !== -1) {
            updatedQuestions[qIndex] = {
              ...updatedQuestions[qIndex],
              order: newOrder,
            };
          }
        }
      });

      // Update the questions state
      setQuestions(updatedQuestions);

      // Prepare data for API call - all questions that had their order changed
      const changedQuestions = updatedQuestions.filter(
        (q) => questions.find(origQ => origQ.id === q.id)?.order !== q.order
      );
      
      // Send the new orders to the API
      await reorderQuestions(changedQuestions.map(q => q.id));

      toast.success("Questions reordered successfully");
    } catch (error) {
      console.error("Error reordering questions:", error);
      toast.error("Failed to reorder questions");

      // Revert the changes by refetching data
      await refreshExamData();
    } finally {
      setIsReordering(false);
    }
  };

  const getFilteredAndOrganizedQuestions = () => {
    // First apply all filters (language, class, subject, search)
    const filtered = questions.filter((question) => {
      if (!question || !question.text) return false;

      const matchesLanguage =
        selectedLanguage === "all" || question.language === selectedLanguage;
      const matchesClass =
        selectedClass === "all" || question.class_category === selectedClass;
      const matchesSubject =
        selectedSubject === "all" || question.subject_level === selectedSubject;
      const matchesSearch = searchTerm
        ? question.text.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return (
        matchesLanguage &&
        matchesClass &&
        matchesSubject &&
        matchesSearch
      );
    });

    // Then organize by language and order
    const byLanguage = {
      English: filtered.filter((q) => q.language === "English"),
      Hindi: filtered.filter((q) => q.language === "Hindi"),
    };

    return byLanguage;
  };

  const getLanguageStats = () => {
    const englishCount = questions.filter(
      (q) => q.language === "English"
    ).length;
    const hindiCount = questions.filter((q) => q.language === "Hindi").length;
    const totalMarks = exam?.total_marks || 0;

    return { englishCount, hindiCount, totalMarks };
  };

  const handleBack = () => {
    navigate("/manage-exam");
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const refreshExamData = async () => {
    try {
      const response = await getExamById(examId);
      if (response) {
        setExam(response);
        setQuestions(response.questions || []);
      }
    } catch (error) {
      console.error("Error refreshing exam data:", error);
      toast.error("Failed to refresh exam data");
    }
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      if (editingQuestion) {
        // Update existing question
        const response = await updateQuestion(editingQuestion.id, {
          ...formData,
          exam: exam.id,
        });

        if (response && response.id) {
          // Update questions list with edited question
          setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
              q.id === editingQuestion.id ? response : q
            )
          );
          toast.success("Question updated successfully");
        }
      } else {
        // Create new question
        const response = await createQuestion({
          ...formData,
          exam: exam.id,
        });

        if (response && response.id) {
          // Add new question to the questions list
          setQuestions((prevQuestions) => [...prevQuestions, response]);
          toast.success("Question created successfully");
        }
      }

      // Close modal and reset editing state
      setIsModalOpen(false);
      setEditingQuestion(null);

      // Fetch fresh exam data to update all stats
      await refreshExamData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(error.response?.data?.error || "Failed to save question");
    }
  };

  // Update handleDelete to immediately remove the question from UI
  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(questionId);

        // Immediately remove question from UI
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );

        toast.success("Question deleted successfully");

        // Refresh exam data to update stats
        await refreshExamData();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error.response?.data?.error || "Failed to delete question");
      }
    }
  };

  // Get unique class categories and subject levels for filters
  const getFilterOptions = () => {
    const classCategories = [
      ...new Set(questions.map((q) => q.class_category).filter(Boolean)),
    ];
    const subjectLevels = [
      ...new Set(questions.map((q) => q.subject_level).filter(Boolean)),
    ];

    return { classCategories, subjectLevels };
  };

  const { classCategories, subjectLevels } = getFilterOptions();

  // Reset all filters
  const clearFilters = () => {
    setSelectedLanguage("all");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSearchTerm("");
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const { englishCount, hindiCount, totalMarks } = getLanguageStats();
  const { englishByOrder, hindiByOrder, maxOrder } = organizeQuestionsByOrder();
  const filteredByLanguage = getFilteredAndOrganizedQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8 border border-gray-100">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-gray-600 hover:text-teal-600 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Exam Sets
          </button>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {exam.name}
              </h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                  <div className="flex items-center">
                    <FiFileText className="w-8 h-8 mr-3" />
                    <div>
                      <p className="text-teal-100 text-sm">Total Questions</p>
                      <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center">
                    <FiGlobe className="w-8 h-8 mr-3" />
                    <div>
                      <p className="text-blue-100 text-sm">English</p>
                      <p className="text-2xl font-bold">{englishCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center">
                    <FiBook className="w-8 h-8 mr-3" />
                    <div>
                      <p className="text-purple-100 text-sm">Hindi</p>
                      <p className="text-2xl font-bold">{hindiCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center">
                    <FiAward className="w-8 h-8 mr-3" />
                    <div>
                      <p className="text-green-100 text-sm">Total Marks</p>
                      <p className="text-2xl font-bold">{totalMarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <FiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isFilterExpanded ||
                  selectedLanguage !== "all" ||
                  selectedClass !== "all" ||
                  selectedSubject !== "all"
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filters
                {(selectedLanguage !== "all" ||
                  selectedClass !== "all" ||
                  selectedSubject !== "all") && (
                  <span className="ml-2 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(selectedLanguage !== "all" ? 1 : 0) +
                      (selectedClass !== "all" ? 1 : 0) +
                      (selectedSubject !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showAnswers
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showAnswers ? (
                  <FiEye className="w-4 h-4 mr-2" />
                ) : (
                  <FiEyeOff className="w-4 h-4 mr-2" />
                )}
                {showAnswers ? "Hide Answers" : "Show Answers"}
              </button>

              <button
                onClick={() =>
                  navigate(`/manage-exam/questions/${exam.id}/add`)
                }
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Add Question
              </button>
            </div>
          </div>

          {/* Expanded filters */}
          {isFilterExpanded && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FiGlobe className="mr-2" /> Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Languages</option>
                    <option value="English">English Only</option>
                    <option value="Hindi">Hindi Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FiLayers className="mr-2" /> Class Category
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Classes</option>
                    {classCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FiBookOpen className="mr-2" /> Subject Level
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Subjects</option>
                    {subjectLevels.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-teal-600 flex items-center"
                >
                  <FiX className="mr-1" /> Clear filters
                </button>
              </div>
            </div>
          )}

          {/* Active filter badges */}
          {(selectedLanguage !== "all" ||
            selectedClass !== "all" ||
            selectedSubject !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedLanguage !== "all" && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiGlobe className="mr-1 h-3 w-3" />
                  {selectedLanguage}
                  <button
                    onClick={() => setSelectedLanguage("all")}
                    className="ml-2 text-teal-600 hover:text-teal-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {selectedClass !== "all" && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {selectedClass}
                  <button
                    onClick={() => setSelectedClass("all")}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {selectedSubject !== "all" && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiBookOpen className="mr-1 h-3 w-3" />
                  {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject("all")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reordering indicator */}
          {isReordering && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700 text-sm">
                  Reordering questions...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Questions by Language */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {selectedLanguage === "all" && selectedClass === "all" && selectedSubject === "all" && !searchTerm ? (
            // Show organized by order with parallel Hindi/English
            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <FiFileText className="w-6 h-6 mr-2" />
                    Questions by Order
                  </h2>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                    {questions.length} questions
                  </span>
                </div>
              </div>

              <div className="p-6">
                {maxOrder > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Column */}
                    <div>
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <h3 className="text-lg font-medium text-blue-700 flex items-center">
                          <FiGlobe className="w-5 h-5 mr-2" /> English Questions
                        </h3>
                      </div>
                      <SortableContext
                        items={englishByOrder.filter(Boolean).map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {englishByOrder.map((question, index) => (
                            <div key={`english-${index}`} className="relative pl-8 mb-4">
                              <div className="absolute left-0 top-4 bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                {index + 1}
                              </div>
                              {question ? (
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  showAnswers={showAnswers}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  isDraggable={true}
                                />
                              ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[120px]">
                                  <p className="text-gray-400 text-center">
                                    No English question for order #{index + 1}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </div>

                    {/* Hindi Column */}
                    <div>
                      <div className="bg-purple-50 p-3 rounded-lg mb-4">
                        <h3 className="text-lg font-medium text-purple-700 flex items-center">
                          <FiBook className="w-5 h-5 mr-2" /> Hindi Questions
                        </h3>
                      </div>
                      <SortableContext
                        items={hindiByOrder.filter(Boolean).map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {hindiByOrder.map((question, index) => (
                            <div key={`hindi-${index}`} className="relative pl-8 mb-4">
                              <div className="absolute left-0 top-4 bg-purple-100 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                {index + 1}
                              </div>
                              {question ? (
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  showAnswers={showAnswers}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  isDraggable={true}
                                />
                              ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[120px]">
                                  <p className="text-gray-400 text-center">
                                    No Hindi question for order #{index + 1}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                ) : (
                  // Empty state if no questions
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No Questions Added Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by adding your first question to this exam set
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all mx-auto"
                    >
                      <FiPlus className="w-5 h-5 mr-2" />
                      Add First Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show filtered questions (existing view)
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No questions match your filters
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filter settings
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl flex items-center mx-auto"
                    >
                      <FiX className="w-5 h-5 mr-2" />
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  // Split into language columns if in filtered view
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Only show English column if there are English questions */}
                    {filteredByLanguage.English.length > 0 && (
                      <div>
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <h3 className="text-lg font-medium text-blue-700 flex items-center">
                            <FiGlobe className="w-5 h-5 mr-2" /> English Questions (
                            {filteredByLanguage.English.length})
                          </h3>
                        </div>
                        <SortableContext
                          items={filteredByLanguage.English.map((q) => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {filteredByLanguage.English.map((question, index) => (
                              <div key={question.id} className="relative pl-8 mb-4">
                                <div className="absolute left-0 top-4 bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                  {(question.order || 0) + 1}
                                </div>
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  showAnswers={showAnswers}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  isDraggable={true}
                                />
                              </div>
                            ))}
                          </div>
                        </SortableContext>
                      </div>
                    )}

                    {/* Only show Hindi column if there are Hindi questions */}
                    {filteredByLanguage.Hindi.length > 0 && (
                      <div>
                        <div className="bg-purple-50 p-3 rounded-lg mb-4">
                          <h3 className="text-lg font-medium text-purple-700 flex items-center">
                            <FiBook className="w-5 h-5 mr-2" /> Hindi Questions (
                            {filteredByLanguage.Hindi.length})
                          </h3>
                        </div>
                        <SortableContext
                          items={filteredByLanguage.Hindi.map((q) => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {filteredByLanguage.Hindi.map((question, index) => (
                              <div key={question.id} className="relative pl-8 mb-4">
                                <div className="absolute left-0 top-4 bg-purple-100 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                  {(question.order || 0) + 1}
                                </div>
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  showAnswers={showAnswers}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  isDraggable={true}
                                />
                              </div>
                            ))}
                          </div>
                        </SortableContext>
                      </div>
                    )}

                    {/* If only one language has questions, span the full width */}
                    {(filteredByLanguage.English.length === 0 ||
                      filteredByLanguage.Hindi.length === 0) &&
                      filteredQuestions.length > 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">
                            {filteredByLanguage.English.length === 0
                              ? "No English questions match your filters"
                              : "No Hindi questions match your filters"}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DndContext>

        <QuestionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingQuestion(null);
          }}
          onSubmit={handleSubmitQuestion}
          examId={exam?.id}
          editingQuestion={editingQuestion}
        />
      </div>
    </div>
  );
};

export default ManageQuestion;
