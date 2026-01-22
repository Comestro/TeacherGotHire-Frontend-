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
        const response = await getExamById(examData.id);

        setExam(response);
        setQuestions(response.questions || []);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch exam details");
        setLoading(false);
        navigate("/manage-exam");
      }
    };

    fetchExamData();
  }, [location.state, navigate]);
  const organizeQuestionsByOrder = () => {
    const maxOrder = Math.max(...questions.map((q) => q.order || 0), 0);
    const englishByOrder = Array(maxOrder + 1)
      .fill(null)
      .map(() => []);
    const hindiByOrder = Array(maxOrder + 1)
      .fill(null)
      .map(() => []);
    questions.forEach((question) => {
      const orderNum = question.order || 0;
      if (question.language === "English") {
        englishByOrder[orderNum].push(question);
      } else if (question.language === "Hindi") {
        hindiByOrder[orderNum].push(question);
      }
    });
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
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    try {
      setIsReordering(true);
      const activeQuestion = questions.find((q) => q.id === active.id);
      if (!activeQuestion) return;
      const overQuestion = questions.find((q) => q.id === over.id);
      if (!overQuestion) return;
      if (activeQuestion.language !== overQuestion.language) {
        toast.warn(
          `Cannot reorder between ${activeQuestion.language} and ${overQuestion.language} questions`
        );
        return;
      }
      const language = activeQuestion.language;
      const sameLanguageQuestions = questions
        .filter((q) => q.language === language)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const oldIndex = sameLanguageQuestions.findIndex(
        (q) => q.id === active.id
      );
      const newIndex = sameLanguageQuestions.findIndex((q) => q.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedQuestions = arrayMove(
        [...sameLanguageQuestions],
        oldIndex,
        newIndex
      );
      const updatedQuestions = reorderedQuestions.map((question, index) => ({
        ...question,
        order: index, // Use sequential index as the new order
      }));
      const orderedIds = updatedQuestions.map((q) => q.id);
      await reorderQuestions(orderedIds);
      setQuestions((prevQuestions) => {
        const newQuestions = [...prevQuestions];
        updatedQuestions.forEach((updatedQuestion) => {
          const index = newQuestions.findIndex(
            (q) => q.id === updatedQuestion.id
          );
          if (index !== -1) {
            newQuestions[index] = updatedQuestion;
          }
        });

        return newQuestions;
      });

      toast.success(`${language} questions reordered successfully`);
      await refreshExamData();
    } catch (error) {
      toast.error("Failed to reorder questions");
      await refreshExamData();
    } finally {
      setIsReordering(false);
    }
  };

  const getFilteredAndOrganizedQuestions = () => {
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

      return matchesLanguage && matchesClass && matchesSubject && matchesSearch;
    });
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
      toast.error("Failed to refresh exam data");
    }
  };

  const handleAddQuestionAt = (index) => {
    setIsModalOpen(true);
    sessionStorage.setItem("newQuestionOrder", index);
  };

  const handleSubmitQuestion = async (formData) => {
    try {
      const storedOrder = sessionStorage.getItem("newQuestionOrder");
      const orderPosition = storedOrder ? parseInt(storedOrder) : null;
      const englishQuestion = formData.english
        ? {
            language: "English",
            text: formData.english.text || "",
            solution: formData.english.solution || "",
            options: formData.english.options || [],
            correct_option: formData.english.correct_option || 1,
          }
        : null;

      const hindiQuestion = formData.hindi
        ? {
            language: "Hindi",
            text: formData.hindi.text || "",
            solution: formData.hindi.solution || "",
            options: formData.hindi.options || [],
            correct_option: formData.hindi.correct_option || 1,
          }
        : null;
      const questions = [];
      if (
        englishQuestion &&
        englishQuestion.text.trim() &&
        englishQuestion.options.length
      ) {
        questions.push(englishQuestion);
      }
      if (
        hindiQuestion &&
        hindiQuestion.text.trim() &&
        hindiQuestion.options.length
      ) {
        questions.push(hindiQuestion);
      }

      if (questions.length === 0) {
        toast.error("Please provide at least one complete question");
        return;
      }

      if (editingQuestion) {
        let updatedQuestions = [];
        if (editingQuestion.language === "English") {
          if (
            englishQuestion &&
            englishQuestion.text &&
            englishQuestion.options &&
            englishQuestion.options.length
          ) {
            updatedQuestions.push({
              language: "English",
              text: englishQuestion.text,
              solution: englishQuestion.solution,
              options: englishQuestion.options,
              correct_option: englishQuestion.correct_option,
            });
          }
        } else if (editingQuestion.language === "Hindi") {
          if (
            hindiQuestion &&
            hindiQuestion.text &&
            hindiQuestion.options &&
            hindiQuestion.options.length
          ) {
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
          questions: updatedQuestions,
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
        const payload = {
          exam: exam.id,
          ...(orderPosition !== null ? { order: orderPosition } : {}),
          questions: questions,
        };

        const response = await createNewQuestion(payload);

        if (response && response.id) {
          if (Array.isArray(response)) {
            setQuestions((prevQuestions) => [...prevQuestions, ...response]);
          } else {
            setQuestions((prevQuestions) => [...prevQuestions, response]);
          }
          toast.success(`${questions.length} question(s) created successfully`);
        }
      }
      sessionStorage.removeItem("newQuestionOrder");
      setIsModalOpen(false);
      setEditingQuestion(null);
      await refreshExamData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save question");
    }
  };
  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(questionId);
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );

        toast.success("Question deleted successfully");
        await refreshExamData();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete question");
      }
    }
  };
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
        {/* Compact Streamlined Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
          <div className="bg-teal-700 p-3 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <button
                onClick={handleBack}
                className="flex items-center text-teal-100 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-wider mb-1"
              >
                <FiArrowLeft className="mr-1" /> Back
              </button>
              <h1 className="text-lg font-bold text-white leading-tight">
                {exam.name}{" "}
                <span className="text-teal-200 font-medium">
                  ({exam.set_name || "N/A"})
                </span>
              </h1>
            </div>
            <button
              onClick={() => navigate(`/manage-exam/questions/${exam.id}/add`)}
              className="bg-white text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <FiPlus className="w-4 h-4 mr-1.5" /> Add Question
            </button>
          </div>

          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
            {/* Stats - Compact pills */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Total
              </span>
              <span className="text-sm font-bold text-gray-900">
                {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                English
              </span>
              <span className="text-sm font-bold text-gray-900">
                {englishCount}
              </span>
            </div>
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">
                Hindi
              </span>
              <span className="text-sm font-bold text-gray-900">
                {hindiCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">
                Marks
              </span>
              <span className="text-sm font-bold text-gray-900">
                {totalMarks}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <FiSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 w-40 sm:w-60"
                />
              </div>
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isFilterExpanded ||
                  selectedLanguage !== "all" ||
                  selectedClass !== "all" ||
                  selectedSubject !== "all"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiFilter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`p-1.5 rounded-lg border transition-all ${
                  showAnswers
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
                title={showAnswers ? "Hide Solutions" : "Show Solutions"}
              >
                {showAnswers ? (
                  <FiEye className="w-4 h-4" />
                ) : (
                  <FiEyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isFilterExpanded && (
            <div className="px-4 py-3 bg-white border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-dropdown">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500"
                >
                  <option value="all">All Languages</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Class Category
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Classes</option>
                  {classCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-teal-500 font-medium"
                >
                  <option value="all">All Subjects</option>
                  {subjectLevels.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Remove the separate filters section since it's now in the header */}

        {/* Questions Display Area */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {selectedLanguage === "all" &&
          selectedClass === "all" &&
          selectedSubject === "all" &&
          !searchTerm ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-4">
                {maxOrder > 0 || questions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* English Column */}
                    <div className="space-y-3">
                      <div className="bg-blue-50/50 px-3 py-2 rounded-lg flex items-center justify-between border border-blue-100/50">
                        <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center">
                          <FiGlobe className="mr-2" /> English
                        </h3>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {englishCount}
                        </span>
                      </div>
                      <SortableContext
                        items={englishByOrder
                          .flat()
                          .filter(Boolean)
                          .map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {englishByOrder.map((qs, index) => (
                            <div
                              key={`english-${index}`}
                              className="relative pl-7"
                            >
                              <div className="absolute left-0 top-3 bg-blue-100 text-blue-800 rounded w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm z-10">
                                {index + 1}
                              </div>
                              {qs.length > 0 ? (
                                <div className="space-y-2">
                                  {qs.map((question) => (
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
                              ) : (
                                <div
                                  onClick={() => handleAddQuestionAt(index + 1)}
                                  className="border-2 border-dashed border-gray-100 rounded-xl p-4 bg-gray-50/30 flex items-center justify-center min-h-[80px] cursor-pointer hover:bg-white hover:border-teal-200 transition-all group"
                                >
                                  <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-teal-500 transition-colors">
                                      Empty #{index + 1}
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
                    <div className="space-y-3">
                      <div className="bg-purple-50/50 px-3 py-2 rounded-lg flex items-center justify-between border border-purple-100/50">
                        <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center">
                          <FiBook className="mr-2" /> Hindi
                        </h3>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {hindiCount}
                        </span>
                      </div>
                      <SortableContext
                        items={hindiByOrder
                          .flat()
                          .filter(Boolean)
                          .map((q) => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {hindiByOrder.map((qs, index) => (
                            <div
                              key={`hindi-${index}`}
                              className="relative pl-7"
                            >
                              <div className="absolute left-0 top-3 bg-purple-100 text-purple-800 rounded w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm z-10">
                                {index + 1}
                              </div>
                              {qs.length > 0 ? (
                                <div className="space-y-2">
                                  {qs.map((question) => (
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
                              ) : (
                                <div
                                  onClick={() => handleAddQuestionAt(index)}
                                  className="border-2 border-dashed border-gray-100 rounded-xl p-4 bg-gray-50/30 flex items-center justify-center min-h-[80px] cursor-pointer hover:bg-white hover:border-purple-200 transition-all group"
                                >
                                  <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-purple-500 transition-colors">
                                      Empty #{index + 1}
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
                  <div className="text-center py-10">
                    {/* <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiFileText className="w-6 h-6 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      No Questions Found
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Start building your exam by adding questions.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg inline-flex items-center text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      <FiPlus className="mr-1.5" /> Add First Question
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                {questions.length === 0 ? (
                  <div className="text-center py-10">
                    <FiSearch className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      No matches found
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Try adjusting your search or filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtered Results - Grouped by Language */}
                    {["English", "Hindi"].map((lang) => {
                      const langQuestions = questions.filter(
                        (q) => q.language === lang
                      );
                      if (
                        langQuestions.length === 0 &&
                        selectedLanguage !== "all"
                      )
                        return null;

                      return (
                        <div key={lang} className="space-y-3">
                          <div
                            className={`px-3 py-2 rounded-lg flex items-center justify-between border ${
                              lang === "English"
                                ? "bg-blue-50/50 border-blue-100/50 text-blue-700"
                                : "bg-purple-50/50 border-purple-100/50 text-purple-700"
                            }`}
                          >
                            <h3 className="text-xs font-bold uppercase tracking-wider">
                              {lang}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50">
                              {langQuestions.length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {langQuestions.map((question, idx) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                index={idx}
                                showAnswers={showAnswers}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
