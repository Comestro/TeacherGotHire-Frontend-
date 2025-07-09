import React, { useEffect, useState, useMemo } from 'react';
import { fetchLevel } from '../../services/examServices';
import { getExam } from '../../services/adminManageExam';
import { useSelector } from 'react-redux';
import { FiPlus, FiBook, FiFileText, FiSearch, FiFilter, FiX, FiLayers, FiBookOpen } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamSetsTable from './componets/ExamSetsTable';
import ExamSetterModal from './componets/ExamSetterModal';
import QuestionModal from './componets/QuestionModal';

const ManageExam = () => {
  const [level, setLevel] = useState([]);
  const [examSets, setExamSets] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    set_name: '',
    description: '',
    subject: '',
    level: '',
    class_category: '',
    total_marks: '',
    duration: '',
    type: 'online'
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCopying, setIsCopying] = useState(false);

  const setterUser = useSelector((state) => state.examQues.setterInfo);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedClassCategory, setSelectedClassCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all'); // Add level filter
  
  // Add these new states to manage question addition
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [examForQuestions, setExamForQuestions] = useState(null);
  
  // Separate useEffect for fetching levels - runs only once
  useEffect(() => {
    const getLevels = async () => {
      try {
        const response = await fetchLevel();
        setLevel(response);
      } catch (error) {
        console.log(error);
      }
    };
    
    getLevels();
  }, []);
  
  // Updated useEffect for exam sets - now depends on refreshTrigger
  useEffect(() => {
    const fetchExamSets = async () => {
      try {
        setLoading(true);
        const response = await getExam();
        setExamSets(response);
        console.log("Fetched exam sets:", response);
      } catch (error) {
        toast.error('Failed to fetch exam sets');
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamSets();
  }, [refreshTrigger]); // This will re-run when refreshTrigger changes

  // Get class categories and subjects from setterUser - Fix the subject extraction
  const classCategories = setterUser?.[0]?.class_category || [];

  // Improved subject extraction
  const getSubjects = () => {
    // Create an array of all subjects from all class categories
    let allSubjects = [];
    
    // Go through each class category
    classCategories.forEach(category => {
      // If the category has subjects, add them to our array
      if (category.subjects && Array.isArray(category.subjects)) {
        // Add class identifier to each subject to help user know which class it belongs to
        const subjectsWithClass = category.subjects.map(subject => ({
          ...subject,
          displayName: `${category.name} - ${subject.subject_name}` // Add class name prefix
        }));
        allSubjects = [...allSubjects, ...subjectsWithClass];
      }
    });
    
    return allSubjects;
  };

  // Get all subjects
  const subjects = getSubjects();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopyExam = (exam) => {
    setIsCopying(true);
    // Clone the exam data but change the name to indicate it's a copy
    const newName = `${exam.name || exam.description} (Copy)`;
    setFormData({
      set_name: newName,
      description: exam.description,
      subject: exam.subject.id.toString(),
      level: exam.level.id.toString(),
      class_category: exam.class_category.id.toString(),
      total_marks: exam.total_marks,
      duration: exam.duration,
      type: exam.type
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      set_name: '',
      description: '',
      subject: '',
      level: '',
      class_category: '',
      total_marks: '',
      duration: '',
      type: 'online'
    });
    setIsModalOpen(false);
    setEditingExam(null);
    setIsCopying(false);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      set_name: exam.name || '', // Add the set name from exam
      description: exam.description,
      subject: exam.subject.id.toString(),
      level: exam.level.id.toString(),
      class_category: exam.class_category.id.toString(),
      total_marks: exam.total_marks,
      duration: exam.duration,
      type: exam.type
    });
    setIsModalOpen(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam set?')) {
      setExamSets(prev => prev.filter(exam => exam.id !== examId));
      toast.success('Exam deleted successfully!');
    }
  };

  // Function to handle adding questions at a specific position
  const handleAddQuestionAt = (exam, index) => {
    setExamForQuestions(exam);
    setIsQuestionModalOpen(true);
    // Store the target position for when we create the new question
    sessionStorage.setItem('newQuestionOrder', index);
  };

  // Function to handle submitting a new question
  const handleSubmitQuestion = async (formData) => {
    try {
      setLoading(true);
      
      // Get stored order position if available
      const storedOrder = sessionStorage.getItem('newQuestionOrder');
      const orderPosition = storedOrder ? parseInt(storedOrder) : null;
      
      // Create payload with exam ID and order (if available)
      const payload = {
        ...formData,
        exam: examForQuestions.id,
        ...(orderPosition !== null ? { order: orderPosition } : {})
      };
      
      const response = await createQuestion(payload);
      
      if (response && response.id) {
        toast.success("Question added successfully!");
        // Refresh the exam list to show updated question count
        setRefreshTrigger(prev => prev + 1);
      }
      
      // Clear the stored order after use
      sessionStorage.removeItem('newQuestionOrder');
      setIsQuestionModalOpen(false);
      setExamForQuestions(null);
      
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(error.response?.data?.message || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  // Update handleAddQuestions function
  const handleAddQuestions = (examId, position = null) => {
    const exam = examSets.find(exam => exam.id === examId);
    if (exam) {
      if (position !== null) {
        // Add a question at a specific position
        handleAddQuestionAt(exam, position);
      } else {
        // Navigate to the questions page without specifying a position
        navigate(`/manage-exam/questions/${examId}/add`);
      }
    } else {
      toast.error("Exam not found");
    }
  };

  // Enhanced handleExamCreated function to show more feedback
  const handleExamCreated = (newExam) => {
    console.log("New exam created:", newExam);
    toast.success('Exam created successfully!');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setIsModalOpen(false); // Close modal after success
    setIsCopying(false); // Reset copying state
  };

  // Enhanced handleExamUpdated function
  const handleExamUpdated = (updatedExam) => {
    console.log("Exam updated:", updatedExam);
    toast.success('Exam updated successfully!');
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setIsModalOpen(false); // Close modal after success
  };

  // Get filtered subjects based on selected class category - similar to ExamSetterModal
  const filteredSubjects = useMemo(() => {
    if (selectedClassCategory === 'all') return [];
    
    const selectedCategory = classCategories.find(
      cat => cat.id.toString() === selectedClassCategory
    );
    
    return selectedCategory?.subjects || [];
  }, [selectedClassCategory, classCategories]);

  // Handle class category change
  const handleClassCategoryChange = (e) => {
    setSelectedClassCategory(e.target.value);
    // Reset subject when class category changes
    setSelectedSubject('all');
  };

  const getFilteredExams = () => {
    return examSets.filter(exam => {
      // Search filter for name and description
      const matchesSearch = searchTerm === '' || 
        (exam.name && exam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Class category filter
      const matchesClassCategory = selectedClassCategory === 'all' || 
        (exam.class_category && exam.class_category.id.toString() === selectedClassCategory);
      
      // Subject filter - now depends on class category
      const matchesSubject = selectedSubject === 'all' || 
        (exam.subject && exam.subject.id.toString() === selectedSubject);
      
      // Level filter
      const matchesLevel = selectedLevel === 'all' ||
        (exam.level && exam.level.id.toString() === selectedLevel);
      
      // Exam type filter
      const matchesType = selectedType === 'all' || 
        (exam.type && exam.type === selectedType);
      
      return matchesSearch && matchesClassCategory && matchesSubject && matchesLevel && matchesType;
    });
  };

  const filteredExams = getFilteredExams();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClassCategory('all');
    setSelectedSubject('all');
    setSelectedLevel('all');
    setSelectedType('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Made more responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <FiBook className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 mr-2 sm:mr-3" />
                Manage Exam Sets
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2">Create and manage your examination sets</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center justify-center sm:justify-start space-x-2 transition-colors shadow-lg w-full sm:w-auto"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Exam Set</span>
            </button>
          </div>
        </div>

        {/* Add Filters and Search Section - Improved for mobile */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="relative w-full sm:w-auto">
                <FiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exam sets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start ${
                  isFilterExpanded || selectedClassCategory !== 'all' || selectedSubject !== 'all' || selectedType !== 'all'
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filters
                {(selectedClassCategory !== 'all' || selectedSubject !== 'all' || selectedType !== 'all' || selectedLevel !== 'all') && (
                  <span className="ml-2 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(selectedClassCategory !== 'all' ? 1 : 0) +
                   (selectedSubject !== 'all' ? 1 : 0) +
                   (selectedType !== 'all' ? 1 : 0) +
                   (selectedLevel !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="text-gray-500 text-sm hidden sm:block">
              Showing {filteredExams.length} of {examSets.length} exam sets
            </div>
          </div>

          {/* Expanded filters - Made grid more responsive */}
          {isFilterExpanded && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Class Category Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FiLayers className="mr-2" /> Class Category
                  </label>
                  <select
                    value={selectedClassCategory}
                    onChange={handleClassCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Class Categories</option>
                    {classCategories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FiBookOpen className="mr-2" /> Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={selectedClassCategory === 'all'}
                  >
                    <option value="all">
                      {selectedClassCategory === 'all' 
                        ? 'Please select a class category first' 
                        : 'All Subjects'}
                    </option>
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id.toString()}>
                          {subject.subject_name}
                        </option>
                      ))
                    ) : selectedClassCategory !== 'all' && (
                      <option disabled>No subjects available</option>
                    )}
                  </select>
                </div>

                {/* Level Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FiLayers className="mr-2" /> Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    {level.map((lvl) => (
                      <option key={lvl.id} value={lvl.id.toString()}>
                        {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <FiFilter className="mr-2" /> Exam Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="online">Online Exam</option>
                    <option value="offline">Center Exam</option>
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

          {/* Active filter badges - Improved wrapping */}
          {(selectedClassCategory !== 'all' || selectedSubject !== 'all' || selectedType !== 'all' || selectedLevel !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedClassCategory !== 'all' && (
                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {classCategories.find(c => c.id.toString() === selectedClassCategory)?.name || 'Class'}
                  <button
                    onClick={() => {
                      setSelectedClassCategory('all');
                      setSelectedSubject('all'); // Reset subject when clearing class
                    }}
                    className="ml-2 text-teal-600 hover:text-teal-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {selectedSubject !== 'all' && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiBookOpen className="mr-1 h-3 w-3" />
                  {filteredSubjects.find(s => s.id.toString() === selectedSubject)?.subject_name || 'Subject'}
                  <button
                    onClick={() => setSelectedSubject('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {selectedLevel !== 'all' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiLayers className="mr-1 h-3 w-3" />
                  {level.find(l => l.id.toString() === selectedLevel)?.name || 'Level'}
                  <button
                    onClick={() => setSelectedLevel('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {selectedType !== 'all' && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <FiFilter className="mr-1 h-3 w-3" />
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile view count */}
          <div className="text-gray-500 text-sm block sm:hidden text-center mt-4">
            Showing {filteredExams.length} of {examSets.length} exam sets
          </div>
        </div>

        {/* Show empty state or exam sets table */}
        {!loading && filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <FiFileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {examSets.length === 0 ? 'No Exam Sets Found' : 'No Matching Exam Sets'}
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                {examSets.length === 0 
                  ? 'Get started by creating your first exam set. You can add questions after creating an exam set.' 
                  : 'Try adjusting your search or filter settings to find what you\'re looking for.'}
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
              sessionStorage.removeItem('newQuestionOrder');
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