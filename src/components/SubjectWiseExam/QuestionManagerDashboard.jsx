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

const QuestionManagerDashboard = () => {
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

  const dispatch = useDispatch();
  const { 
    setterExamSet, 
    loading, 
    setterUser, 
    levels, 
    error 
  } = useSelector((state) => state.examQues);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  const {question} = useSelector((state)=>state.examQues);
  console.log("question",question)

  // Responsive design handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data loading
  useEffect(() => {
    dispatch(getSetterInfo());
    dispatch(getLevels());
    dispatch(getExamSets());
    
  }, [dispatch]);

  // Process categories and subjects
  useEffect(() => {
    const filtered = setterUser[0]?.class_category
      .map((cat) => ({
        ...cat,
        subjects: setterUser[0]?.subject.filter(
          (s) => s.class_category === cat.id
        ).map(subj => ({...subj})), // Create a new copy of each subject object
        totalQuestions: 0,
        pendingReviews: 0,
      }))
      .filter((item) => item.subjects.length > 0);

    // Calculate stats for each category
    if (filtered && setterExamSet) {
      filtered.forEach(category => {
        let categoryQuestions = 0;
        let categoryPending = 0;
        
        category.subjects.forEach(subject => {
          const subjectSets = setterExamSet.filter(set => set.subject.id === subject.id);
          const questionCount = subjectSets.reduce((count, set) => count + (set.questions?.length || 0), 0);
          const pendingCount = subjectSets.reduce((count, set) => 
            count + (set.questions?.filter(q => q.status === "review")?.length || 0), 0);
          
          // Update subject stats
          subject.questionCount = questionCount;
          subject.pendingCount = pendingCount;
          
          // Add to category totals
          categoryQuestions += questionCount;
          categoryPending += pendingCount;
        });
        
        category.totalQuestions = categoryQuestions;
        category.pendingReviews = categoryPending;
      });
    }

    setCategories(filtered || []);
    
    // Initialize expanded state for accordion
    if (filtered) {
      const expanded = {};
      filtered.forEach(cat => {
        expanded[cat.id] = false;
      });
      setExpandedCategories(expanded);
    }
  }, [setterUser, setterExamSet]);

  // Handlers for category/subject selection
  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const category = categories.find((cat) => cat.id === categoryId);
    setSelectedCategory(category);
    setSubjects(category?.subjects || []);
    setSelectedSubject(null);
  };

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const subject = subjects.find((sub) => sub.id === subjectId);
    setSelectedSubject(subject);
  };

  // Toggle category accordion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Exam set CRUD operations
  const onSubmit = async (data) => {
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
      setIsEditing(false);
      setEditingIndex(null);
    } catch (err) {
      toast.error("Error: " + (err.message || "Failed to save exam set"));
      console.error("Error:", err);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    const examSet = setterExamSet[index];
    Object.keys(examSet).forEach((key) => setValue(key, examSet[key]));
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


  // Question management
  const handleQuestionSubmit = async (e) => {
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
    } catch (error) {
      toast.error(error.message || "Failed to submit question");
      console.error("API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
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
        q.text.toLowerCase().includes(query) || 
        q.options.some(opt => opt.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      } else if (sortOrder === "oldest") {
        return new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at);
      } else if (sortOrder === "status") {
        const statusOrder = { draft: 1, review: 2, published: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });
    
    return filtered;
  };

  // Render helper functions
  const renderStatusBadge = (status) => {
    const statusClasses = {
      draft: "bg-gray-200 text-gray-800",
      review: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.draft}`}>
        {status === "review" ? "Under Review" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
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
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={() => {
                  reset();
                  setIsEditing(true);
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
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              selectedStatus === status 
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
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              selectedLanguage === lang 
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
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              sortOrder === option.id 
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
              {categories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No class categories or subjects assigned yet.
                </div>
              ) : (
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
          
          {/* Search and filter bar for desktop */}
          {!isEditing && !selectedExamSet && (
            <div className="hidden md:block mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Search input */}
                  <div className="flex-grow max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search questions..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filter dropdowns */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="All">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                      >
                        <option value="All">All Languages</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    
                    <div>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="status">By Status</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Exam Sets & Questions */}
          {!isEditing && !selectedExamSet ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Sets</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your exam sets and questions
                </p>
              </div>
              
              {setterExamSet && setterExamSet.length === 0 ? (
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
                        setIsEditing(true);
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
                <div className="overflow-x-auto">
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
                      {setterExamSet.map((examSet, index) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Form for creating/editing an exam set */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingIndex !== null ? "Edit Exam Set" : "Create New Exam Set"}
                  </h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              {/* create exam set */}
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
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

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      {editingIndex !== null ? "Save Changes" : "Create Exam Set"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
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
              
              {/* Question Form */}
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
                  </h3>
                </div>
                
                {/* add question */}
                <div className="p-6">
                  <form onSubmit={handleQuestionSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={currentQuestion.text}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                          className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          rows="4"
                          placeholder="Enter your question here..."
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Option {index + 1} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion({...currentQuestion, options: newOptions});
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
                            Correct Answer <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={currentQuestion.correctAnswer}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                            className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            required
                          >
                            <option value="">Select Correct Answer</option>
                            {currentQuestion.options.map((_, index) => (
                              <option key={index} value={index + 1}>Option {index + 1}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={currentQuestion.language}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, language: e.target.value})}
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
                            onChange={(e) => setCurrentQuestion({...currentQuestion, time: e.target.value})}
                            className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            placeholder="Enter time in minutes"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution <span className="text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          value={currentQuestion.solution}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, solution: e.target.value})}
                          className="w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          rows="3"
                          placeholder="Enter solution explanation..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <div className="flex mt-1">
                          <div className="flex items-center mr-4">
                            <input
                              type="radio"
                              id="status-draft"
                              name="status"
                              value="draft"
                              checked={!currentQuestion.status || currentQuestion.status === "draft"}
                              onChange={() => setCurrentQuestion({...currentQuestion, status: "draft"})}
                              className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
                            />
                            <label htmlFor="status-draft" className="ml-2 block text-sm text-gray-700">
                              Draft
                            </label>
                          </div>
                          <div className="flex items-center mr-4">
                            <input
                              type="radio"
                              id="status-review"
                              name="status"
                              value="review"
                              checked={currentQuestion.status === "review"}
                              onChange={() => setCurrentQuestion({...currentQuestion, status: "review"})}
                              className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
                            />
                            <label htmlFor="status-review" className="ml-2 block text-sm text-gray-700">
                              Submit for Review
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="status-published"
                              name="status"
                              value="published"
                              checked={currentQuestion.status === "published"}
                              onChange={() => setCurrentQuestion({...currentQuestion, status: "published"})}
                              className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
                            />
                            <label htmlFor="status-published" className="ml-2 block text-sm text-gray-700">
                              Publish
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={resetQuestionForm}
                        className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                </div>
              </div>
              
              {/* Questions List */}
              {selectedExamSet.questions && selectedExamSet.questions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions ({selectedExamSet.questions.length})
                      </h3>
                      
                      <div className="flex items-center space-x-3">
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
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    {applyFilters().length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No questions match your filters.</p>
                    ) : viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {applyFilters().map((question, index) => (
                          <div key={question.id} className="border rounded-lg overflow-hidden shadow-sm">
                            <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700">Question {index + 1}</span>
                                <span className="ml-2">{renderStatusBadge(question.status || "draft")}</span>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const questionToEdit = selectedExamSet.questions.find(q => q.id === question.id);
                                    const idx = selectedExamSet.questions.findIndex(q => q.id === question.id);
                                    setEditingQuestionIndex(idx);
                                    setCurrentQuestion({
                                      text: questionToEdit.text,
                                      options: questionToEdit.options,
                                      correctAnswer: questionToEdit.correct_option 
                                        ? String(questionToEdit.options.indexOf(questionToEdit.correct_option) + 1)
                                        : "",
                                      solution: questionToEdit.solution || "",
                                      language: questionToEdit.language || "English",
                                      time: questionToEdit.time || 0,
                                      status: questionToEdit.status || "draft",
                                    });
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-700">{question.text}</p>
                              <div className="mt-2">
                                {question?.options?.map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <span>{String.fromCharCode(65 + idx)}. {option}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <strong>Correct Answer:</strong> {question.correct_option}
                              </div>
                              <div className="mt-2">
                                <strong>Language:</strong> {question.language}
                              </div>
                              <div className="mt-2">
                                <strong>Time:</strong> {question.time} minutes
                              </div>
                              <div className="mt-2">
                                <strong>Solution:</strong> {question.solution || "N/A"}
                              </div>
                              <div className="mt-2">
                                <strong>Status:</strong> {renderStatusBadge(question.status || "draft")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
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
                                  onClick={() => {
                                    const questionToEdit = selectedExamSet.questions.find(q => q.id === question.id);
                                    const idx = selectedExamSet.questions.findIndex(q => q.id === question.id);
                                    setEditingQuestionIndex(idx);
                                    setCurrentQuestion({
                                      text: questionToEdit.text,
                                      options: questionToEdit.options,
                                      correctAnswer: questionToEdit.correct_option 
                                        ? String(questionToEdit.options.indexOf(questionToEdit.correct_option) + 1)
                                        : "",
                                      solution: questionToEdit.solution || "",
                                      language: questionToEdit.language || "English",
                                      time: questionToEdit.time || 0,
                                      status: questionToEdit.status || "draft",
                                    });
                                  }}
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