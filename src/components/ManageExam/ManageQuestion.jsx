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

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      setIsReordering(true);

      // Get the current filtered questions for the active language
      const currentQuestions =
        selectedLanguage === "all"
          ? questions
          : questions.filter((q) => q.language === selectedLanguage);

      // Find the old and new indices
      const oldIndex = currentQuestions.findIndex((q) => q.id === active.id);
      const newIndex = currentQuestions.findIndex((q) => q.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder the questions array
      const reorderedQuestions = arrayMove(
        currentQuestions,
        oldIndex,
        newIndex
      );

      // Update the questions state
      if (selectedLanguage === "all") {
        setQuestions(reorderedQuestions);
      } else {
        // For filtered view, we need to update the main questions array
        const otherLanguageQuestions = questions.filter(
          (q) => q.language !== selectedLanguage
        );
        const allReorderedQuestions = [
          ...otherLanguageQuestions,
          ...reorderedQuestions,
        ];
        setQuestions(allReorderedQuestions);
      }

      // Send the new order to the API
      const orderIds = reorderedQuestions.map((q) => q.id);
      await reorderQuestions(orderIds);

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

  // Filter questions based on language and search term
  const filteredQuestions = questions.filter((question) => {
    if (!question || !question.text) return false;

    const matchesLanguage =
      selectedLanguage === "all" || question.language === selectedLanguage;
    const matchesSearch = searchTerm
      ? question.text.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesLanguage && matchesSearch;
  });

  // Group questions by language
  const questionsByLanguage = {
    English: filteredQuestions.filter((q) => q.language === "English"),
    Hindi: filteredQuestions.filter((q) => q.language === "Hindi"),
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

  if (loading || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const { englishCount, hindiCount, totalMarks } = getLanguageStats();

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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <FiFilter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Languages</option>
                  <option value="English">English Only</option>
                  <option value="Hindi">Hindi Only</option>
                </select>
              </div>
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
          {selectedLanguage === "all" ? (
            // Show categorized by language
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["English", "Hindi"].map((language) => {
                const langQuestions = questionsByLanguage[language];
                if (langQuestions.length === 0) return null;

                return (
                  <div
                    key={language}
                    className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
                  >
                    <div
                      className={`px-6 py-4 ${
                        language === "English"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-purple-500 to-purple-600"
                      } text-white`}
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center">
                          {language === "English" ? (
                            <FiGlobe className="w-6 h-6 mr-2" />
                          ) : (
                            <FiBook className="w-6 h-6 mr-2" />
                          )}
                          {language} Questions
                        </h2>
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                          {langQuestions.length} questions
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <SortableContext
                        items={langQuestions.map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-6">
                          {langQuestions.map((question, index) => (
                            <QuestionCard
                              key={question.id}
                              question={question}
                              index={index}
                              showAnswers={showAnswers}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              isDraggable={true}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                );
              })}

              {/* Show empty state if no questions in any language */}
              {questions.length === 0 && (
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center">
                  <div className="max-w-md mx-auto">
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
                </div>
              )}
            </div>
          ) : (
            // Show filtered questions
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {searchTerm
                        ? "No questions match your search"
                        : `No ${selectedLanguage} questions found`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : `Add your first ${selectedLanguage} question`}
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all mx-auto"
                    >
                      <FiPlus className="w-5 h-5 mr-2" />
                      Add New Question
                    </button>
                  </div>
                ) : (
                  <SortableContext
                    items={filteredQuestions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {filteredQuestions.map((question, index) => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          index={index}
                          showAnswers={showAnswers}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isDraggable={true}
                        />
                      ))}
                    </div>
                  </SortableContext>
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
