import { useEffect, useState, useRef, useMemo } from "react";
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
  FaBars, FaFilter, FaHome, FaCalendarAlt, FaClock,
  FaRedo, FaLifeRing, FaCopy, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import ExamCenterModal from "./passkeyCard";
import { checkPasskey } from "../../../services/examServices";

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
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Exam center modal states
  const [isExamCenterModalOpen, setIsExamCenterModalOpen] = useState(false);
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [examCenterData, setExamCenterData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");

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

    // Check Level 1 requirement for Level 2.0 and above
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

    // Check Level 2.0 (online) requirement for Level 2.5 (center exam)
    if (level?.level_code === 2.5) {
      const isOnlineLevel2Qualified = checkLevelQualification(
        selectedCategory?.id,
        selectedSubject?.id,
        2.0
      );

      if (!isOnlineLevel2Qualified) {
        setErrors("You must complete Level 2 (Online) first");
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

  const handleExam = async () => {
    // Center exam flow solely by level_code
    if (selectedLevel?.level_code === 2.5) {
      try {
        let examid = examCards?.id;
        if (!examid) {
          const payload = {
            subject_id: selectedSubject?.id,
            class_category_id: selectedCategory?.id,
            level_id: selectedLevel?.id,
          };
          const data = await dispatch(examCard(payload)).unwrap();
          examid = data?.id;
        }
        if (!examid) throw new Error("Exam is not ready yet");

        const response = await checkPasskey({ exam: examid });
        if (response?.passkey === true) {
          setExamCenterData(response.center);
          setShowVerificationCard(true);
        } else {
          setShowVerificationCard(false);
        }
        // setIsExamCenterModalOpen(true);
      } catch (err) {
        setErrors("Failed to check exam status. Please try again.");
      }
    } else {
      // Online exam flow
      navigate("/exam");
    }
  };

  // Retry loading the exam with the last selection
  const retryExamLoad = async () => {
    if (!selectedCategory || !selectedSubject || !selectedLevel) {
      // If selection is incomplete, guide user back to selection panels
      setShowCategoryPanel(!selectedCategory);
      setShowSubjectPanel(!!selectedCategory && !selectedSubject);
      setShowLevelPanel(!!selectedCategory && !!selectedSubject);
      return;
    }
    try {
      setIsLoading(true);
      dispatch(setError(null));
      const payload = {
        subject_id: selectedSubject?.id,
        class_category_id: selectedCategory?.id,
        level_id: selectedLevel?.id,
      };
      await dispatch(examCard(payload)).unwrap();
      setExamReady(true);
    } catch (e) {
      // Error will be reflected from redux `error`
    } finally {
      setIsLoading(false);
    }
  };

  const copyErrorDetails = async () => {
    try {
      const text = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch (_) {
      // no-op if clipboard not available
    }
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

  // Derived progress for the Assessment Process stepper
  const hasLevel1Qualified = useMemo(() => (
    selectedCategory && selectedSubject
      ? checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 1.0)
      : false
  ), [selectedCategory, selectedSubject, attempts]);

  const hasLevel2Qualified = useMemo(() => (
    selectedCategory && selectedSubject
      ? checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.0)
      : false
  ), [selectedCategory, selectedSubject, attempts]);

  const currentStep = useMemo(() => {
    if (selectedLevel?.level_code === 2.5) return 3;
    if (selectedLevel?.level_code === 2.0 || hasLevel2Qualified) return 2;
    if (selectedLevel?.level_code === 1.0 || hasLevel1Qualified) return 1;
    return 0;
  }, [selectedLevel, hasLevel1Qualified, hasLevel2Qualified]);

  return (
    <div className=" min-h-screen w-full flex flex-col md:flex-row gap-0">
      {/* Main selection column */}
      <div className="w-full ">

        <AnimatePresence mode="wait">
          {/* Category Panel */}
          {showCategoryPanel && (
            <motion.div
              key="categories"
              {...pageTransition}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-background p-3 text-text">
                <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                  <FaGraduationCap className="mr-2 sm:mr-3" aria-hidden="true" />
                  Select Class Category / वर्ग चुनें
                </h2>
                <p className="text-text mt-1 text-sm sm:text-base"> {/* Adjust text size, Changed from blue */}
                  Choose from your profile preferences / अपनी प्रोफ़ाइल प्राथमिकताओं में से चुनें
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
                      className="px-4 sm:px-6 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-colors border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
              <div className="bg-background p-4 sm:p-6 text-text">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                    <FaBookOpen className="mr-2 sm:mr-3" aria-hidden="true" />
                    Select Subject
                  </h2>
                  <button
                    type="button" // Add type
                    onClick={handleBackToCategories}
                    className="bg-primary text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Back to categories" // Add aria-label
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>
                <p className="text-text mt-1 text-sm sm:text-base">
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
                              ? 'border-primary ring-primary/30 focus:ring-primary'
                              : 'border-gray-200 hover:border-primary/50 focus:ring-primary'
                            }`}
                          aria-pressed={selectedSubject?.id === subject?.id} // Add aria-pressed
                        >
                          {isQualified && (
                            <div className="absolute top-0 right-0 z-10"> {/* Adjust position slightly */}
                              <div className="bg-success text-white text-xs font-bold py-0.5 px-2 rounded-bl-lg"> {/* Simpler badge */}
                                QUALIFIED
                              </div>
                            </div>
                          )}

                          <div className={`p-3 sm:p-4 transition-colors duration-200 ${ // Adjust padding
                            selectedSubject?.id === subject?.id ? 'bg-primary/5' : 'bg-white'
                            }`}>
                            <div className="flex items-start">
                              <div className={`p-2 sm:p-3 rounded-md mr-3 flex-shrink-0 transition-colors duration-200 ${ // Adjust padding/radius
                                selectedSubject?.id === subject?.id
                                  ? 'bg-primary text-white'
                                  : isQualified
                                    ? 'bg-accent text-white'
                                    : 'bg-primary/10 text-primary'
                                }`}>
                                <FaBookOpen size={20} sm:size={24} aria-hidden="true" /> {/* Adjust size */}
                              </div>
                              <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800"> {/* Adjust text size */}
                                  {subject?.subject_name}
                                </h3>

                                {isQualified && (
                                  <div className="flex items-center text-success text-xs sm:text-sm mt-1.5 sm:mt-2"> {/* Adjust size/margin */}
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
                    <div className="bg-primary/10 p-3 sm:p-4 rounded-full inline-block mb-4">
                      <FaExclamationCircle className="text-primary text-2xl sm:text-3xl" aria-hidden="true" />
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
              <div className="bg-background p-4 sm:p-6 text-text">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                    <FaLayerGroup className="mr-2 sm:mr-3" aria-hidden="true" />
                    Select Level
                  </h2>
                  <button
                    type="button" // Add type
                    onClick={handleBackToSubjects}
                    className="bg-primary text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Back to subjects" // Add aria-label
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>
                <p className="text-text mt-1 text-sm sm:text-base">
                  Choose the assessment level for <span className="font-medium">{selectedSubject?.subject_name}</span>
                </p>
              </div>

              <div className="p-4 sm:p-3">
                {/* Info banner for Level 2.5 eligibility */}
                {checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.0) && (
                  <div className="mb-4 sm:mb-2 p-2 sm:px-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <FaCheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success mt-0.5" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1 text-success">
                        <h3 className="text-sm sm:text-base font-semibold">
                          Congratulations! You're now eligible for Level 2.5 (from Exam Center) and Interview Scheduling.
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-text">
                          You've passed Level 2. You can now take at an exam center for in-person verification, and you're also eligible to schedule your interview!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-3">
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
                        className={`rounded-lg border-2 overflow-hidden relative text-left w-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${isLocked
                          ? 'opacity-60 cursor-not-allowed'
                          : 'cursor-pointer hover:border-primary/60 focus:ring-primary'
                          } ${selectedLevel?.id === level?.id
                            ? 'border-primary ring-primary/30 focus:ring-primary'
                            : isQualified
                              ? 'border-success-light bg-success-light/50 hover:border-success focus:ring-success'
                              : 'border-gray-200 hover:border-gray-300 focus:ring-primary'
                          }`}
                        aria-pressed={selectedLevel?.id === level?.id} // Add aria-pressed
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-500/30 backdrop-blur-[1px] z-10 flex items-center justify-center p-2">
                            <div className="bg-gray-800/90 text-white text-xs sm:text-sm font-medium py-1 px-2 sm:py-1.5 sm:px-3 rounded-md text-center">
                              {level?.level_code === 2.0
                                ? "Complete Level 1 First"
                                : level?.level_code === 2.5
                                  ? "Complete Level 2 (Online) First"
                                  : "Complete Previous Level First"}
                            </div>
                          </div>
                        )}

                        <div className={`p-4 sm:p-5 transition-colors duration-200 ${selectedLevel?.id === level?.id ? 'bg-primary/5' : ''
                          }`}>
                          <div className="flex items-start">

                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-1 mb-1.5 sm:mb-2"> {/* Adjust layout/gap */}
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 order-1 sm:order-none">{level?.name}</h3> {/* Adjust text size */}
                                {/* {level?.level_code && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full order-none sm:order-1 ${ // Adjust padding
                                    level?.level_code === 1.0 ? 'bg-sky-100 text-sky-700' // Changed from blue
                                    : level?.level_code === 2.0 ? 'bg-cyan-100 text-cyan-700' // Changed from purple
                                    : 'bg-amber-100 text-amber-700' // Kept amber
                                  }`}>
                                    Level {level?.level_code}
                                  </span>
                                )} */}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 sm:mb-3">
                                {level?.level_code === 1.0 && "Basic concepts assessment for beginners"}
                                {level?.level_code === 2.0 && "Exam center assessment - In-person verification"}
                                {level?.level_code === 2.5 && "Advanced problem solving - Online assessment"}
                                {!level?.level_code && "Standard assessment level"}
                              </p>

                              {/* Status Badges */}
                              <div className="flex flex-wrap gap-2">
                                {isQualified && (
                                  <div className="flex items-center text-green-700 bg-green-100 py-1 px-2.5 rounded-md border border-green-200 text-xs"> {/* Adjust padding/size */}
                                    <FaCheckCircle className="mr-1.5" aria-hidden="true" />
                                    <span className="font-medium">Qualified</span>
                                  </div>
                                )}

                                {level?.level_code === 2.0 && interviewStatus && (
                                  <div className={`flex items-center py-1 px-2.5 rounded-md border text-xs ${ // Adjust padding/size
                                    interviewStatus === 'fulfilled' ? 'text-green-700 bg-green-100 border-green-200'
                                      : interviewStatus === 'scheduled' ? 'text-primary bg-primary/10 border-primary/30'
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
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 text-center max-w-sm mx-auto"
            >
              <div className="relative mb-4 sm:mb-6"> {/* Adjust margin */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/20 rounded-full mx-auto flex items-center justify-center">
                  <FaSpinner className="text-accent text-2xl sm:text-3xl animate-spin" aria-hidden="true" />
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
            className="rounded-xl border-2 border-error-light bg-error-light to-white p-4 sm:p-6 mb-6 sm:mb-8"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-error text-white">
                <FaExclamationCircle aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-error">
                  We couldn’t prepare your exam / हम आपकी परीक्षा तैयार नहीं कर सके
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-error">
                  <strong>Error: </strong>{typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
                </p>

                {/* Context chips */}
                {(selectedCategory || selectedSubject || selectedLevel) && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs">
                        <FaGraduationCap className="text-error" aria-hidden="true" />
                        {selectedCategory?.name}
                      </span>
                    )}
                    {selectedSubject && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs">
                        <FaBookOpen className="text-error" aria-hidden="true" />
                        {selectedSubject?.subject_name}
                      </span>
                    )}
                    {selectedLevel && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs">
                        <FaLayerGroup className="text-error" aria-hidden="true" />
                        {selectedLevel?.name}
                      </span>
                    )}
                  </div>
                )}



                {/* Actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={retryExamLoad}
                    className="inline-flex items-center justify-center px-4 py-2 bg-error text-white rounded-md hover:bg-error text-sm font-semibold"
                  >
                    <FaRedo className="mr-2" aria-hidden="true" /> Retry / पुनः प्रयास करें
                  </button>
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm font-medium"
                  >
                    <FaChevronLeft className="mr-2" aria-hidden="true" /> Change Selection
                  </button>

                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exam Ready Section */}
        {examReady && !error && (
          <motion.div
            id="exam-ready-section"
            ref={examReadyRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-primary/30 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-primary/20 bg-primary/5">
              <div className="flex items-start sm:items-center gap-3">
                <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white">
                  <FaCheckCircle aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-text">
                    You’re all set / आप शुरू करने के लिए तैयार हैं
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mt-0.5">
                    Review your selections below and start your assessment
                    / नीचे अपनी चयनित जानकारी देखें और परीक्षा शुरू करें
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              {/* Chips summary */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-text border border-primary/20 text-xs sm:text-sm">
                  <FaGraduationCap className="text-primary" aria-hidden="true" />
                  {selectedCategory?.name || '—'}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-text border border-primary/20 text-xs sm:text-sm">
                  <FaBookOpen className="text-primary" aria-hidden="true" />
                  {selectedSubject?.subject_name || '—'}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-text border border-primary/20 text-xs sm:text-sm">
                  <FaLayerGroup className="text-primary" aria-hidden="true" />
                  {selectedLevel?.name || '—'}
                </span>
                {/* Mode chip derived from selected level */}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-text border border-secondary/30 text-xs sm:text-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary" aria-hidden="true"></span>
                  {selectedLevel?.level_code === 2 ? 'Center Exam' : 'Online Exam'}
                </span>
              </div>

              {/* Helpful note */}
              <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
                {selectedLevel?.level_code === 2 ? (
                  <>
                    • You've selected a Center Exam. You'll need to select a center and verify your passcode.
                    <br className="hidden sm:block" />
                    • आपने सेंटर परीक्षा चुनी है। आपको केंद्र चुनना होगा और अपना पासकोड सत्यापित करना होगा।
                  </>
                ) : (
                  <>
                    • Make sure you're in a quiet environment and have stable internet.
                    <br className="hidden sm:block" />
                    • परीक्षा शुरू करने से पहले शांत वातावरण और स्थिर इंटरनेट सुनिश्चित करें।
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetSelection}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all font-medium flex items-center justify-center text-sm"
                >
                  <FaChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Change Selection / चयन बदलें
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExam}
                  className="w-full sm:w-auto px-6 sm:px-7 py-2.5 bg-primary hover:opacity-90 text-white rounded-md border border-transparent transition-all font-semibold flex items-center justify-center text-sm"
                >
                  {selectedLevel?.level_code === 2 ? 'Proceed to Center Selection / केंद्र चयन के लिए आगे बढ़ें' : 'Start Exam / परीक्षा शुरू करें'}
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
            className="bg-white rounded-lg  border border-slate-100 overflow-hidden mb-6 sm:mb-8"
          >
            <div className="bg-background p-6 sm:p-8 text-center">
              <div className="max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-text rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FaGraduationCap className="text-white text-2xl sm:text-3xl" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Start Your Assessment / परीक्षा शुरू करें</h3> {/* Adjust text size/margin */}
                <p className="text-sm sm:text-base text-gray-600"> {/* Adjust text size */}
                  Follow the steps above: select category, subject, and level to begin.  ऊपर दिए गए चरणों का पालन करें: शुरू करने के लिए श्रेणी, विषय और स्तर चुनें।
                </p>
              </div>
            </div>


          </motion.div>
        )}
      </div>

      {/* Exam Center Modal */}
      {isExamCenterModalOpen && (
        <ExamCenterModal
          isOpen={isExamCenterModalOpen}
          onClose={() => {
            setIsExamCenterModalOpen(false);
            setShowVerificationCard(false);
          }}
          isverifyCard={showVerificationCard}
          examCenterData={examCenterData}
          examCards={examCards}
        />
      )}
    </div>
  );
};

export default FilterdExamCard;
