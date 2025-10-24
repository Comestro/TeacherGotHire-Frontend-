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
  createNewQuestion,
  updateNewQuestion,
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

  // Improved organize questions by order function to handle duplicate orders
  const organizeQuestionsByOrder = () => {
    // Find the maximum order number to know the range we need to display
    const maxOrder = Math.max(...questions.map((q) => q.order || 0), 0);

    // Create arrays for English and Hindi, but store arrays of questions at each order index
    // to handle duplicate orders
    const englishByOrder = Array(maxOrder + 1).fill(null).map(() => []);
    const hindiByOrder = Array(maxOrder + 1).fill(null).map(() => []);

    // Place questions in their respective arrays by order
    questions.forEach((question) => {
      const orderNum = question.order || 0;
      if (question.language === "English") {
        englishByOrder[orderNum].push(question);
      } else if (question.language === "Hindi") {
        hindiByOrder[orderNum].push(question);
      }
    });

    // Remove the first element (index 0) if we're using 1-based indexing
    // and there are no questions with order 0
    if (englishByOrder[0].length === 0 && hindiByOrder[0].length === 0) {
      englishByOrder.shift();
      hindiByOrder.shift();
    }

    return {
      englishByOrder,
      hindiByOrder,
      maxOrder,
    };
  };

  // Completely rewritten handleDragEnd function to fix position reordering issues
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    try {
      setIsReordering(true);

      // Get the dragged question
      const activeQuestion = questions.find(q => q.id === active.id);
      if (!activeQuestion) return;

      // Get the target question
      const overQuestion = questions.find(q => q.id === over.id);
      if (!overQuestion) return;

      // Prevent reordering between different languages
      if (activeQuestion.language !== overQuestion.language) {
        toast.warn(`Cannot reorder between ${activeQuestion.language} and ${overQuestion.language} questions`);
        return;
      }

      // Get the language of the questions we're reordering
      const language = activeQuestion.language;
      
      // Get all questions of this language and sort them by order
      const sameLanguageQuestions = questions
        .filter(q => q.language === language)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Find indices within the language-specific array
      const oldIndex = sameLanguageQuestions.findIndex(q => q.id === active.id);
      const newIndex = sameLanguageQuestions.findIndex(q => q.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;

      console.log(`Moving question from position ${oldIndex} to ${newIndex}`);
      
      // Create a new array with the items reordered
      const reorderedQuestions = arrayMove(
        [...sameLanguageQuestions],
        oldIndex,
        newIndex
      );
      
      // Reassign order values sequentially to all questions
      const updatedQuestions = reorderedQuestions.map((question, index) => ({
        ...question,
        order: index  // Use sequential index as the new order
      }));
      
      // Extract just the IDs in the new order for the API call
      const orderedIds = updatedQuestions.map(q => q.id);
      
      console.log("New order of IDs:", orderedIds);
      
      // Call the API with the ordered IDs
      await reorderQuestions(orderedIds);
      
      // Update the UI immediately by merging the updated questions into the current state
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        
        // Replace each question with its updated version
        updatedQuestions.forEach(updatedQuestion => {
          const index = newQuestions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            newQuestions[index] = updatedQuestion;
          }
        });
        
        return newQuestions;
      });
      
      toast.success(`${language} questions reordered successfully`);
      
      // Refresh data from server to ensure everything is in sync
      await refreshExamData();
      
    } catch (error) {
      console.error('Error reordering questions:', error);
      toast.error('Failed to reorder questions');
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

  const handleAddQuestionAt = (index) => {
    // Set the default order for a new question
    setIsModalOpen(true);
    // Store the target position for when we create the new question
    sessionStorage.setItem('newQuestionOrder', index);
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      // Get stored order position if available
      const storedOrder = sessionStorage.getItem('newQuestionOrder');
      const orderPosition = storedOrder ? parseInt(storedOrder) : null;
      
      // Extract English and Hindi question data from formData
      const englishQuestion = formData.english ? {
        language: "English",
        text: formData.english.text || "",
        solution: formData.english.solution || "",
        options: formData.english.options || [],
        correct_option: formData.english.correct_option || 1
      } : null;
      
      const hindiQuestion = formData.hindi ? {
        language: "Hindi",
        text: formData.hindi.text || "",
        solution: formData.hindi.solution || "",
        options: formData.hindi.options || [],
        correct_option: formData.hindi.correct_option || 1
      } : null;
      
      // Create questions array with non-null questions
      const questions = [];
      if (englishQuestion && englishQuestion.text.trim() && englishQuestion.options.length) {
        questions.push(englishQuestion);
      }
      if (hindiQuestion && hindiQuestion.text.trim() && hindiQuestion.options.length) {
        questions.push(hindiQuestion);
      }
      
      if (questions.length === 0) {
        toast.error("Please provide at least one complete question");
        return;
      }
      
      if (editingQuestion) {
        // Update only the language being edited
        let updatedQuestions = [];
        if (editingQuestion.language === "English") {
          if (englishQuestion && englishQuestion.text && englishQuestion.options && englishQuestion.options.length) {
            updatedQuestions.push({
              language: "English",
              text: englishQuestion.text,
              solution: englishQuestion.solution,
              options: englishQuestion.options,
              correct_option: englishQuestion.correct_option,
            });
          }
        } else if (editingQuestion.language === "Hindi") {
          if (hindiQuestion && hindiQuestion.text && hindiQuestion.options && hindiQuestion.options.length) {
            updatedQuestions.push({
              language: "Hindi",
              text: hindiQuestion.text,
              solution: hindiQuestion.solution,
              options: hindiQuestion.options,
              correct_option: hindiQuestion.correct_option,
            });
          }
        }

        const payload = {
          exam: exam.id,
          questions: updatedQuestions
        };

        const response = await updateNewQuestion(editingQuestion.id, payload);

        if (response && response.id) {
          setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
              q.id === editingQuestion.id ? response : q
            )
          );
          toast.success("Question updated successfully");
        }
      } else {
        // Create new question with specific order if provided
        const payload = {
          exam: exam.id,
          ...(orderPosition !== null ? { order: orderPosition } : {}),
          questions: questions
        };
        
        const response = await createNewQuestion(payload);

        if (response && response.id) {
          // Add new questions to the questions list
          if (Array.isArray(response)) {
            setQuestions((prevQuestions) => [...prevQuestions, ...response]);
          } else {
            setQuestions((prevQuestions) => [...prevQuestions, response]);
          }
          toast.success(`${questions.length} question(s) created successfully`);
        }
      }

      // Clear the stored order after use
      sessionStorage.removeItem('newQuestionOrder');

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6">
      <div className="max-w-8xl mx-auto">
        {/* Enhanced Header with integrated search and filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Top section with back button and exam name */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center text-teal-100 hover:text-white transition-colors group mb-2"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Exam Sets</span>
                </button>
                <h1 className="text-xl sm:text-3xl font-bold">
                  {exam.name} ({exam.set_name || "N/A"})
                </h1>
                <p className="text-teal-100 text-sm mt-1 hidden sm:block">
                  Manage all questions for this exam set
                </p>
              </div>
              
              {/* Add Question button */}
              <button
                onClick={() => navigate(`/manage-exam/questions/${exam.id}/add`)}
                className="bg-white text-teal-700 hover:bg-teal-50 px-4 py-2 rounded-lg flex items-center text-sm font-medium shadow-sm transition-colors self-start sm:self-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
          
          {/* Search & Filter bar */}
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                  <FiSearch className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className={`hidden sm:flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isFilterExpanded || selectedLanguage !== "all" || selectedClass !== "all" || selectedSubject !== "all"
                      ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } text-sm`}
                >
                  <FiFilter className="w-3.5 h-3.5 mr-1.5" />
                  Filters
                  {(selectedLanguage !== "all" || selectedClass !== "all" || selectedSubject !== "all") && (
                    <span className="ml-1.5 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(selectedLanguage !== "all" ? 1 : 0) +
                        (selectedClass !== "all" ? 1 : 0) +
                        (selectedSubject !== "all" ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className={`sm:hidden flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isFilterExpanded || selectedLanguage !== "all" || selectedClass !== "all" || selectedSubject !== "all"
                      ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } text-sm flex-1`}
                >
                  <FiFilter className="w-3.5 h-3.5 mr-1.5" />
                  Filters
                  {(selectedLanguage !== "all" || selectedClass !== "all" || selectedSubject !== "all") && (
                    <span className="ml-1.5 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(selectedLanguage !== "all" ? 1 : 0) +
                        (selectedClass !== "all" ? 1 : 0) +
                        (selectedSubject !== "all" ? 1 : 0)}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setShowAnswers(!showAnswers)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                    showAnswers
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {showAnswers ? (
                    <><FiEye className="w-3.5 h-3.5 mr-1.5" /> Hide</>
                  ) : (
                    <><FiEyeOff className="w-3.5 h-3.5 mr-1.5" /> Show</>
                  )}
                </button>
              </div>
            </div>
            
            {/* Expanded filters */}
            {isFilterExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">All Languages</option>
                      <option value="English">English Only</option>
                      <option value="Hindi">Hindi Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Class Category
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">All Classes</option>
                      {classCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Subject Level
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">All Subjects</option>
                      {subjectLevels.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Active filter badges */}
                {(selectedLanguage !== "all" || selectedClass !== "all" || selectedSubject !== "all") && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedLanguage !== "all" && (
                      <div className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs flex items-center">
                        <FiGlobe className="mr-1 h-2.5 w-2.5" />
                        {selectedLanguage}
                        <button
                          onClick={() => setSelectedLanguage("all")}
                          className="ml-1 text-teal-600 hover:text-teal-800"
                        >
                          <FiX className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                    
                    {selectedClass !== "all" && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center">
                        <FiLayers className="mr-1 h-2.5 w-2.5" />
                        {selectedClass}
                        <button
                          onClick={() => setSelectedClass("all")}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <FiX className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                    
                    {selectedSubject !== "all" && (
                      <div className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs flex items-center">
                        <FiBookOpen className="mr-1 h-2.5 w-2.5" />
                        {selectedSubject}
                        <button
                          onClick={() => setSelectedSubject("all")}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          <FiX className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-teal-600 flex items-center ml-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Reordering indicator */}
            {isReordering && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700 text-xs">
                    Reordering questions...
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 mr-3">
                  <FiFileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Questions</p>
                  <p className="text-xl font-bold text-gray-900">{questions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                  <FiGlobe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">English</p>
                  <p className="text-xl font-bold text-gray-900">{englishCount}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 mr-3">
                  <FiBook className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hindi</p>
                  <p className="text-xl font-bold text-gray-900">{hindiCount}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 mr-3">
                  <FiAward className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Marks</p>
                  <p className="text-xl font-bold text-gray-900">{totalMarks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remove the separate filters section since it's now in the header */}
        
        {/* Questions by Language - Keep the existing code */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {selectedLanguage === "all" && selectedClass === "all" && selectedSubject === "all" && !searchTerm ? (
            // Show organized by order with parallel Hindi/English
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-xl font-bold flex items-center">
                    <FiFileText className="w-4 h-4 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                    Questions by Order
                  </h2>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                    {questions.length} questions
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {maxOrder > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* English Column */}
                    <div>
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-medium text-blue-700 flex items-center">
                          <FiGlobe className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> English Questions
                        </h3>
                      </div>
                      <SortableContext
                        items={englishByOrder.flat().filter(Boolean).map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3 sm:space-y-4">
                          {englishByOrder.map((questions, index) => (
                            <div key={`english-${index}`} className="relative pl-8 mb-4">
                              <div className="absolute left-0 top-4 bg-blue-100 text-blue-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                {index + 1}
                              </div>
                              
                              {/* Handle duplicate questions with same order */}
                              {questions.length > 1 && (
                                <div className="mb-2 py-1 px-2 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium inline-block">
                                  ⚠️ {questions.length} English questions with same order #{index + 1}
                                </div>
                              )}
                              
                              {/* Render all questions with this order */}
                              {questions.length > 0 ? (
                                <div className="space-y-3">
                                  {questions.map((question, qIndex) => (
                                    <div key={question.id} className={qIndex > 0 ? "mt-3 pt-3 border-t border-gray-200" : ""}>
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
                              ) : (
                                <div 
                                  onClick={() => handleAddQuestionAt(index + 1)}
                                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[120px] cursor-pointer hover:bg-gray-100 hover:border-teal-300 transition-colors"
                                >
                                  <div className="text-center">
                                    <p className="text-gray-400">
                                      No English question for order #{index + 1}
                                    </p>
                                    <p className="text-teal-600 text-sm mt-2">
                                      <FiPlus className="inline-block mr-1" /> 
                                      Click to add a question here
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </div>

                    {/* Hindi Column */}
                    <div>
                      <div className="bg-purple-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-medium text-purple-700 flex items-center">
                          <FiBook className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Hindi Questions
                        </h3>
                      </div>
                      <SortableContext
                        items={hindiByOrder.flat().filter(Boolean).map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3 sm:space-y-4">
                          {hindiByOrder.map((questions, index) => (
                            <div key={`hindi-${index}`} className="relative pl-8 mb-4">
                              <div className="absolute left-0 top-4 bg-purple-100 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow">
                                {index + 1}
                              </div>
                              
                              {/* Handle duplicate questions with same order */}
                              {questions.length > 1 && (
                                <div className="mb-2 py-1 px-2 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium inline-block">
                                  ⚠️ {questions.length} Hindi questions with same order #{index + 1}
                                </div>
                              )}
                              
                              {/* Render all questions with this order */}
                              {questions.length > 0 ? (
                                <div className="space-y-3">
                                  {questions.map((question, qIndex) => (
                                    <div key={question.id} className={qIndex > 0 ? "mt-3 pt-3 border-t border-gray-200" : ""}>
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
                              ) : (
                                <div 
                                  onClick={() => handleAddQuestionAt(index)}
                                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[120px] cursor-pointer hover:bg-gray-100 hover:border-purple-300 transition-colors"
                                >
                                  <div className="text-center">
                                    <p className="text-gray-400">
                                      No Hindi question for order #{index + 1}
                                    </p>
                                    <p className="text-purple-600 text-sm mt-2">
                                      <FiPlus className="inline-block mr-1" /> 
                                      Click to add a question here
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                ) : (
                  // Empty state - Made responsive
                  <div className="text-center py-8 sm:py-12">
                    <FiFileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
                      No Questions Added Yet
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      Get started by adding your first question to this exam set
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl flex items-center shadow-md hover:shadow-lg transition-all mx-auto text-sm sm:text-base"
                    >
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      Add First Question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show filtered questions - Made responsive
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <FiFileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
                      No questions match your filters
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      Try adjusting your filter settings
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center mx-auto"
                    >
                      <FiX className="w-5 h-5 mr-2" />
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  // Split into language columns if in filtered view
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Only show English column if there are English questions */}
                    {filteredByLanguage.English.length > 0 && (
                      <div>
                        <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-medium text-blue-700 flex items-center">
                            <FiGlobe className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> English Questions (
                            {filteredByLanguage.English.length})
                          </h3>
                        </div>
                        <SortableContext
                          items={filteredByLanguage.English.map((q) => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3 sm:space-y-4">
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
                        <div className="bg-purple-50 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-medium text-purple-700 flex items-center">
                            <FiBook className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Hindi Questions (
                            {filteredByLanguage.Hindi.length})
                          </h3>
                        </div>
                        <SortableContext
                          items={filteredByLanguage.Hindi.map((q) => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3 sm:space-y-4">
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

        {/* Question Modal - Keep the existing code */}
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
