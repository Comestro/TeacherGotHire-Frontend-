import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  FiAlertTriangle,
  FiLink,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import BulkUploadModal from "./componets/BulkUploadModal";
import DeleteConfirmationModal from "./componets/DeleteConfirmationModal";

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
  const { examId: routeExamId } = useParams();
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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [showOrphans, setShowOrphans] = useState(false);
  
  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState({ question: null, pair: null });

  // Use location.state first, fall back to URL param for direct navigation
  const examId = location.state?.exam?.id || routeExamId;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Support both state-based and URL param-based navigation
        const resolvedExamId = location.state?.exam?.id || routeExamId;
        if (!resolvedExamId) {
          navigate("/manage-exam");
          return;
        }
        const response = await getExamById(resolvedExamId);

        setExam(response);
        setQuestions(response.questions || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        navigate("/manage-exam");
      }
    };

    fetchExamData();
  }, [location.state, routeExamId, navigate]);
  const organizeQuestionsByOrder = () => {
    // Get all unique order values and sort them
    const uniqueOrders = [...new Set(questions.map((q) => q.order || 0))].sort((a, b) => a - b);
    
    const englishByOrder = uniqueOrders.map(() => []);
    const hindiByOrder = uniqueOrders.map(() => []);
    
    // Map the actual order value to its index in our compressed list
    const orderToIndexMap = {};
    uniqueOrders.forEach((val, idx) => {
      orderToIndexMap[val] = idx;
    });

    questions.forEach((question) => {
      const orderValue = question.order || 0;
      const index = orderToIndexMap[orderValue];
      
      if (question.language === "English") {
        englishByOrder[index].push(question);
      } else if (question.language === "Hindi") {
        hindiByOrder[index].push(question);
      }
    });

    return {
      englishByOrder,
      hindiByOrder,
      maxOrder: uniqueOrders.length - 1,
    };
  };

  const getSubjectName = () => {
    return (
      exam?.subject?.subject_name ||
      exam?.subject_name ||
      location.state?.exam?.subject_name ||
      ""
    );
  };

  const isLanguageSubject = () => {
    const lowerName = getSubjectName().toLowerCase();
    const nativeLanguages = [
      "english", "hindi", "urdu", "sanskrit", "bengali", 
      "marathi", "telugu", "tamil", "gujarati", "kannada", 
      "malayalam", "punjabi", "odia", "assamese", "maithili", 
      "santali", "kashmiri", "nepali", "konkani", "sindhi", 
      "dogri", "manipuri", "bodo", "japanese", "french", 
      "german", "spanish"
    ];
    return nativeLanguages.some((lang) => lowerName.includes(lang));
  };

  const getSubjectLanguage = () => {
    const lowerName = getSubjectName().toLowerCase();
    if (lowerName.includes("hindi")) return "Hindi";
    if (lowerName.includes("english")) return "English";
    return "English"; // Default
  };

  // Detect orphan/unlinked questions
  const orphanQuestions = useMemo(() => {
    if (isLanguageSubject()) return []; // Language subjects don't need pairs
    const orphans = [];
    const englishByOrder = {};
    const hindiByOrder = {};

    questions.forEach((q) => {
      const order = q.order;
      if (order === null || order === undefined) {
        orphans.push({ ...q, reason: "No order assigned" });
        return;
      }
      if (q.language === "English") {
        if (!englishByOrder[order]) englishByOrder[order] = [];
        englishByOrder[order].push(q);
      } else if (q.language === "Hindi") {
        if (!hindiByOrder[order]) hindiByOrder[order] = [];
        hindiByOrder[order].push(q);
      } else {
        orphans.push({ ...q, reason: `Unknown language: ${q.language}` });
      }
    });

    // Find orders with duplicates in the same language
    Object.entries(englishByOrder).forEach(([order, qs]) => {
      if (qs.length > 1) {
        qs.forEach((q) => orphans.push({ ...q, reason: `Duplicate English at order #${Number(order)+1}` }));
      }
    });
    Object.entries(hindiByOrder).forEach(([order, qs]) => {
      if (qs.length > 1) {
        qs.forEach((q) => orphans.push({ ...q, reason: `Duplicate Hindi at order #${Number(order)+1}` }));
      }
    });

    // Find unpaired orders (English without Hindi or vice-versa)
    const allOrders = new Set([...Object.keys(englishByOrder), ...Object.keys(hindiByOrder)]);
    allOrders.forEach((order) => {
      const hasEn = englishByOrder[order]?.length === 1;
      const hasHi = hindiByOrder[order]?.length === 1;
      if (hasEn && !hasHi) {
        orphans.push({ ...englishByOrder[order][0], reason: `Missing Hindi pair at order #${Number(order)+1}` });
      } else if (hasHi && !hasEn) {
        orphans.push({ ...hindiByOrder[order][0], reason: `Missing English pair at order #${Number(order)+1}` });
      }
    });

    // Deduplicate by id
    const seen = new Set();
    return orphans.filter((q) => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });
  }, [questions, exam]);

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
        toast.warn(`Cannot reorder between ${activeQuestion.language} and ${overQuestion.language} questions`);
        return;
      }

      const language = activeQuestion.language;

      // 1. Group existing questions into clean "slots" based on current order
      // This helps resolve duplicates (multiple questions with same order)
      const { englishByOrder, hindiByOrder } = organizeQuestionsByOrder();
      const maxSlots = Math.max(englishByOrder.length, hindiByOrder.length);
      const slots = [];
      
      for (let i = 0; i < maxSlots; i++) {
        const ens = englishByOrder[i] || [];
        const his = hindiByOrder[i] || [];
        const subLen = Math.max(ens.length, his.length);
        
        // If a slot has multiple questions in one language, split them into separate slots
        // to fix the "2 questions in one order" issue during reorder
        for (let j = 0; j < subLen; j++) {
          slots.push({
            en: ens[j] || null,
            hi: his[j] || null
          });
        }
      }

      // 2. Find the index of the slot containing our active/over questions
      const activeIdx = slots.findIndex(s => (language === "English" ? s.en?.id : s.hi?.id) === active.id);
      const overIdx = slots.findIndex(s => (language === "English" ? s.en?.id : s.hi?.id) === over.id);

      if (activeIdx === -1 || overIdx === -1) return;

      // 3. Perform the move
      const updatedSlots = arrayMove([...slots], activeIdx, overIdx);

      // 4. Assign new sequential orders 0..N
      const updatedQuestions = [];
      const englishIDs = [];
      const hindiIDs = [];

      updatedSlots.forEach((slot, index) => {
        if (slot.en) {
          updatedQuestions.push({ ...slot.en, order: index });
          englishIDs.push(slot.en.id);
        }
        if (slot.hi) {
          updatedQuestions.push({ ...slot.hi, order: index });
          hindiIDs.push(slot.hi.id);
        }
      });

      // 5. Send reordered IDs to backend for BOTH columns if they exist
      // Backend reorder helper typically assigns 0..N to the given IDs
      if (englishIDs.length > 0) await reorderQuestions(englishIDs);
      if (hindiIDs.length > 0) await reorderQuestions(hindiIDs);

      setQuestions(updatedQuestions);
      toast.success(`${language} questions reordered and synchronized`);
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
      (q) => q.language === "English",
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

      // Derive what to save directly from what the modal sent
      const hasEnglish = formData.english && formData.english.text?.trim();
      const hasHindi = formData.hindi && formData.hindi.text?.trim();
      const isSingleLang = hasEnglish !== hasHindi; // XOR — only one provided

      const englishQuestion = hasEnglish
        ? {
            language: formData.english.language || "English",
            text: formData.english.text || "",
            solution: formData.english.solution || "",
            options: formData.english.options || [],
            correct_option: formData.english.correct_option || 1,
          }
        : null;

      const hindiQuestion = hasHindi
        ? {
            language: "Hindi",
            text: formData.hindi.text || "",
            solution: formData.hindi.solution || "",
            options: formData.hindi.options || [],
            correct_option: formData.hindi.correct_option || 1,
          }
        : null;

      // Build questionsToSave from what was actually provided
      const questionsToSave = [];
      if (englishQuestion && englishQuestion.text.trim()) {
        questionsToSave.push(englishQuestion);
      }
      if (hindiQuestion && hindiQuestion.text.trim()) {
        questionsToSave.push(hindiQuestion);
      }

      if (questionsToSave.length === 0) {
        toast.error("Please provide at least one complete question");
        return;
      }

      const currentOrder = editingQuestion?.order;
      const existingEnglishId = (currentOrder !== undefined && currentOrder !== null)
        ? (editingQuestion.language === "English" 
            ? editingQuestion.id 
            : questions.find(q => q.order === currentOrder && q.language === "English")?.id)
        : null;
      const existingHindiId = (currentOrder !== undefined && currentOrder !== null)
        ? (editingQuestion.language === "Hindi" 
            ? editingQuestion.id 
            : questions.find(q => q.order === currentOrder && q.language === "Hindi")?.id)
        : null;

      if (editingQuestion) {
        let updatedQuestions = [];

        if (isSingleLang) {
          // Single language mode: send only the provided question with its direct ID
          const questionData = questionsToSave[0];
          updatedQuestions.push({
            id: editingQuestion.id,
            ...questionData,
          });
        } else {
          // Both mode: send/preserve the pair
          // English Part
          if (englishQuestion && englishQuestion.text.trim()) {
            updatedQuestions.push({
              ...(existingEnglishId ? { id: existingEnglishId } : {}),
              ...englishQuestion,
            });
          } else if (existingEnglishId) {
            const originalEn = questions.find(q => q.id === existingEnglishId);
            if (originalEn) updatedQuestions.push(originalEn);
          }

          // Hindi Part
          const hindiHasContent = hindiQuestion &&
            hindiQuestion.text.trim() &&
            hindiQuestion.options.some(opt => opt && opt.trim() !== "");

          if (hindiHasContent) {
            updatedQuestions.push({
              ...(existingHindiId ? { id: existingHindiId } : {}),
              ...hindiQuestion,
            });
          } else if (existingHindiId) {
            const originalHi = questions.find(q => q.id === existingHindiId);
            if (originalHi) updatedQuestions.push(originalHi);
          }
        }

        const payload = {
          exam: exam.id,
          questions: updatedQuestions,
        };

        // Use the English ID in the URL for paired updates if it exists
        const updateUrlId = (!isSingleLang && existingEnglishId) || editingQuestion.id;
        const response = await updateNewQuestion(updateUrlId, payload);

        if (response) {
          setQuestions((prevQuestions) =>
            prevQuestions.map((q) => {
              if (response.english_data && q.id === response.english_data.id) {
                return response.english_data;
              }
              if (response.hindi_data && q.id === response.hindi_data.id) {
                return response.hindi_data;
              }
              return q;
            }),
          );
          toast.success("Question updated successfully");
        }
      } else {
        // Create Logic
        const payload = {
          exam: exam.id,
          ...(orderPosition !== null ? { order: orderPosition } : {}),
          questions: questionsToSave,
        };

        const response = await createNewQuestion(payload);

        if (response) {
          const newQuestions = [];
          if (response.english_data) newQuestions.push(response.english_data);
          if (response.hindi_data) newQuestions.push(response.hindi_data);

          if (newQuestions.length > 0) {
            setQuestions((prevQuestions) => [...prevQuestions, ...newQuestions]);
          }
          toast.success(`Question(s) created successfully`);
        }
      }

      sessionStorage.removeItem("newQuestionOrder");
      setIsModalOpen(false);
      setEditingQuestion(null);
      await refreshExamData();
    } catch (error) {
      console.error("Question save error:", error?.response?.data || error);

      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = [];
        if (errorData.hindi_errors) errorMessages.push(`Hindi: ${errorData.hindi_errors}`);
        if (errorData.english_errors) errorMessages.push(`English: ${errorData.english_errors}`);
        if (errorData.error) errorMessages.push(errorData.error);
        if (errorData.message) errorMessages.push(errorData.message);

        if (errorMessages.length > 0) {
          errorMessages.forEach(msg => toast.error(msg));
        } else {
          const allErrors = Object.entries(errorData)
            .filter(([k, v]) => typeof v === 'string')
            .map(([k, v]) => `${k}: ${v}`);
          if (allErrors.length > 0) {
            allErrors.forEach(msg => toast.error(msg));
          } else {
            toast.error("Failed to save question due to a validation error");
          }
        }
      } else {
        toast.error("Failed to save question. Please check your connection.");
      }
    }
  };
  const handleDelete = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Look for a pair
    const otherLang = question.language === "English" ? "Hindi" : "English";
    const pair = questions.find(q => 
      (q.order === question.order && q.language === otherLang && q.id !== question.id) ||
      (q.related_question === question.id || question.related_question === q.id)
    );

    if (pair) {
      setDeleteContext({ question, pair });
      setIsDeleteModalOpen(true);
    } else {
      if (window.confirm("Are you sure you want to delete this question?")) {
        executeDeletion('single', question, null);
      }
    }
  };

  const executeDeletion = async (mode, question, pair) => {
    try {
      if (mode === 'both' && pair) {
        await Promise.all([
          deleteQuestion(question.id),
          deleteQuestion(pair.id)
        ]);
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== question.id && q.id !== pair.id),
        );
        toast.success("Both questions deleted successfully");
      } else if (mode === 'single_english' || (mode === 'single' && question.language === 'English')) {
        const targetId = mode === 'single_english' ? (question.language === 'English' ? question.id : pair?.id) : question.id;
        if (!targetId) return;
        await deleteQuestion(targetId);
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== targetId));
        toast.success("English version deleted successfully");
      } else if (mode === 'single_hindi' || (mode === 'single' && question.language === 'Hindi')) {
        const targetId = mode === 'single_hindi' ? (question.language === 'Hindi' ? question.id : pair?.id) : question.id;
        if (!targetId) return;
        await deleteQuestion(targetId);
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== targetId));
        toast.success("Hindi version deleted successfully");
      } else {
        // Fallback for generic 'single' if mode was set differently
        await deleteQuestion(question.id);
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== question.id));
        toast.success("Question deleted successfully");
      }
      
      setIsDeleteModalOpen(false);
      setDeleteContext({ question: null, pair: null });
      await refreshExamData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete question");
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
  const orphanCount = orphanQuestions.length;

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
              <div className="flex gap-2">
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="bg-teal-600 text-white hover:bg-teal-500 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold uppercase tracking-wider shadow-sm transition-all border border-teal-500"
                >
                  <FiFileText className="w-4 h-4 mr-1.5" /> Bulk Upload
                </button>
                <button
                  onClick={() =>
                    navigate(`/manage-exam/questions/${exam.id}/add`)
                  }
                  className="bg-white text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  <FiPlus className="w-4 h-4 mr-1.5" /> Add Question
                </button>
              </div>
            </div>

            <QuestionModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditingQuestion(null);
              }}
              onSubmit={handleSubmitQuestion}
              examId={examId}
              editingQuestion={editingQuestion}
              isLanguageSubjectProp={isLanguageSubject()}
              subjectNameProp={getSubjectName()}
            />

            <DeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onDelete={(mode) => executeDeletion(mode, deleteContext.question, deleteContext.pair)}
              question={deleteContext.question}
              pair={deleteContext.pair}
            />

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

            {/* Orphan indicator */}
            {orphanCount > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <button
                  onClick={() => setShowOrphans(!showOrphans)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${
                    showOrphans
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100"
                  }`}
                >
                  <FiAlertTriangle className="w-3 h-3" />
                  {orphanCount} Issues
                </button>
              </div>
            )}

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

        {/* Orphan/Unlinked Questions Panel */}
        {showOrphans && orphanQuestions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 mb-4 overflow-hidden">
            <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Question Issues ({orphanQuestions.length})
                </h3>
              </div>
              <button
                onClick={() => setShowOrphans(false)}
                className="text-amber-400 hover:text-amber-600 p-1"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-amber-50">
              {orphanQuestions.map((q) => (
                <div
                  key={`orphan-${q.id}`}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      q.language === "English"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}>
                      {q.language}
                    </span>
                    <span className="text-xs text-gray-700 truncate font-medium">
                      {q.text?.substring(0, 80)}{q.text?.length > 80 ? "..." : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      {q.reason}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ID: {q.id}
                    </span>
                    <button
                      onClick={() => handleEdit(q)}
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                        (q) => q.language === lang,
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

        <BulkUploadModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          examId={examId}
          onUploadSuccess={refreshExamData}
          subjectName={exam?.subject?.subject_name}
        />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ManageQuestion;
