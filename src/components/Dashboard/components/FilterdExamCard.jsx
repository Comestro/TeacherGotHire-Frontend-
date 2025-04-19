import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLevel } from "../../../services/examQuesServices";
import { examCard } from "../../../features/examSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { setError } from "../../../features/examSlice";
import { 
  FaGraduationCap, FaLayerGroup, FaBookOpen, 
  FaArrowRight, FaSpinner, FaExclamationCircle, 
  FaCheckCircle, FaAngleRight 
} from "react-icons/fa";

const ClassSelectionCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prefrence } = useSelector((state) => state.jobProfile);
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );
  const { examCards, error } = useSelector((state) => state?.exam);
  const { attempts } = useSelector((state) => state.examQues);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [levels, setLevels] = useState([]);
  const [examReady, setExamReady] = useState(false);
  const [showCategoryPanel, setShowCategoryPanel] = useState(true);
  const [showSubjectPanel, setShowSubjectPanel] = useState(false);
  const [showLevelPanel, setShowLevelPanel] = useState(false);
  
  // Determine qualified Level 2 subjects
  const qualifiedSubjects = attempts?.filter(item => 
    item?.exam?.level_code === 2 && item?.isqualified === true
  ).map(item => ({
    subjectId: item?.exam?.subject_id,
    subjectName: item?.exam?.subject_name,
    categoryId: item?.exam?.class_category_id,
    categoryName: item?.exam?.class_category_name
  })) || [];

  // Fetch levels on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const levels = await fetchLevel();
        setLevels(levels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };

    fetchData();
  }, []);
  
  const isSubjectQualifiedForInterview = (subjectId, categoryId) => {
    return qualifiedSubjects?.some(
      q => q?.subjectId === subjectId && q?.categoryId === categoryId
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubject(null);
    setSelectedLevel(null);
    setExamReady(false);
    dispatch(setError(null));
    setShowSubjectPanel(true);
    setShowCategoryPanel(false);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedLevel(null);
    setExamReady(false);
    dispatch(setError(null));
    setShowLevelPanel(true);
    setShowSubjectPanel(false);
  };

  // Helper functions to check qualifications
  const checkLevelQualification = (categoryId, subjectId, levelCode) => {
    return attempts?.some(attempt => 
      attempt?.exam?.class_category_id === categoryId &&
      attempt?.exam?.subject_id === subjectId &&
      attempt?.exam?.level_code === levelCode &&
      attempt?.isqualified === true
    );
  };

  const getInterviewStatus = (categoryId, subjectId) => {
    const relevantAttempt = attempts?.find(attempt => 
      attempt?.exam?.class_category_id === categoryId &&
      attempt?.exam?.subject_id === subjectId &&
      attempt?.exam?.level_code === 2.0
    );

    if (!relevantAttempt?.interviews?.length) return null;

    // Create a copy of the array before sorting
    const sortedInterviews = [...(relevantAttempt?.interviews || [])].sort((a, b) => 
      new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );

    return sortedInterviews[0]?.status;
  };

  const handleLevelSelect = async (level) => {
    if (!selectedSubject || !selectedCategory) {
      setErrors("Please select both category and subject first");
      return;
    }

    // Check if Level 2 is being selected and Level 1 isn't completed
    if (level?.level_code >= 2.0) {
      const isLevel1Qualified = checkLevelQualification(
        selectedCategory?.id,
        selectedSubject?.id,
        1.0
      );

      if (!isLevel1Qualified) {
        setErrors("You must complete Level 1 first");
        return;
      }
    }

    // Check if it's offline Level 2 (level_code 2.5) and online Level 2 isn't completed
    if (level?.level_code === 2.5) {
      const isOnlineLevel2Qualified = checkLevelQualification(
        selectedCategory?.id,
        selectedSubject?.id,
        2.0
      );

      if (!isOnlineLevel2Qualified) {
        setErrors("You must complete online Level 2 first");
        return;
      }
    }

    try {
      setIsLoading(true);
      setErrors(null);
      setSelectedLevel(level);

      const payload = {
        subject_id: selectedSubject?.id,
        class_category_id: selectedCategory?.id,
        level_id: level?.id,
      };

      await dispatch(examCard(payload)).unwrap();
      setExamReady(true);
    } catch (err) {
      console.error("Failed to load exam:", err);
      setErrors("Failed to load exam data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedLevel(null);
    setExamReady(false);
    dispatch(setError(null));
    setShowCategoryPanel(true);
    setShowSubjectPanel(false);
    setShowLevelPanel(false);
  };

  const handleExam = () => {
    navigate("/exam");
  };
  
  const handleBackToCategories = () => {
    setShowCategoryPanel(true);
    setShowSubjectPanel(false);
  };
  
  const handleBackToSubjects = () => {
    setShowSubjectPanel(true);
    setShowLevelPanel(false);
  };
  
  const handleViewInterviews = () => {
    navigate("/teacher/interview");
  };

  // Update the level item rendering in the return section to show qualification status
  const renderLevelItem = (level) => {
    const isQualified = checkLevelQualification(
      selectedCategory?.id,
      selectedSubject?.id, 
      level?.level_code
    );
    const interviewStatus = getInterviewStatus(selectedCategory?.id, selectedSubject?.id);

    return (
      <motion.div
        key={level?.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleLevelSelect(level)}
        className={`p-5 rounded-xl border-2 hover:shadow-md transition-all ${
          (level?.level_code === 2.0 && !isQualified) 
            ? 'opacity-60 cursor-not-allowed' 
            : 'cursor-pointer'
        } ${
          isQualified ? 'border-green-500 bg-green-50' : ''
        }`}
        style={{
          borderColor: selectedLevel?.id === level?.id ? '#0d9488' : '#e5e7eb',
          background: selectedLevel?.id === level?.id ? '#f0fdfa' : 'white'
        }}
      >
        <div className="flex items-start">
          <div className="bg-[#E5F1F9] p-3 rounded-lg text-[#3E98C7] mr-4 flex-shrink-0">
            <FaLayerGroup size={18} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{level?.name}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {level?.level_code === 1.0 && "Basic concepts assessment"}
              {level?.level_code === 2.0 && "Advanced problem solving"}
              {level?.level_code > 2.0 && "Specialized assessment"}
            </p>
            
            {isQualified && (
              <div className="mt-2 flex items-center text-green-600">
                <FaCheckCircle className="mr-1" />
                <span>Qualified</span>
              </div>
            )}
            
            {level?.level_code === 2.0 && interviewStatus && (
              <div className={`mt-2 flex items-center ${
                interviewStatus === 'fulfilled' ? 'text-green-600' : 
                interviewStatus === 'scheduled' ? 'text-teal-600' : 
                'text-orange-600'
              }`}>
                <span className="text-sm">
                  Interview: {interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-600">Exam Selection</h2>
            <p className="text-gray-600 mt-1">Select your class category, subject and level to begin</p>
          </div>
          
          {qualifiedSubjects.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewInterviews}
              className="mt-4 md:mt-0 flex items-center bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <span>View Interview Qualification</span>
              <FaAngleRight className="ml-2" />
            </motion.button>
          )}
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              showCategoryPanel ? 'bg-[#3E98C7] text-white' : 'bg-blue-100 text-bg-[#3E98C7]'
            }`}>
              <span className="font-bold">1</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              selectedCategory ? 'bg-[#3E98C7]' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              showSubjectPanel ? 'bg-[#3E98C7] text-white' : selectedSubject ? 'bg-indigo-100 text-bg-[#3E98C7]' : 'bg-gray-200 text-gray-600'
            }`}>
              <span className="font-bold">2</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              selectedSubject ? 'bg-[#3E98C7]' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              showLevelPanel ? 'bg-[#3E98C7] text-white' : selectedLevel ? 'bg-teal-100 text-bg-[#3E98C7]' : 'bg-gray-200 text-gray-600'
            }`}>
              <span className="font-bold">3</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className={`w-1/3 text-center ${showCategoryPanel ? 'text-[#3E98C7] font-medium' : 'text-gray-500'}`}>
              Class Category
            </div>
            <div className={`w-1/3 text-center ${showSubjectPanel ? 'text-[#3E98C7] font-medium' : 'text-gray-500'}`}>
              Subject
            </div>
            <div className={`w-1/3 text-center ${showLevelPanel ? 'text-[#3E98C7] font-medium' : 'text-gray-500'}`}>
              Level
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Class Category Panel */}
          {showCategoryPanel && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#3E98C7]">Select Class Category</h3>
                <p className="text-gray-500 mt-1">Choose the class category you want to take an exam for</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classCategories?.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategorySelect(category)}
                    className="cursor-pointer p-5 rounded-xl border-2 hover:shadow-md transition-all flex items-start"
                    style={{
                      borderColor: selectedCategory?.id === category.id ? '#2563eb' : '#e5e7eb',
                      background: selectedCategory?.id === category.id ? '#eff6ff' : 'white'
                    }}
                  >
                    <div className="bg-blue-100 p-3 rounded-lg text-[#3E98C7] mr-4">
                      <FaGraduationCap size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{category.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.subjects?.length || 0} subjects available
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {(!classCategories || classCategories.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <FaExclamationCircle className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-500">No class categories available. Please update your profile preferences.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Subject Panel */}
          {showSubjectPanel && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#3E98C7]">Select Subject</h3>
                  <p className="text-gray-500 mt-1">Choose a subject from {selectedCategory?.name || "your category"}</p>
                </div>
                <button
                  onClick={handleBackToCategories}
                  className="text-[#3E98C7] hover:text-indigo-700 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategory?.subjects?.map((subject) => {
                  const isQualified = isSubjectQualifiedForInterview(subject?.id, selectedCategory?.id);
                  
                  return (
                    <motion.div
                      key={subject?.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubjectSelect(subject)}
                      className="cursor-pointer p-5 rounded-xl border-2 hover:shadow-md transition-all relative"
                      style={{
                        borderColor: selectedSubject?.id === subject?.id ? '#4f46e5' : '#e5e7eb',
                        background: selectedSubject?.id === subject?.id ? '#eef2ff' : 'white'
                      }}
                    >
                      {isQualified && (
                        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4">
                          <div className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md shadow-sm">
                            LEVEL 2 QUALIFIED
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <div className="bg-indigo-100 p-3 rounded-lg text-[#3E98C7] mr-4 flex-shrink-0">
                          <FaBookOpen size={18} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {subject?.subject_name}
                          </h4>
                          {isQualified && (
                            <div className="mt-2 flex items-center text-green-600 text-sm">
                              <FaCheckCircle className="mr-1" />
                              <span>Interview eligible</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {(!selectedCategory?.subjects || selectedCategory.subjects.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <FaExclamationCircle className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-500">No subjects available for this class category.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Level Panel */}
          {showLevelPanel && (
            <motion.div
              key="levels"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#3E98C7]">Select Level</h3>
                  <p className="text-gray-500 mt-1">Choose your exam level for {selectedSubject?.subject_name || ""}</p>
                </div>
                <button
                  onClick={handleBackToSubjects}
                  className="text-[#3E98C7] hover:text-teal-800 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels?.map((level) => renderLevelItem(level))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm mx-auto">
              <FaSpinner className="mx-auto text-blue-500 text-4xl animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">Preparing Your Exam</h3>
              <p className="text-gray-600 mt-2">Setting up your assessment environment...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-red-200 p-6 mb-6"
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-lg">
                <FaExclamationCircle className="text-red-500 text-xl" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Error Loading Exam</h3>
                <p className="mt-1 text-red-600">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={resetSelection}
                    className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    Reset Selections
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exam Ready Card */}
        {examReady && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-md shadow-sm border-2 border-[#E5F1F9] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] p-6 text-white">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ready to Start Your Exam</h3>
                  <p className="text-green-100">All selections have been made successfully</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Class Category</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedCategory?.name}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Subject</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedSubject?.subject_name}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Level</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{selectedLevel?.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetSelection}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Change Selection
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExam}
                  className="px-8 py-2.5 bg-gradient-to-r from-[#3E98C7] to-[#67B3DA] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex items-center"
                >
                  Start Exam
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Welcome Card */}
        {!selectedCategory && !selectedSubject && !selectedLevel && !error && !examReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 text-center"
          >
            <div className="max-w-xl mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-[#3E98C7] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Assessment Journey</h3>
              <p className="text-gray-600">
                To begin your assessment, please follow the steps above. First choose your class category, 
                then select a subject, and finally pick the level that's right for you.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClassSelectionCard;
