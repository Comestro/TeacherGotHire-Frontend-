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
  FaCheckCircle, FaAngleRight, FaChevronLeft,
  FaBars, FaFilter, FaHome, FaCalendarAlt, FaClock
} from "react-icons/fa";

const FilterdExamCard = () => {
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
  
  // Helper functions to check qualifications
  const checkLevelQualification = (categoryId, subjectId, levelCode) => {
    return attempts?.some(attempt => 
      attempt?.exam?.class_category_id === categoryId &&
      attempt?.exam?.subject_id === subjectId &&
      attempt?.exam?.level_code === levelCode &&
      attempt?.isqualified === true
    );
  };

  const isSubjectQualifiedForInterview = (subjectId, categoryId) => {
    return qualifiedSubjects?.some(
      q => q?.subjectId === subjectId && q?.categoryId === categoryId
    );
  };

  const getInterviewStatus = (categoryId, subjectId) => {
    const relevantAttempt = attempts?.find(attempt => 
      attempt?.exam?.class_category_id === categoryId &&
      attempt?.exam?.subject_id === subjectId &&
      attempt?.exam?.level_code === 2.0
    );

    if (!relevantAttempt?.interviews?.length) return null;

    const sortedInterviews = [...(relevantAttempt?.interviews || [])].sort((a, b) => 
      new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );

    return sortedInterviews[0]?.status;
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

  const handleLevelSelect = async (level) => {
    if (!selectedSubject || !selectedCategory) {
      setErrors("Please select both category and subject first");
      return;
    }

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

  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                <FaFilter />
              </span>
              Exam Selection
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl">
              Select your preferred class category, subject, and level to begin your assessment journey
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FaHome className="mr-2" />
              Dashboard
            </button>
            
            {qualifiedSubjects.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/teacher/interview')}
                className="flex items-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span>View Interviews</span>
                <FaAngleRight className="ml-2" />
              </motion.button>
            )}
          </div>
        </div>
        
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                showCategoryPanel 
                  ? 'bg-blue-600 text-white' 
                  : selectedCategory 
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FaGraduationCap className={selectedCategory ? 'animate-pulse' : ''} />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              selectedCategory ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : 'bg-gray-200'
            }`}></div>
            
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                showSubjectPanel 
                  ? 'bg-indigo-600 text-white' 
                  : selectedSubject 
                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FaBookOpen className={selectedSubject ? 'animate-pulse' : ''} />
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              selectedSubject ? 'bg-gradient-to-r from-indigo-500 to-teal-500' : 'bg-gray-200'
            }`}></div>
            
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                showLevelPanel 
                  ? 'bg-teal-600 text-white' 
                  : selectedLevel 
                    ? 'bg-teal-100 text-teal-600 border-2 border-teal-300' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              <FaLayerGroup className={selectedLevel ? 'animate-pulse' : ''} />
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-sm font-medium">
            <div 
              className={`w-1/3 text-center ${
                showCategoryPanel 
                  ? 'text-blue-700' 
                  : selectedCategory 
                    ? 'text-blue-600' 
                    : 'text-gray-500'
              }`}
            >
              Class Category
            </div>
            <div 
              className={`w-1/3 text-center ${
                showSubjectPanel 
                  ? 'text-indigo-700' 
                  : selectedSubject 
                    ? 'text-indigo-600' 
                    : 'text-gray-500'
              }`}
            >
              Subject
            </div>
            <div 
              className={`w-1/3 text-center ${
                showLevelPanel 
                  ? 'text-teal-700' 
                  : selectedLevel 
                    ? 'text-teal-600' 
                    : 'text-gray-500'
              }`}
            >
              Level
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showCategoryPanel && (
            <motion.div
              key="categories"
              {...pageTransition}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
            >
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaGraduationCap className="mr-3" />
                  Select Class Category
                </h2>
                <p className="text-blue-100 mt-1">
                  Choose a class category from your profile preferences
                </p>
              </div>
              
              <div className="p-6">
                {classCategories?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classCategories?.map((category) => (
                      <motion.div
                        key={category.id}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`cursor-pointer rounded-xl border-2 transition-all hover:shadow-md overflow-hidden ${
                          selectedCategory?.id === category.id 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`p-4 ${
                          selectedCategory?.id === category.id 
                            ? 'bg-blue-50' 
                            : 'bg-white'
                        }`}>
                          <div className="flex items-start">
                            <div className={`p-3 rounded-lg mr-3 flex-shrink-0 ${
                              selectedCategory?.id === category.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              <FaGraduationCap size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {category.subjects?.length || 0} subjects available
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
                      <FaExclamationCircle className="text-blue-500 text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Class Categories Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      You don't have any class categories in your profile preferences. 
                      Please update your profile to add class categories.
                    </p>
                    <button
                      onClick={() => navigate('/teacher/profile')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {showSubjectPanel && (
            <motion.div
              key="subjects"
              {...pageTransition}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
            >
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaBookOpen className="mr-3" />
                    Select Subject
                  </h2>
                  <button
                    onClick={handleBackToCategories}
                    className="bg-indigo-800/50 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-lg flex items-center text-sm transition-colors"
                  >
                    <FaChevronLeft className="mr-1" />
                    Back
                  </button>
                </div>
                <p className="text-indigo-100 mt-1">
                  Choose a subject from <span className="font-medium">{selectedCategory?.name}</span>
                </p>
              </div>
              
              <div className="p-6">
                {selectedCategory?.subjects?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCategory?.subjects?.map((subject) => {
                      const isQualified = isSubjectQualifiedForInterview(subject?.id, selectedCategory?.id);
                      
                      return (
                        <motion.div
                          key={subject?.id}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubjectSelect(subject)}
                          className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden relative ${
                            selectedSubject?.id === subject?.id 
                              ? 'border-indigo-500 ring-2 ring-indigo-200' 
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {isQualified && (
                            <div className="absolute -top-1 -right-1 z-10">
                              <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-br-xl rounded-tl-xl blur-sm opacity-70"></div>
                                <div className="relative bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-br-xl rounded-tl-xl">
                                  LEVEL 2 QUALIFIED
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className={`p-4 ${
                            selectedSubject?.id === subject?.id 
                              ? 'bg-indigo-50' 
                              : 'bg-white'
                          }`}>
                            <div className="flex items-start">
                              <div className={`p-3 rounded-lg mr-3 flex-shrink-0 ${
                                selectedSubject?.id === subject?.id 
                                  ? 'bg-indigo-500 text-white' 
                                  : isQualified
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                <FaBookOpen size={24} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {subject?.subject_name}
                                </h3>
                                
                                {isQualified && (
                                  <div className="flex items-center text-green-600 text-sm mt-2">
                                    <FaCheckCircle className="mr-1" />
                                    <span>Interview eligible</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                      <FaExclamationCircle className="text-indigo-500 text-3xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Subjects Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      There are no subjects available for this class category.
                      Please select a different class category.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {showLevelPanel && (
            <motion.div
              key="levels"
              {...pageTransition}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8"
            >
              <div className="bg-gradient-to-r from-teal-700 to-teal-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaLayerGroup className="mr-3" />
                    Select Level
                  </h2>
                  <button
                    onClick={handleBackToSubjects}
                    className="bg-teal-800/50 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg flex items-center text-sm transition-colors"
                  >
                    <FaChevronLeft className="mr-1" />
                    Back
                  </button>
                </div>
                <p className="text-teal-100 mt-1">
                  Choose the assessment level for <span className="font-medium">{selectedSubject?.subject_name}</span>
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {levels.map((level) => {
                    const isQualified = checkLevelQualification(
                      selectedCategory?.id,
                      selectedSubject?.id, 
                      level?.level_code
                    );
                    
                    const interviewStatus = getInterviewStatus(selectedCategory?.id, selectedSubject?.id);
                    const isLocked = 
                      (level?.level_code === 2.0 && !checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 1.0)) ||
                      (level?.level_code === 2.5 && !checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.0));
                    
                    return (
                      <motion.div
                        key={level?.id}
                        whileHover={!isLocked ? { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        onClick={() => !isLocked && handleLevelSelect(level)}
                        className={`rounded-xl border-2 overflow-hidden relative ${
                          isLocked 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'cursor-pointer hover:shadow-lg'
                        } ${
                          selectedLevel?.id === level?.id 
                            ? 'border-teal-500 ring-2 ring-teal-200' 
                            : isQualified
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200'
                        }`}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="bg-gray-900/80 text-white text-sm font-medium py-1.5 px-3 rounded-lg">
                              {level?.level_code === 2.0 
                                ? "Complete Level 1 First" 
                                : "Complete Level 2 First"}
                            </div>
                          </div>
                        )}
                        
                        <div className={`p-5 ${
                          selectedLevel?.id === level?.id ? 'bg-teal-50' : ''
                        }`}>
                          <div className="flex items-start">
                            <div className={`p-4 rounded-xl flex-shrink-0 mr-4 ${
                              selectedLevel?.id === level?.id 
                                ? 'bg-teal-500 text-white' 
                                : isQualified
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-teal-100 text-teal-600'
                            }`}>
                              <FaLayerGroup size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold text-gray-800">{level?.name}</h3>
                                {level?.level_code && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    level?.level_code === 1.0 
                                      ? 'bg-blue-100 text-blue-700'
                                      : level?.level_code === 2.0
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    Level {level?.level_code}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 my-2">
                                {level?.level_code === 1.0 && "Basic concepts assessment for beginners"}
                                {level?.level_code === 2.0 && "Advanced problem solving techniques"}
                                {level?.level_code === 2.5 && "Specialized interview preparation assessment"}
                                {!level?.level_code && "Standard assessment level"}
                              </p>
                              
                              {isQualified && (
                                <div className="mt-3 flex items-center text-green-600 bg-green-50 py-1.5 px-3 rounded-lg border border-green-200 inline-block">
                                  <FaCheckCircle className="mr-2" />
                                  <span className="font-medium">Qualified</span>
                                </div>
                              )}
                              
                              {level?.level_code === 2.0 && interviewStatus && (
                                <div className={`mt-3 flex items-center py-1.5 px-3 rounded-lg border inline-block ${
                                  interviewStatus === 'fulfilled' 
                                    ? 'text-green-600 bg-green-50 border-green-200' 
                                    : interviewStatus === 'scheduled' 
                                      ? 'text-blue-600 bg-blue-50 border-blue-200' 
                                      : 'text-amber-600 bg-amber-50 border-amber-200'
                                }`}>
                                  {interviewStatus === 'fulfilled' && <FaCheckCircle className="mr-2" />}
                                  {interviewStatus === 'scheduled' && <FaCalendarAlt className="mr-2" />}
                                  {interviewStatus === 'pending' && <FaClock className="mr-2" />}
                                  <span className="font-medium">
                                    Interview: {interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-auto"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <FaSpinner className="text-blue-600 text-3xl animate-spin" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin opacity-20"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Exam</h3>
              <p className="text-gray-600">
                Setting up your assessment environment. This may take a moment...
              </p>
            </motion.div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-6 mb-6"
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaExclamationCircle className="text-red-500 text-xl" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-semibold text-gray-800">Error Loading Exam</h3>
                <p className="mt-2 text-red-600">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={resetSelection}
                    className="px-4 py-2 bg-red-100 rounded-lg text-red-700 hover:bg-red-200 transition-all text-sm font-medium"
                  >
                    Reset Selections
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {examReady && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-lg mr-4">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ready to Begin Your Assessment</h3>
                  <p className="text-green-100">All selections have been made successfully</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <FaGraduationCap className="text-blue-600 mr-2" />
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Class Category</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{selectedCategory?.name}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <FaBookOpen className="text-indigo-600 mr-2" />
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Subject</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{selectedSubject?.subject_name}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <FaLayerGroup className="text-teal-600 mr-2" />
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Level</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">{selectedLevel?.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetSelection}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium flex items-center"
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
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex items-center"
                >
                  Start Exam
                  <FaArrowRight className="ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {!selectedCategory && !selectedSubject && !selectedLevel && !error && !examReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
              <div className="max-w-lg mx-auto">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaGraduationCap className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Your Assessment Journey</h3>
                <p className="text-gray-600">
                  Welcome to the teacher qualification process. To begin your assessment, please follow the 
                  steps above. Select your class category, choose a subject, and pick an appropriate level 
                  that matches your teaching expertise.
                </p>
                <div className="mt-6">
                  <div className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                    <FaArrowRight className="animate-pulse mr-2" />
                    Select a Class Category to begin
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-3">Assessment Process:</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2 text-blue-600">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">1</span>
                    <h5 className="font-medium">Level 1</h5>
                  </div>
                  <p className="text-sm text-gray-600">Basic concepts assessment to evaluate your fundamental knowledge.</p>
                </div>
                
                <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2 text-indigo-600">
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">2</span>
                    <h5 className="font-medium">Level 2</h5>
                  </div>
                  <p className="text-sm text-gray-600">Advanced problem solving to test your in-depth knowledge.</p>
                </div>
                
                <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2 text-teal-600">
                    <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold">3</span>
                    <h5 className="font-medium">Interview</h5>
                  </div>
                  <p className="text-sm text-gray-600">Final interview to showcase your teaching abilities and expertise.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FilterdExamCard;
