import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  getExamSets,
  postExamSet,
  putExamSet,
  deleteExamSet,
  postQuestionToExamSet,
  putQuestionToExamSet,
  getQuestionToExamSet,
  getSetterInfo,
  getLevels
} from "../../features/examQuesSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Loader";
import SubjectExpertHeader from "./components/SubjectExpertHeader";
import { deleteQuestion } from "../../services/adminManageExam";

// Component to add at the top of your file after imports
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-3xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button onClick={onClose} className="rounded-md bg-white text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhance the status badge renderer
const renderStatusBadge = (status) => {
  const statusClasses = {
    draft: "bg-gray-100 text-gray-800 border border-gray-200",
    review: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    published: "bg-green-50 text-green-800 border border-green-200"
  };

  const statusIcons = {
    draft: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    review: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    published: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  };

  const statusLabels = {
    draft: "Draft",
    review: "Under Review",
    published: "Published"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.draft}`}>
      {statusIcons[status]}
      {statusLabels[status] || statusLabels.draft}
    </span>
  );
};

const QuestionManagerDashboard = () => {
  // Redux selectors
  const dispatch = useDispatch();
  const { loading, setterExamSet } = useSelector((state) => state.examQues || {});
  const setterUser = useSelector((state) => state.examQues.setterInfo);
  const levels = useSelector((state) => state.examQues.levels || []);

  console.log("Levels:", levels);
  // Update these console logs to avoid undefined errors
  useEffect(() => {
    if (setterUser) {
      console.log('exam setter user response', setterUser);
    }
    if (setterExamSet) {
      console.log('exam setter response', setterExamSet);
    }
  }, [setterUser, setterExamSet]);

  // Fix the fetchData function to use proper parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        // These thunks expect no parameters or just an empty object
        await dispatch(getExamSets());
        await dispatch(getSetterInfo());
        await dispatch(getLevels());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [dispatch]);

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // State declarations
  const [selectedExamSet, setSelectedExamSet] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    solution: "",
    language: "",
    time: "",
  });
  const [examSetModalOpen, setExamSetModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [examSetSearchQuery, setExamSetSearchQuery] = useState("");
  const [examSetFilterType, setExamSetFilterType] = useState("All");
  const [examSetFilterClass, setExamSetFilterClass] = useState("All");
  const [examSetFilterLevel, setExamSetFilterLevel] = useState("All");

  // Fix the setEditingExamSet function to properly handle categories and subjects
  const setEditingExamSet = (examSet) => {
    if (!examSet) return;

    // Find the matching category from our categories list
    const matchingCategory = categories.find(cat => cat.id === examSet.class_category.id);
    if (matchingCategory) {
      setSelectedCategory(matchingCategory);
      setSubjects(matchingCategory.subjects || []);

      // Find the matching subject
      const matchingSubject = matchingCategory.subjects.find(sub => sub.id === examSet.subject.id);
      setSelectedSubject(matchingSubject || null);
    }
  };

  // Update the useEffect for processing categories and subjects
  useEffect(() => {
    if (setterUser && setterUser.length > 0) {
      // Direct access to class_category which already contains subjects
      const categoriesWithSubjects = setterUser[0]?.class_category.map(cat => ({
        ...cat,
        totalQuestions: 0,
        pendingReviews: 0
      })) || [];

      // Count questions and pending reviews for each category if setterExamSet exists
      if (categoriesWithSubjects && setterExamSet) {
        categoriesWithSubjects.forEach((category) => {
          let categoryQuestions = 0;
          let categoryPending = 0;

          // For each subject in the category, count relevant exam sets
          category.subjects.forEach((subject) => {
            const subjectSets = setterExamSet.filter(
              (set) => set.subject.id === subject.id
            );

            categoryQuestions += subjectSets.length;
            categoryPending += subjectSets.filter(
              (set) => set.status === "pending" || set.status === "review"
            ).length;
          });

          category.totalQuestions = categoryQuestions;
          category.pendingReviews = categoryPending;
        });
      }

      setCategories(categoriesWithSubjects);

      // Initialize expanded states for categories
      const expanded = {};
      categoriesWithSubjects.forEach((cat) => {
        expanded[cat.id] = false;
      });
      setExpandedCategories(expanded);
    }
  }, [setterUser, setterExamSet]);

  // Add window resize listener for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const category = categories.find((cat) => cat.id === categoryId);
    setSelectedCategory(category);

    // Subjects are already in the category.subjects array
    setSubjects(category?.subjects || []);
    setSelectedSubject(null);

    // Update form value
    setValue("class_category", categoryId.toString());
  };

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const subject = subjects.find((sub) => sub.id === subjectId);
    setSelectedSubject(subject);

    // Update form value manually after state change
    setValue("subject", e.target.value);
  };

  // Toggle category accordion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Exam set CRUD operations
  const handleExamSetModalSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        subject: parseInt(data.subject),
        level: parseInt(data.level),
        class_category: parseInt(data.class_category),
        total_marks: parseInt(data.total_marks),
        duration: parseInt(data.duration),
        type: data.type,
      };

      if (editingIndex !== null) {
        const id = setterExamSet[editingIndex].id;
        await dispatch(putExamSet({ payload, id })).unwrap();
        toast.success("Exam set updated successfully!");
      } else {
        await dispatch(postExamSet(payload)).unwrap();
        toast.success("Exam set created successfully!");
      }

      dispatch(getExamSets());
      reset();
      setEditingIndex(null);
      setExamSetModalOpen(false);
    } catch (err) {
      toast.error("Error: " + (err.message || "Failed to save exam set"));
      console.error("Error:", err);
    }
  };

  const handleEdit = (index) => {
    const examSet = setterExamSet[index];
    setEditingIndex(index);

    // Set up the form for editing
    reset();

    // First set basic values
    setValue("name", examSet.name || "");
    setValue("description", examSet.description || "");
    setValue("total_marks", examSet.total_marks || 0);
    setValue("duration", examSet.duration || 0);
    setValue("type", examSet.type || "online");

    // Find and set the category first
    const category = categories.find(cat => cat.id === examSet.class_category.id);
    if (category) {
      setSelectedCategory(category);
      setSubjects(category.subjects || []);

      // Set form values AFTER setting the state
      setTimeout(() => {
        setValue("class_category", category.id.toString());
        setValue("subject", examSet.subject.id.toString());
        setValue("level", examSet.level.id.toString());
      }, 0);
    }

    // Open the modal
    setExamSetModalOpen(true);
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this exam set?")) {
      try {
        const id = setterExamSet[index].id;
        await dispatch(deleteExamSet(id)).unwrap();
        dispatch(getExamSets());
        toast.success("Exam set deleted successfully!");
      } catch (err) {
        toast.error("Error: " + (err.message || "Failed to delete exam set"));
        console.error("Error:", err);
      }
    }
  };

  // Add a function to filter exam sets
  const filterExamSets = () => {
    if (!setterExamSet) return [];

    let filtered = [...setterExamSet];

    // Apply search filter
    if (examSetSearchQuery) {
      const query = examSetSearchQuery.toLowerCase();
      filtered = filtered.filter(
        set =>
          set.name?.toLowerCase().includes(query) ||
          set.description?.toLowerCase().includes(query) ||
          set.subject?.subject_name?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (examSetFilterType !== "All") {
      filtered = filtered.filter(set => set.type === examSetFilterType);
    }

    // Apply class filter
    if (examSetFilterClass !== "All") {
      filtered = filtered.filter(set => set.class_category.id === parseInt(examSetFilterClass));
    }

    // Apply level filter
    if (examSetFilterLevel !== "All") {
      filtered = filtered.filter(set => set.level.id === parseInt(examSetFilterLevel));
    }

    return filtered;
  };

  // Question management
  const handleQuestionModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      text: currentQuestion.text,
      options: currentQuestion.options,
      correct_option: currentQuestion.correctAnswer,
      exam: selectedExamSet.id,
      language: currentQuestion.language,
      time: parseInt(currentQuestion.time),
      status: currentQuestion.status || "draft",
      ...(currentQuestion.solution && { solution: currentQuestion.solution })
    };

    try {
      if (editingQuestionIndex !== null) {
        const questionId = selectedExamSet.questions[editingQuestionIndex].id;
        const response = await dispatch(
          putQuestionToExamSet({ questionId, payload })
        ).unwrap();
        dispatch(getQuestionToExamSet(questionId));
        setSelectedExamSet((prev) => ({
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? response : q
          ),
        }));
        toast.success("Question updated successfully!");
      } else {
        const response = await dispatch(
          postQuestionToExamSet(payload)
        ).unwrap();

        setSelectedExamSet((prev) => ({
          ...prev,
          questions: [...(prev.questions || []), response],
        }));
        toast.success("Question added successfully!");
      }

      resetQuestionForm();
      setQuestionModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to submit question");
      console.error("API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (question, index) => {
    setEditingQuestionIndex(index);

    // Find the correct answer index (1-based)
    let correctAnswerIndex = 0;
    if (question.correct_option) {
      const foundIndex = question.options.findIndex(
        opt => opt === question.correct_option
      );
      correctAnswerIndex = foundIndex >= 0 ? foundIndex + 1 : 1;
    }

    // Set current question with all required fields
    setCurrentQuestion({
      text: question.text || "",
      options: Array.isArray(question.options) ? [...question.options] : ["", "", "", ""],
      correctAnswer: correctAnswerIndex.toString(),
      solution: question.solution || "",
      language: question.language || "English",
      time: question.time || 0,
      status: question.status || "draft",
    });

    // Log for debugging
    console.log("Editing question:", question);
    console.log("Correct answer index:", correctAnswerIndex);

    // Short delay to ensure state is updated before modal opens
    setTimeout(() => {
      setQuestionModalOpen(true);
    }, 100);
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        console.log("Deleting question with ID:", questionId);
        await deleteQuestion(questionId);
        setSelectedExamSet(prev => ({
          ...prev,
          questions: prev.questions.filter(q => q.id !== questionId)
        }));
        toast.success("Question deleted successfully!");
      } catch (error) {
        toast.error("Error: " + (error.message || "Failed to delete question"));
        console.error("Error:", error);
      }
    }
  };

  // Filter and search functions
  const applyFilters = () => {
    if (!selectedExamSet?.questions) return [];

    let filtered = [...selectedExamSet.questions];

    // Apply language filter
    if (selectedLanguage !== "All") {
      filtered = filtered.filter(q => q.language === selectedLanguage);
    }

    // Apply status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter(q => q.status === selectedStatus);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.text?.toLowerCase().includes(query) ||
        q.options?.some(opt => opt?.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.updated_at || b.created_at || Date.now()) -
          new Date(a.updated_at || a.created_at || Date.now());
      } else if (sortOrder === "oldest") {
        return new Date(a.updated_at || a.created_at || Date.now()) -
          new Date(b.updated_at || b.created_at || Date.now());
      } else if (sortOrder === "status") {
        const statusOrder = { draft: 1, review: 2, published: 3 };
        return (statusOrder[a.status || 'draft'] || 0) - (statusOrder[b.status || 'draft'] || 0);
      }
      return 0;
    });

    return filtered;
  };

  // Reset functions
  const resetQuestionForm = () => {
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      solution: "",
      language: "",
      time: "",
      status: "draft",
    });
    setEditingQuestionIndex(null);
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Question Manager Dashboard</title>
      </Helmet>

      <ToastContainer position="top-right" autoClose={3000} />

      <SubjectExpertHeader />

      {/* Header Section */}
      <div className="bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Question Manager Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and add questions for assigned subjects and class categories
              </p>
            </div>

            {/* Mobile: Hamburger menu for filters */}
            <div className="md:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>

            {/* Desktop: View toggles and actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded flex items-center ${viewMode === "grid"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                  aria-label="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="ml-1 text-sm hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded flex items-center ${viewMode === "list"
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                  aria-label="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="ml-1 text-sm hidden sm:inline">Table</span>
                </button>
              </div>

              <button
                onClick={() => {
                  reset();
                  setExamSetModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Exam Set
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading && <Loader />}

          {/* Mobile: Filter drawer */}
          <AnimatePresence>
            {showFilters && isMobileView && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex"
              >
                <div className="w-4/5 ml-auto bg-white h-full p-4 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {["All", "draft", "review", "published"].map(status => (
                          <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 py-1.5 rounded-full text-sm ${selectedStatus === status
                              ? "bg-teal-100 text-teal-800 border border-teal-300"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {status === "All" ? "All" :
                              status === "review" ? "Under Review" :
                                status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <div className="flex flex-wrap gap-2">
                        {["All", "English", "Hindi"].map(lang => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-3 py-1.5 rounded-full text-sm ${selectedLanguage === lang
                              ? "bg-teal-100 text-teal-800 border border-teal-300"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "newest", label: "Newest First" },
                          { id: "oldest", label: "Oldest First" },
                          { id: "status", label: "By Status" }
                        ].map(option => (
                          <button
                            key={option.id}
                            onClick={() => setSortOrder(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm ${sortOrder === option.id
                              ? "bg-teal-100 text-teal-800 border border-teal-300"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-full py-2.5 bg-teal-600 text-white rounded-lg shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backdrop for closing filters */}
                <div
                  className="w-1/5"
                  onClick={() => setShowFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile: Floating action button */}
          {isMobileView && !isEditing && (
            <div className="fixed bottom-6 right-6 z-30">
              <button
                onClick={() => {
                  reset();
                  setIsEditing(true);
                }}
                className="h-14 w-14 rounded-full bg-teal-600 text-white shadow-lg flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}

          {/* Section 1: Assigned Subjects & Class Categories (Quick Overview Panel) */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Assigned Subjects & Classes</h2>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {!setterUser && <div className="p-6 text-center text-gray-500">
                <div className="animate-pulse">Loading categories...</div>
              </div>}

              {setterUser && categories.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No class categories or subjects assigned yet.
                </div>
              )}

              {categories.length > 0 && (
                <div className="divide-y">
                  {categories.map(category => (
                    <div key={category.id} className="overflow-hidden">
                      {/* Category Header (Accordion toggle) */}
                      <div
                        className="px-4 py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{category.name}</h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <span className="mr-3">{category.subjects?.length || 0} Subjects</span>
                              <span className="mr-3">{category.totalQuestions} Questions</span>
                              {category.pendingReviews > 0 && (
                                <span className="text-yellow-600 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {category.pendingReviews} Pending Review
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedCategories[category.id] ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Category Content (Subjects) */}
                      {expandedCategories[category.id] && (
                        <div className="pl-6 pr-4 py-3 bg-white">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {category.subjects?.map(subject => (
                              <div key={subject.id} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
                                <h4 className="font-medium text-gray-800 mb-2">{subject.subject_name}</h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">{subject.questionCount || 0} Questions</span>
                                  {subject.pendingCount > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      {subject.pendingCount} Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Search and filter bar for Exam Sets (Only show when not viewing an exam set) */}
          {!isEditing && !selectedExamSet && (
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Search input for exam sets */}
                  <div className="flex-grow max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search exam sets..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        value={examSetSearchQuery}
                        onChange={(e) => setExamSetSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter dropdowns for exam sets */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={examSetFilterType}
                        onChange={(e) => setExamSetFilterType(e.target.value)}
                      >
                        <option value="All">All Types</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>

                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={examSetFilterClass}
                        onChange={(e) => setExamSetFilterClass(e.target.value)}
                      >
                        <option value="All">All Classes</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={examSetFilterLevel}
                        onChange={(e) => setExamSetFilterLevel(e.target.value)}
                      >
                        <option value="All">All Levels</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replace the existing exam set listing with filtered results */}
          {!isEditing && !selectedExamSet ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Sets</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage your exam sets and questions
                  </p>
                </div>

                <button
                  onClick={() => {
                    reset();
                    setExamSetModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Exam Set
                </button>
              </div>

              {filterExamSets().length === 0 ? (
                <div className="p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No exam sets</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new exam set.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setExamSetModalOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Exam Set
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile List View - Update to use filterExamSets() */}
                  <div className="md:hidden">
                    <ul className="divide-y divide-gray-200">
                      {filterExamSets().map((examSet, index) => (
                        <li key={examSet.id} className="px-4 py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{examSet.subject.subject_name}</h4>
                              <p className="text-sm text-gray-500 mt-1">{examSet.description}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {examSet.type}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {examSet.questions?.length || 0} Questions
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => setSelectedExamSet(examSet)}
                                className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                              >
                                Manage
                              </button>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEdit(index)}
                                  className="p-1.5 rounded-full bg-gray-100 text-indigo-600 hover:bg-gray-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(index)}
                                  className="p-1.5 rounded-full bg-gray-100 text-red-600 hover:bg-gray-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="mr-2">Class:</span>
                              <span className="font-medium text-gray-700">{examSet.class_category.name}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="mr-2">Level:</span>
                              <span className="font-medium text-gray-700">{examSet.level.name}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desktop Table View - Update to use filterExamSets() */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Exam Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Questions
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filterExamSets().length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No exam sets found matching your search criteria.
                            </td>
                          </tr>
                        ) : (
                          filterExamSets().map((examSet, index) => (
                            <tr key={examSet.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{examSet.subject.subject_name}</div>
                                <div className="text-sm text-gray-500">{examSet.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{examSet.class_category.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{examSet.level.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {examSet.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {examSet.questions?.length || 0} Questions
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <button
                                  onClick={() => setSelectedExamSet(examSet)}
                                  className="text-teal-600 hover:text-teal-900 mr-3"
                                >
                                  Manage Questions
                                </button>
                                <button
                                  onClick={() => handleEdit(index)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* Exam Set Modal */}
          <Modal
            isOpen={examSetModalOpen}
            onClose={() => {
              setExamSetModalOpen(false);
              setEditingIndex(null);
              reset();
            }}
            title={editingIndex !== null ? "Edit Exam Set" : "Create New Exam Set"}
          >
            <form onSubmit={handleSubmit(handleExamSetModalSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("class_category", { required: "Class category is required" })}
                    id="category"
                    onChange={handleCategoryChange}
                    value={selectedCategory?.id || ""}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.class_category && (
                    <p className="mt-1 text-sm text-red-600">{errors.class_category.message}</p>
                  )}
                </div>

                {selectedCategory && (
                  <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("subject", { required: "Subject is required" })}
                      id="subject"
                      onChange={handleSubjectChange}
                      value={selectedSubject?.id || ""}
                      className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("level", { required: "Level is required" })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="">Select a Level</option>
                    {levels.map((lev) => (
                      <option key={lev.id} value={lev.id}>
                        {lev.name}
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("type", { required: "Type is required" })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("total_marks", { required: "Total marks is required" })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  />
                  {errors.total_marks && (
                    <p className="mt-1 text-sm text-red-600">{errors.total_marks.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("duration", { required: "Duration is required" })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows="3"
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Enter exam set description..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setExamSetModalOpen(false);
                    setEditingIndex(null);
                    reset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                >
                  {editingIndex !== null ? "Save Changes" : "Create Exam Set"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Question Modal */}
          <Modal
            isOpen={questionModalOpen}
            onClose={() => {
              setQuestionModalOpen(false);
              resetQuestionForm();
            }}
            title={editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
          >
            <form onSubmit={handleQuestionModalSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  rows="4"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${currentQuestion.correctAnswer === (index + 1).toString() ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Option {index + 1} <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`correct-option-${index}`}
                          name="correctAnswer"
                          value={index + 1}
                          checked={currentQuestion.correctAnswer === (index + 1).toString()}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
                        />
                        <label htmlFor={`correct-option-${index}`} className="ml-2 block text-sm text-gray-700">
                          Correct
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                      className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      placeholder={`Enter option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentQuestion.language}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, language: e.target.value })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentQuestion.time}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, time: e.target.value })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Enter time in minutes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentQuestion.status || "draft"}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, status: e.target.value })}
                    className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Submit for Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solution <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={currentQuestion.solution}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, solution: e.target.value })}
                  className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  rows="3"
                  placeholder="Enter solution explanation..."
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionModalOpen(false);
                    resetQuestionForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : editingQuestionIndex !== null ? (
                    "Update Question"
                  ) : (
                    "Add Question"
                  )}
                </button>
              </div>
            </form>
          </Modal>

          {/* Question Management Area */}
          {selectedExamSet && (
            <div className="space-y-6">
              {/* Exam Set Header */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedExamSet.subject.subject_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedExamSet.class_category.name} | Level: {selectedExamSet.level.name} | Type: {selectedExamSet.type}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedExamSet(null);
                      resetQuestionForm();
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back to Exam Sets
                  </button>
                </div>
              </div>

              {/* Floating Action Button for Mobile */}
              {selectedExamSet && isMobileView && (
                <div className="fixed bottom-6 right-6 z-30">
                  <button
                    onClick={() => {
                      resetQuestionForm();
                      setQuestionModalOpen(true);
                    }}
                    className="h-14 w-14 rounded-full bg-teal-600 text-white shadow-lg flex items-center justify-center"
                    aria-label="Add new question"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Improved Empty State for Questions */}
              {selectedExamSet && (!selectedExamSet.questions || selectedExamSet.questions.length === 0) && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                  </div>
                  <div className="p-10 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-medium text-gray-900 mb-2">No Questions Yet</h4>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Start building your exam by adding questions. You can add multiple-choice questions with explanations.
                    </p>
                    <button
                      onClick={() => setQuestionModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Question
                    </button>
                  </div>
                </div>
              )}

              {/* When viewing questions for an exam set, show the question search/filter */}
              {selectedExamSet && selectedExamSet.questions && selectedExamSet.questions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-4">
                  <div className="px-4 sm:px-6 py-4">
                    {/* Desktop: Full search bar and filters in one row */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search questions..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors duration-200"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Desktop filter controls */}
                      <div className="flex items-center space-x-3">
                        <div className="relative inline-block text-left">
                          <select
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm font-medium text-gray-700"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                          >
                            <option value="All">All Languages</option>
                            {["English", "Hindi"].map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div className="relative inline-block text-left">
                          <select
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm font-medium text-gray-700"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                          >
                            <option value="All">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="review">Under Review</option>
                            <option value="published">Published</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div className="relative inline-block text-left">
                          <select
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm font-medium text-gray-700"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="status">By Status</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile: Search and filter toggle */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search questions..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="ml-3 inline-flex items-center px-3 py-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                          Filter
                        </button>
                      </div>

                      {/* Mobile filters - collapsible */}
                      <AnimatePresence>
                        {showFilters && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 pb-3 space-y-3 border-t border-gray-200">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                <div className="flex flex-wrap gap-2">
                                  {["All", "English", "Hindi"].map(lang => (
                                    <button
                                      key={lang}
                                      onClick={() => setSelectedLanguage(lang)}
                                      className={`px-3 py-2 rounded-full text-sm ${selectedLanguage === lang
                                        ? "bg-teal-100 text-teal-800 border border-teal-300 font-medium"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                    >
                                      {lang}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { value: "All", label: "All" },
                                    { value: "draft", label: "Draft" },
                                    { value: "review", label: "Under Review" },
                                    { value: "published", label: "Published" }
                                  ].map(status => (
                                    <button
                                      key={status.value}
                                      onClick={() => setSelectedStatus(status.value)}
                                      className={`px-3 py-2 rounded-full text-sm ${selectedStatus === status.value
                                        ? "bg-teal-100 text-teal-800 border border-teal-300 font-medium"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                    >
                                      {status.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { value: "newest", label: "Newest First" },
                                    { value: "oldest", label: "Oldest First" },
                                    { value: "status", label: "By Status" }
                                  ].map(option => (
                                    <button
                                      key={option.value}
                                      onClick={() => setSortOrder(option.value)}
                                      className={`px-3 py-2 rounded-full text-sm ${sortOrder === option.value
                                        ? "bg-teal-100 text-teal-800 border border-teal-300 font-medium"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Active filters display - both mobile and desktop */}
                    {(selectedLanguage !== "All" || selectedStatus !== "All" || searchQuery) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500 mr-1">Active filters:</span>

                        {searchQuery && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Search: {searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery}
                            <button
                              onClick={() => setSearchQuery("")}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}

                        {selectedLanguage !== "All" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            Language: {selectedLanguage}
                            <button
                              onClick={() => setSelectedLanguage("All")}
                              className="ml-1 text-teal-600 hover:text-teal-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}

                        {selectedStatus !== "All" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            Status: {selectedStatus === "draft" ? "Draft" : selectedStatus === "review" ? "Under Review" : "Published"}
                            <button
                              onClick={() => setSelectedStatus("All")}
                              className="ml-1 text-teal-600 hover:text-teal-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedLanguage("All");
                            setSelectedStatus("All");
                          }}
                          className="text-xs text-teal-600 hover:text-teal-800 hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Questions List */}
              {selectedExamSet.questions && selectedExamSet.questions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions ({applyFilters().length}/{selectedExamSet.questions.length})
                      </h3>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* View toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-md">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded flex items-center ${viewMode === "grid"
                              ? "bg-white text-teal-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                              }`}
                            aria-label="Grid view"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span className="ml-1 text-sm hidden sm:inline">Cards</span>
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded flex items-center ${viewMode === "list"
                              ? "bg-white text-teal-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                              }`}
                            aria-label="List view"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="ml-1 text-sm hidden sm:inline">Table</span>
                          </button>
                        </div>

                        <select
                          className="text-sm border-gray-300 rounded-md"
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                          <option value="All">All Languages</option>
                          {["English", "Hindi"].map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>

                        <select
                          className="text-sm border-gray-300 rounded-md"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="All">All Statuses</option>
                          <option value="draft">Draft</option>
                          <option value="review">Under Review</option>
                          <option value="published">Published</option>
                        </select>

                        <button
                          onClick={() => {
                            resetQuestionForm();
                            setQuestionModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    {applyFilters().length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No questions match your filters.</p>
                    ) : (
                      <>
                        {viewMode === "grid" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {applyFilters().map((question, index) => (
                              <div key={question.id}
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                                <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-700 mr-2">Question {index + 1}</span>
                                    {renderStatusBadge(question.status || "draft")}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditQuestion(question, index)}
                                      className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                      aria-label="Edit question"
                                      title="Edit question"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(question.id)}
                                      className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                      aria-label="Delete question"
                                      title="Delete question"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <p className="text-gray-700 mb-3 line-clamp-2">{question.text}</p>
                                  <div className="space-y-1.5 mb-3">
                                    {question?.options?.map((option, idx) => (
                                      <div key={idx}
                                        className={`flex items-center p-2 rounded ${option === question.correct_option ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${option === question.correct_option ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                          {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="line-clamp-1">{option}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                                    <div><span className="text-gray-500">Language:</span> {question.language}</div>
                                    <div><span className="text-gray-500">Time:</span> {question.time} min</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {viewMode === "list" && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Question
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Language
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {applyFilters().map((question, index) => (
                                  <tr key={question.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {question.text}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {question.language}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {renderStatusBadge(question.status || "draft")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <button
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        onClick={() => handleEditQuestion(question, index)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-red-600 hover:text-red-900"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionManagerDashboard;