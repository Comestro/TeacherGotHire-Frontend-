import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiBook,
  FiInfo,
  FiChevronRight,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiHelpCircle,
  FiList,
  FiGlobe,
} from "react-icons/fi";
import {
  getExamById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/adminManageExam";
import Layout from "../Admin/Layout";
import Loader from "../../components/Loader";

// Reusable Components matching other refined pages
const ErrorMessage = ({ message, type = "error", onClose }) => {
  if (!message) return null;
  const bg =
    type === "success"
      ? "bg-green-50"
      : type === "warning"
      ? "bg-yellow-50"
      : "bg-red-50";
  const text =
    type === "success"
      ? "text-green-800"
      : type === "warning"
      ? "text-yellow-800"
      : "text-red-800";
  const border =
    type === "success"
      ? "border-green-200"
      : type === "warning"
      ? "border-yellow-200"
      : "border-red-200";
  const Icon =
    type === "success"
      ? FiCheck
      : type === "warning"
      ? FiAlertCircle
      : FiAlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-3 mb-4 rounded-lg border ${bg} ${border} ${text} shadow-lg animate-fade-in-down`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <div className="text-sm font-medium pr-2">{message}</div>
      <button
        onClick={onClose}
        className={`ml-auto p-1 rounded-full hover:bg-black/5 transition-colors`}
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  return (
    <div
      className={`mb-3 p-4 rounded-xl border transition-all duration-200 relative bg-white group hover:shadow-md ${
        question.language === "English"
          ? "border-l-4 border-l-teal-500 border-gray-200 hover:border-teal-200"
          : "border-l-4 border-l-purple-500 border-gray-200 hover:border-purple-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                question.language === "English"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {index + 1}
            </span>
            Question
          </h3>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
              question.language === "English"
                ? "bg-teal-50 text-teal-700"
                : "bg-purple-50 text-purple-700"
            }`}
          >
            {question.language}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(question)}
            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-700 font-medium mb-3 leading-relaxed border-b border-gray-50 pb-2">
        {question.text}
      </div>

      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
          <FiList size={12} /> Options:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg text-xs border flex items-center gap-2 ${
                i + 1 === question.correct_option
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-gray-50 border-gray-100 text-gray-600"
              }`}
            >
              {i + 1 === question.correct_option && (
                <FiCheck className="text-green-600 shrink-0" size={12} />
              )}
              <span
                className={
                  i + 1 === question.correct_option ? "font-medium" : ""
                }
              >
                {i + 1}. {option}
              </span>
            </div>
          ))}
        </div>
      </div>

      {question.solution && (
        <div className="mt-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50">
          <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
            <FiHelpCircle size={12} /> Solution:
          </p>
          <p className="text-xs text-blue-700/80 leading-relaxed pl-4">
            {question.solution}
          </p>
        </div>
      )}
    </div>
  );
};

const ExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correct_option: 1,
    solution: "",
    language: "English",
  });
  const [notification, setNotification] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const response = await getExamById(examId);
        setExam(response);
        const transformedQuestions =
          response?.questions?.map((q) => ({
            ...q,
            options: q.options.map((opt) =>
              typeof opt === "object" ? opt.option : opt
            ),
            language: q.language || "English",
          })) || [];
        setQuestions(transformedQuestions);
      } catch (error) {
        showNotification(
          error.response?.data?.message || "Failed to fetch exam details.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    let errors = {};
    if (!newQuestion.text.trim()) {
      errors.text = "Question text is required.";
    }
    newQuestion.options.forEach((opt, index) => {
      if (!opt.trim()) {
        errors[`option_${index}`] = `Option ${index + 1} is required.`;
      }
    });
    if (
      newQuestion.correct_option === "" ||
      isNaN(newQuestion.correct_option)
    ) {
      errors.correct_option = "Correct Option is required.";
    } else if (
      newQuestion.correct_option < 1 ||
      newQuestion.correct_option > 4
    ) {
      errors.correct_option = "Correct Option must be between 1 and 4.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddQuestion = () => {
    setIsAddModalOpen(true);
    setEditQuestion(null);
    setFormErrors({});
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correct_option: 1,
      solution: "",
      language: selectedLanguage,
    });
  };

  const handleEditQuestion = (question) => {
    const transformedQuestion = {
      ...question,
      options: question.options.map((opt) =>
        typeof opt === "object" ? opt.option : opt
      ),
    };
    setEditQuestion(transformedQuestion);
    setNewQuestion(transformedQuestion);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!validateForm()) return;

    setFormSubmitting(true);

    try {
      const questionData = { ...newQuestion };
      if (!questionData.solution.trim()) {
        delete questionData.solution;
      }

      if (editQuestion) {
        await updateQuestion(editQuestion.id, questionData);
        showNotification("Question updated successfully!");
      } else {
        await createQuestion({ ...questionData, exam: examId });
        showNotification("Question added successfully!");
      }

      try {
        const response = await getExamById(examId);
        const transformedQuestions =
          response?.questions?.map((q) => ({
            ...q,
            options: q.options.map((opt) =>
              typeof opt === "object" ? opt.option : opt
            ),
            language: q.language || "English",
          })) || [];
        setQuestions(transformedQuestions);
      } catch (fetchError) {
        showNotification("Failed to refresh questions.", "error");
      }

      setIsAddModalOpen(false);
      setFormErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Action failed.";
      showNotification(errorMsg, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
      showNotification("Question deleted successfully!");
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Failed to delete question.",
        "error"
      );
    }
  };

  const filteredQuestions = questions.filter(
    (q) => q.language === selectedLanguage
  );
  const questionCounts = {
    English: questions.filter((q) => q.language === "English").length,
    Hindi: questions.filter((q) => q.language === "Hindi").length,
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen">
        {notification && (
          <ErrorMessage
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Breadcrumbs */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center text-xs text-gray-500">
          <Link
            to="/admin/dashboard"
            className="hover:text-teal-600 transition-colors"
          >
            Dashboard
          </Link>
          <FiChevronRight className="mx-2" />
          <Link
            to="/admin/manage/exam"
            className="hover:text-teal-600 transition-colors"
          >
            Manage Exam
          </Link>
          <FiChevronRight className="mx-2" />
          <span className="text-teal-700 font-semibold">
            {exam?.subject?.subject_name || "Exam"} Details
          </span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <FiBook size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {exam?.name || "Exam Details"}
              </h1>
              <p className="text-xs text-gray-500">
                Review questions and exam configuration
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/manage/exam")}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiArrowLeft /> Back to Exams
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Info Card - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiInfo className="text-teal-600" /> Exam Information
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Subject
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {exam?.subject?.subject_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Level
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {exam?.level?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Class
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {exam?.class_category?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Type
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        exam?.type === "online"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {exam?.type || "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Total Marks
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {exam?.total_marks || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <FiClock size={12} className="text-gray-400" />{" "}
                      {exam?.duration || "0"}m
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FiGlobe className="text-gray-400" /> Breakdown by Language
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLanguage("English")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                        selectedLanguage === "English"
                          ? "bg-teal-50 border-teal-200 text-teal-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      English: {questionCounts.English}
                    </button>
                    <button
                      onClick={() => setSelectedLanguage("Hindi")}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                        selectedLanguage === "Hindi"
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Hindi: {questionCounts.Hindi}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {filteredQuestions.length}
                  </span>
                  {selectedLanguage} Questions
                </h2>
                <button
                  onClick={handleAddQuestion}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <FiPlus /> Add Question
                </button>
              </div>

              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <FiBook className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">
                      No questions added yet for {selectedLanguage}.
                    </p>
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={idx}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Question Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-gray-800">
                  {editQuestion ? "Edit Question" : "Add New Question"}
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Language
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        checked={newQuestion.language === "English"}
                        onChange={() =>
                          setNewQuestion({
                            ...newQuestion,
                            language: "English",
                          })
                        }
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">English</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        checked={newQuestion.language === "Hindi"}
                        onChange={() =>
                          setNewQuestion({ ...newQuestion, language: "Hindi" })
                        }
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">Hindi</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    rows={3}
                    value={newQuestion.text}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, text: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm ${
                      formErrors.text ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter the question here..."
                  />
                  {formErrors.text && (
                    <span className="text-xs text-red-500">
                      {formErrors.text}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Options *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[idx] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm ${
                            formErrors[`option_${idx}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={`Option ${idx + 1}`}
                        />
                        {formErrors[`option_${idx}`] && (
                          <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">
                            {formErrors[`option_${idx}`]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Correct Option (1-4) *
                    </label>
                    <select
                      value={newQuestion.correct_option}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correct_option: Number(e.target.value),
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm ${
                        formErrors.correct_option
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          Option {num}
                        </option>
                      ))}
                    </select>
                    {formErrors.correct_option && (
                      <span className="text-xs text-red-500">
                        {formErrors.correct_option}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Solution / Explanation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newQuestion.solution}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        solution: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    placeholder="Explain the correct answer..."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors font-medium shadow-sm"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Saving..." : "Save Question"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamDetails;
