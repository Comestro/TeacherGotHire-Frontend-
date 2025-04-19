import { useEffect, useState, useRef } from "react";
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
  const examReadyRef = useRef(null); // Create a ref for the target section
  
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

  // Scroll to exam ready section when it appears
  useEffect(() => {
    if (examReady && examReadyRef.current) {
      // Use setTimeout to ensure the element is fully rendered before scrolling
      const timer = setTimeout(() => {
        examReadyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Small delay
      return () => clearTimeout(timer); // Cleanup timer on unmount or change
    }
  }, [examReady]);

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-8 px-4"> {/* Adjust padding */}
      <div className="max-w-6xl mx-auto">
    
        
        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8 bg-white rounded-lg p-4 border border-gray-200"> {/* Remove shadow, use rounded-lg */}
          <div className="flex items-center">
            {/* Category Step */}
            <div 
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-300 ${ // Adjust size
                showCategoryPanel 
                  ? 'bg-sky-600 text-white' // Changed from blue-600
                  : selectedCategory 
                    ? 'bg-sky-100 text-sky-600 border-2 border-sky-300' // Changed from blue
                    : 'bg-gray-100 text-gray-400'
              }`}
              aria-current={showCategoryPanel ? "step" : undefined} // Add aria-current
            >
              <FaGraduationCap className={`text-sm sm:text-base ${selectedCategory ? 'animate-pulse' : ''}`} aria-hidden="true" />
            </div>
            {/* Connector */}
            <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-colors duration-300 ${ // Adjust size/margin
              selectedCategory ? 'bg-gradient-to-r from-sky-500 to-cyan-500' : 'bg-gray-200' // Changed gradient
            }`}></div>
            
            {/* Subject Step */}
            <div 
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-300 ${ // Adjust size
                showSubjectPanel 
                  ? 'bg-cyan-600 text-white' // Changed from indigo-600
                  : selectedSubject 
                    ? 'bg-cyan-100 text-cyan-600 border-2 border-cyan-300' // Changed from indigo
                    : 'bg-gray-100 text-gray-400'
              }`}
              aria-current={showSubjectPanel ? "step" : undefined} // Add aria-current
            >
              <FaBookOpen className={`text-sm sm:text-base ${selectedSubject ? 'animate-pulse' : ''}`} aria-hidden="true" />
            </div>
            {/* Connector */}
            <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-colors duration-300 ${ // Adjust size/margin
              selectedSubject ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-gray-200' // Changed gradient (kept teal end)
            }`}></div>
            
            {/* Level Step */}
            <div 
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors duration-300 ${ // Adjust size
                showLevelPanel 
                  ? 'bg-teal-600 text-white' // Kept teal
                  : selectedLevel 
                    ? 'bg-teal-100 text-teal-600 border-2 border-teal-300' // Kept teal
                    : 'bg-gray-100 text-gray-400'
              }`}
              aria-current={showLevelPanel ? "step" : undefined} // Add aria-current
            >
              <FaLayerGroup className={`text-sm sm:text-base ${selectedLevel ? 'animate-pulse' : ''}`} aria-hidden="true" />
            </div>
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between mt-2 sm:mt-3 text-xs sm:text-sm font-medium"> {/* Adjust margin/text size */}
            <div 
              className={`w-1/3 text-center transition-colors duration-300 ${
                showCategoryPanel ? 'text-sky-700' : selectedCategory ? 'text-sky-600' : 'text-gray-500' // Changed from blue
              }`}
            >
              Category
            </div>
            <div 
              className={`w-1/3 text-center transition-colors duration-300 ${
                showSubjectPanel ? 'text-cyan-700' : selectedSubject ? 'text-cyan-600' : 'text-gray-500' // Changed from indigo
              }`}
            >
              Subject
            </div>
            <div 
              className={`w-1/3 text-center transition-colors duration-300 ${
                showLevelPanel ? 'text-teal-700' : selectedLevel ? 'text-teal-600' : 'text-gray-500' // Kept teal
              }`}
            >
              Level
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Category Panel */}
          {showCategoryPanel && (
            <motion.div
              key="categories"
              {...pageTransition}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-4 sm:p-6 text-white"> {/* Adjust padding, Changed gradient from blue */}
                <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                  <FaGraduationCap className="mr-2 sm:mr-3" aria-hidden="true" />
                  Select Class Category
                </h2>
                <p className="text-sky-100 mt-1 text-sm sm:text-base"> {/* Adjust text size, Changed from blue */}
                  Choose from your profile preferences
                </p>
              </div>
              
              <div className="p-4 sm:p-6"> {/* Adjust padding */}
                {classCategories?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"> {/* Adjust gap */}
                    {classCategories?.map((category) => (
                      <motion.button // Change to button
                        key={category.id}
                        type="button" // Add type
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className={`text-left w-full rounded-lg border-2 transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 ${ // Use button styles, focus ring
                          selectedCategory?.id === category.id 
                            ? 'border-sky-500 ring-sky-300 focus:ring-sky-500' // Changed from blue
                            : 'border-gray-200 hover:border-sky-300 focus:ring-sky-500' // Changed from blue
                        }`}
                        aria-pressed={selectedCategory?.id === category.id} // Add aria-pressed
                      >
                        <div className={`p-3 sm:p-4 transition-colors duration-200 ${ // Adjust padding
                          selectedCategory?.id === category.id ? 'bg-sky-50' : 'bg-white' // Changed from blue
                        }`}>
                          <div className="flex items-start">
                            <div className={`p-2 sm:p-3 rounded-md mr-3 flex-shrink-0 transition-colors duration-200 ${ // Adjust padding/radius
                              selectedCategory?.id === category.id 
                                ? 'bg-sky-500 text-white' // Changed from blue
                                : 'bg-sky-100 text-sky-600' // Changed from blue
                            }`}>
                              <FaGraduationCap size={20} sm:size={24} aria-hidden="true" /> {/* Adjust size */}
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-800"> {/* Adjust text size */}
                                {category.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1"> {/* Adjust text size */}
                                {category.subjects?.length || 0} subjects
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12"> {/* Adjust padding */}
                    <div className="bg-sky-50 p-3 sm:p-4 rounded-full inline-block mb-4"> {/* Adjust padding, Changed from blue */}
                      <FaExclamationCircle className="text-sky-500 text-2xl sm:text-3xl" aria-hidden="true" /> {/* Adjust size, Changed from blue */}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Class Categories</h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6">
                      Update your profile to add class categories.
                    </p>
                    <button
                      type="button" // Add type
                      onClick={() => navigate('/teacher/job-profile')}
                      className="px-4 sm:px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" // Adjust padding/radius, add focus, remove shadow, Changed from blue
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Subject Panel */}
          {showSubjectPanel && (
            <motion.div
              key="subjects"
              {...pageTransition}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-4 sm:p-6 text-white"> {/* Adjust padding, Changed gradient from indigo */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                    <FaBookOpen className="mr-2 sm:mr-3" aria-hidden="true" />
                    Select Subject
                  </h2>
                  <button
                    type="button" // Add type
                    onClick={handleBackToCategories}
                    className="bg-cyan-700/70 hover:bg-cyan-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white" // Adjust padding/size/focus, Changed from indigo
                    aria-label="Back to categories" // Add aria-label
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>
                <p className="text-cyan-100 mt-1 text-sm sm:text-base"> {/* Adjust text size, Changed from indigo */}
                  Choose a subject from <span className="font-medium">{selectedCategory?.name}</span>
                </p>
              </div>
              
              <div className="p-4 sm:p-6"> {/* Adjust padding */}
                {selectedCategory?.subjects?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"> {/* Adjust gap */}
                    {selectedCategory?.subjects?.map((subject) => {
                      const isQualified = isSubjectQualifiedForInterview(subject?.id, selectedCategory?.id);
                      
                      return (
                        <motion.button // Change to button
                          key={subject?.id}
                          type="button" // Add type
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSubjectSelect(subject)}
                          className={`text-left w-full rounded-lg border-2 transition-all overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-offset-2 ${ // Use button styles, focus ring
                            selectedSubject?.id === subject?.id 
                              ? 'border-cyan-500 ring-cyan-300 focus:ring-cyan-500' // Changed from indigo
                              : 'border-gray-200 hover:border-cyan-300 focus:ring-cyan-500' // Changed from indigo
                          }`}
                          aria-pressed={selectedSubject?.id === subject?.id} // Add aria-pressed
                        >
                          {isQualified && (
                            <div className="absolute top-0 right-0 z-10"> {/* Adjust position slightly */}
                              <div className="bg-green-500 text-white text-xs font-bold py-0.5 px-2 rounded-bl-lg"> {/* Simpler badge */}
                                QUALIFIED
                              </div>
                            </div>
                          )}
                          
                          <div className={`p-3 sm:p-4 transition-colors duration-200 ${ // Adjust padding
                            selectedSubject?.id === subject?.id ? 'bg-cyan-50' : 'bg-white' // Changed from indigo
                          }`}>
                            <div className="flex items-start">
                              <div className={`p-2 sm:p-3 rounded-md mr-3 flex-shrink-0 transition-colors duration-200 ${ // Adjust padding/radius
                                selectedSubject?.id === subject?.id 
                                  ? 'bg-cyan-500 text-white' // Changed from indigo
                                  : isQualified
                                    ? 'bg-green-100 text-green-600' // Kept green
                                    : 'bg-cyan-100 text-cyan-600' // Changed from indigo
                              }`}>
                                <FaBookOpen size={20} sm:size={24} aria-hidden="true" /> {/* Adjust size */}
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800"> {/* Adjust text size */}
                                  {subject?.subject_name}
                                </h3>
                                
                                {isQualified && (
                                  <div className="flex items-center text-green-600 text-xs sm:text-sm mt-1.5 sm:mt-2"> {/* Adjust size/margin */}
                                    <FaCheckCircle className="mr-1" aria-hidden="true" />
                                    <span>Interview eligible</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12"> {/* Adjust padding */}
                     <div className="bg-cyan-50 p-3 sm:p-4 rounded-full inline-block mb-4"> {/* Adjust padding, Changed from indigo */}
                      <FaExclamationCircle className="text-cyan-500 text-2xl sm:text-3xl" aria-hidden="true" /> {/* Adjust size, Changed from indigo */}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Subjects Available</h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                      No subjects found for this category.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Level Panel */}
          {showLevelPanel && (
            <motion.div
              key="levels"
              {...pageTransition}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 sm:p-6 text-white"> {/* Adjust padding, Kept teal */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                    <FaLayerGroup className="mr-2 sm:mr-3" aria-hidden="true" />
                    Select Level
                  </h2>
                  <button
                    type="button" // Add type
                    onClick={handleBackToSubjects}
                    className="bg-teal-700/70 hover:bg-teal-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white" // Adjust padding/size/focus, Kept teal
                    aria-label="Back to subjects" // Add aria-label
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>
                <p className="text-teal-100 mt-1 text-sm sm:text-base"> {/* Adjust text size, Kept teal */}
                  Choose the assessment level for <span className="font-medium">{selectedSubject?.subject_name}</span>
                </p>
              </div>
              
              <div className="p-4 sm:p-6"> {/* Adjust padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"> {/* Adjust gap */}
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
                      <motion.button // Change to button
                        key={level?.id}
                        type="button" // Add type
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        onClick={() => !isLocked && handleLevelSelect(level)}
                        disabled={isLocked} // Add disabled attribute
                        className={`rounded-lg border-2 overflow-hidden relative text-left w-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${ // Use button styles, focus ring
                          isLocked 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'cursor-pointer hover:border-teal-400 focus:ring-teal-500' // Kept teal
                        } ${
                          selectedLevel?.id === level?.id 
                            ? 'border-teal-500 ring-teal-300 focus:ring-teal-500' // Kept teal
                            : isQualified
                              ? 'border-green-400 bg-green-50/50 hover:border-green-500 focus:ring-green-500' // Kept green
                              : 'border-gray-200 hover:border-gray-300 focus:ring-teal-500' // Kept teal focus
                        }`}
                        aria-pressed={selectedLevel?.id === level?.id} // Add aria-pressed
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-500/30 backdrop-blur-[1px] z-10 flex items-center justify-center p-2">
                            <div className="bg-gray-800/90 text-white text-xs sm:text-sm font-medium py-1 px-2 sm:py-1.5 sm:px-3 rounded-md text-center"> {/* Adjust padding/size */}
                              {level?.level_code === 2.0 
                                ? "Complete Level 1 First" 
                                : "Complete Level 2 First"}
                            </div>
                          </div>
                        )}
                        
                        <div className={`p-4 sm:p-5 transition-colors duration-200 ${ // Adjust padding
                          selectedLevel?.id === level?.id ? 'bg-teal-50/70' : '' // Kept teal
                        }`}>
                          <div className="flex items-start">
                            <div className={`p-3 sm:p-4 rounded-lg flex-shrink-0 mr-3 sm:mr-4 transition-colors duration-200 ${ // Adjust padding/radius
                              selectedLevel?.id === level?.id 
                                ? 'bg-teal-500 text-white' // Kept teal
                                : isQualified
                                  ? 'bg-green-100 text-green-600' // Kept green
                                  : 'bg-teal-100 text-teal-600' // Kept teal
                            }`}>
                              <FaLayerGroup size={20} sm:size={24} aria-hidden="true" /> {/* Adjust size */}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-1.5 sm:mb-2"> {/* Adjust layout/gap */}
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 order-1 sm:order-none">{level?.name}</h3> {/* Adjust text size */}
                                {level?.level_code && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full order-none sm:order-1 ${ // Adjust padding
                                    level?.level_code === 1.0 ? 'bg-sky-100 text-sky-700' // Changed from blue
                                    : level?.level_code === 2.0 ? 'bg-cyan-100 text-cyan-700' // Changed from purple
                                    : 'bg-amber-100 text-amber-700' // Kept amber
                                  }`}>
                                    Level {level?.level_code}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 sm:mb-3"> {/* Adjust text size/margin */}
                                {level?.level_code === 1.0 && "Basic concepts assessment for beginners"}
                                {level?.level_code === 2.0 && "Advanced problem solving techniques"}
                                {level?.level_code === 2.5 && "Specialized interview preparation assessment"}
                                {!level?.level_code && "Standard assessment level"}
                              </p>
                              
                              {/* Status Badges */}
                              <div className="flex flex-wrap gap-2">
                                {isQualified && (
                                  <div className="flex items-center text-green-700 bg-green-100 py-1 px-2.5 rounded-md border border-green-200 text-xs sm:text-sm"> {/* Adjust padding/size */}
                                    <FaCheckCircle className="mr-1.5" aria-hidden="true" />
                                    <span className="font-medium">Qualified</span>
                                  </div>
                                )}
                                
                                {level?.level_code === 2.0 && interviewStatus && (
                                  <div className={`flex items-center py-1 px-2.5 rounded-md border text-xs sm:text-sm ${ // Adjust padding/size
                                    interviewStatus === 'fulfilled' ? 'text-green-700 bg-green-100 border-green-200' // Kept green
                                    : interviewStatus === 'scheduled' ? 'text-sky-700 bg-sky-100 border-sky-200' // Changed from blue
                                    : 'text-amber-700 bg-amber-100 border-amber-200' // Kept amber
                                  }`}>
                                    {interviewStatus === 'fulfilled' && <FaCheckCircle className="mr-1.5" aria-hidden="true" />}
                                    {interviewStatus === 'scheduled' && <FaCalendarAlt className="mr-1.5" aria-hidden="true" />}
                                    {interviewStatus === 'pending' && <FaClock className="mr-1.5" aria-hidden="true" />}
                                    <span className="font-medium">
                                      Interview: {interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"> {/* Adjust background */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 text-center max-w-sm mx-auto" // Use border, rounded-lg
            >
              <div className="relative mb-4 sm:mb-6"> {/* Adjust margin */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-100 rounded-full mx-auto flex items-center justify-center"> {/* Adjust size, Changed from blue */}
                  <FaSpinner className="text-cyan-600 text-2xl sm:text-3xl animate-spin" aria-hidden="true" /> {/* Adjust size, Changed from blue */}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Preparing Exam</h3> {/* Adjust text size */}
              <p className="text-sm sm:text-base text-gray-600"> {/* Adjust text size */}
                Please wait a moment...
              </p>
            </motion.div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 rounded-lg border border-red-300 p-4 sm:p-6 mb-6 sm:mb-8" // Kept red
            role="alert" // Add role
          >
            <div className="flex items-start">
              <div className="bg-red-100 p-2 sm:p-3 rounded-md flex-shrink-0"> {/* Adjust padding/radius */}
                <FaExclamationCircle className="text-red-500 text-lg sm:text-xl" aria-hidden="true" /> {/* Adjust size */}
              </div>
              <div className="ml-3 sm:ml-4 flex-1"> {/* Adjust margin */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Error Loading Exam</h3> {/* Adjust text size */}
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-red-700">{error}</p> {/* Adjust margin/text size */}
                <div className="mt-3 sm:mt-4"> {/* Adjust margin */}
                  <button
                    type="button" // Add type
                    onClick={resetSelection}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 rounded-md text-red-700 hover:bg-red-200 transition-all text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-red-50" // Adjust padding/size/focus
                  >
                    Reset Selections
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exam Ready Section */}
        {examReady && !error && (
          <motion.div
            id="exam-ready-section" // Add ID for scrolling
            ref={examReadyRef} // Attach the ref
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border-2 border-green-300 overflow-hidden" // Use rounded-lg, adjust border
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 sm:p-6 text-white"> {/* Adjust padding */}
              <div className="flex items-center">
                <div className="bg-white/20 p-2 sm:p-3 rounded-md mr-3 sm:mr-4"> {/* Adjust padding/radius/margin */}
                  <FaCheckCircle className="text-white text-xl sm:text-2xl" aria-hidden="true" /> {/* Adjust size */}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Ready to Begin</h3> {/* Adjust text size */}
                  <p className="text-green-100 text-sm sm:text-base">Selections made successfully</p> {/* Adjust text size */}
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6"> {/* Adjust padding */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"> {/* Adjust gap/margin */}
                {/* Selected Category */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 transition-all"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2"> {/* Adjust margin */}
                    <FaGraduationCap className="text-sky-600 mr-2 text-sm sm:text-base" aria-hidden="true" /> {/* Adjust size, Changed from blue */}
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Category</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">{selectedCategory?.name}</p> {/* Adjust text size */}
                </div>
                {/* Selected Subject */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 transition-all"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2"> {/* Adjust margin */}
                    <FaBookOpen className="text-cyan-600 mr-2 text-sm sm:text-base" aria-hidden="true" /> {/* Adjust size, Changed from indigo */}
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Subject</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">{selectedSubject?.subject_name}</p> {/* Adjust text size */}
                </div>
                {/* Selected Level */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 transition-all"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2"> {/* Adjust margin */}
                    <FaLayerGroup className="text-teal-600 mr-2 text-sm sm:text-base" aria-hidden="true" /> {/* Adjust size, Kept teal */}
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Level</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">{selectedLevel?.name}</p> {/* Adjust text size */}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"> {/* Adjust layout/gap */}
                <motion.button
                  type="button" // Add type
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetSelection}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all font-medium flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500" // Adjust padding/size/focus, Changed focus ring from indigo
                >
                  <FaChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" /> {/* Use ChevronLeft */}
                  Change Selection
                </motion.button>
                
                <motion.button
                  type="button" // Add type
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExam}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-md border border-transparent transition-all font-medium flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" // Kept green
                >
                  Start Exam
                  <FaArrowRight className="ml-2" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Initial State / Welcome Message */}
        {!selectedCategory && !selectedSubject && !selectedLevel && !error && !examReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="bg-white rounded-lg border border-sky-200 overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow, Changed border from blue
          >
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-6 sm:p-8 text-center"> {/* Adjust padding, Changed gradient from blue/indigo */}
              <div className="max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"> {/* Adjust size/margin, Changed from blue */}
                  <FaGraduationCap className="text-white text-2xl sm:text-3xl" aria-hidden="true" /> {/* Adjust size */}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Start Your Assessment</h3> {/* Adjust text size/margin */}
                <p className="text-sm sm:text-base text-gray-600"> {/* Adjust text size */}
                  Follow the steps above: select category, subject, and level to begin.
                </p>
                <div className="mt-4 sm:mt-6"> {/* Adjust margin */}
                  <div className="inline-flex items-center justify-center bg-sky-100 text-sky-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm sm:text-base"> {/* Adjust padding/radius/size, Changed from blue */}
                    <FaArrowRight className="animate-pulse mr-2" aria-hidden="true" />
                    Select a Category to begin
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assessment Process Info */}
            <div className="p-4 sm:p-6 border-t border-sky-100"> {/* Adjust padding, Changed border from blue */}
              <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Assessment Process:</h4> {/* Adjust text size */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4"> {/* Adjust gap */}
                {/* Level 1 Info */}
                <div className="flex-1 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2 text-sky-600"> {/* Adjust margin, Changed from blue */}
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-sky-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0">1</span> {/* Adjust size */}
                    <h5 className="font-medium text-sm sm:text-base">Level 1</h5> {/* Adjust text size */}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Basic concepts assessment.</p> {/* Adjust text size */}
                </div>
                {/* Level 2 Info */}
                <div className="flex-1 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2 text-cyan-600"> {/* Adjust margin, Changed from indigo */}
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0">2</span> {/* Adjust size */}
                    <h5 className="font-medium text-sm sm:text-base">Level 2</h5> {/* Adjust text size */}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Advanced problem solving.</p> {/* Adjust text size */}
                </div>
                {/* Interview Info */}
                <div className="flex-1 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"> {/* Adjust padding/radius */}
                  <div className="flex items-center mb-1 sm:mb-2 text-teal-600"> {/* Adjust margin, Kept teal */}
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold flex-shrink-0">3</span> {/* Adjust size */}
                    <h5 className="font-medium text-sm sm:text-base">Interview</h5> {/* Adjust text size */}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Final teaching ability showcase.</p> {/* Adjust text size */}
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
