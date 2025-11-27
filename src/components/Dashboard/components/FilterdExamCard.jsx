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
  FaRedo, FaLifeRing, FaCopy, FaChevronDown, FaChevronUp,
  FaLock, FaMapMarkerAlt, FaUserTie, FaInfoCircle
} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import InterviewCard from "./InterviewCard";
import ExamCenterModal from "./passkeyCard";
import { checkPasskey } from "../../../services/examServices";
import ErrorMessage from "../../ErrorMessage";

import { forwardRef, useImperativeHandle } from "react";

const FilterdExamCard = forwardRef(({ onExamDataChange }, ref) => {
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
  const [showInterviewPanel, setShowInterviewPanel] = useState(false);
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

  useImperativeHandle(ref, () => ({
    openInterview: (categoryId, subjectId) => {
      // Find category and subject objects
      const category = classCategories?.find(c => c.id === categoryId);
      const subject = category?.subjects?.find(s => s.id === subjectId);

      if (category && subject) {
        setSelectedCategory(category);
        setSelectedSubject(subject);
        setSelectedLevel(null);
        setExamReady(false);
        setShowCategoryPanel(false);
        setShowSubjectPanel(false);
        setShowLevelPanel(false);
        setShowInterviewPanel(true);
      }
    },
    resetView: () => {
      resetSelection();
    }
  }));

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

    if (level?.level_code === 2.5) {
      const isOnlineLevel2Qualified = checkLevelQualification(
        selectedCategory?.id,
        selectedSubject?.id,
        2.0
      );

      if (!isOnlineLevel2Qualified) {
        setErrors("You must complete Level 2 (from home) first");
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

  const handleInterviewSelect = () => {
    setShowLevelPanel(false);
    setShowInterviewPanel(true);
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
    setShowInterviewPanel(false);
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
        setIsExamCenterModalOpen(true);
      } catch (err) {
        setErrors("Failed to check exam status. Please try again.");
      }
    } else {
      // Online exam flow
      navigate("/exam");
    }
  };

  const handleBackToCategories = () => {
    setShowCategoryPanel(true);
    setShowSubjectPanel(false);
    setExamReady(false);
    setSelectedSubject(null);
    setSelectedLevel(null);
    dispatch(setError(null));
  };

  const handleBackToSubjects = () => {
    setShowSubjectPanel(true);
    setShowLevelPanel(false);
    setExamReady(false);
    setSelectedLevel(null);
    dispatch(setError(null));
  };

  const handleBackToLevels = () => {
    setShowLevelPanel(true);
    setShowInterviewPanel(false);
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

        {/* Top Error Alert */}
        <AnimatePresence>
          {(error || errors) && (
            <ErrorMessage
              message={error || errors}
              onDismiss={() => {
                dispatch(setError(null));
                setErrors(null);
              }}
              className="mb-6"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Category Panel */}
          {showCategoryPanel && (
            <motion.div
              key="categories"
              {...pageTransition}
              className="rounded-lg overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-background text-text">
                <h2 className="text-lg sm:text-xl font-bold flex items-center"> {/* Adjust text size */}
                  <FaGraduationCap className="mr-2 sm:mr-3" aria-hidden="true" />
                  Select Class Category / वर्ग चुनें
                </h2>
                <p className="text-text mt-1 text-sm sm:text-base"> {/* Adjust text size, Changed from blue */}
                  Choose from your profile preferences / अपनी प्रोफ़ाइल प्राथमिकताओं में से चुनें
                </p>
              </div>

              <div className="p-0 mt-4 sm:p-6"> {/* Adjust padding */}
                {classCategories?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"> {/* Adjust gap */}
                    {classCategories?.map((category) => {
                      const isCategoryQualified = qualifiedSubjects.some(q => q.categoryId === category.id);
                      return (
                        <motion.button // Change to button
                          key={category.id}
                          type="button" // Add type
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategorySelect(category)}
                          className={`text-left w-full rounded-lg border-2 transition-all overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-offset-2 ${ // Use button styles, focus ring
                            selectedCategory?.id === category.id
                              ? 'border-sky-500 ring-sky-300 focus:ring-sky-500' // Changed from blue
                              : 'border-gray-200 hover:border-sky-300 focus:ring-sky-500' // Changed from blue
                            }`}
                          aria-pressed={selectedCategory?.id === category.id} // Add aria-pressed
                        >
                          {isCategoryQualified && (
                            <div className="absolute top-0 right-0 z-10">
                              <div className="bg-green-500 text-white text-[10px] font-bold py-0.5 px-2 rounded-bl-lg uppercase tracking-wider">
                                Qualified
                              </div>
                            </div>
                          )}
                          <div className={`p-3 sm:p-4 transition-colors duration-200 ${ // Adjust padding
                            selectedCategory?.id === category.id ? 'bg-sky-50' : 'bg-white' // Changed from blue
                            }`}>
                            <div className="flex items-start">
                              <div className={`p-2 sm:p-3 rounded-md mr-3 flex-shrink-0 transition-colors duration-200 ${ // Adjust padding/radius
                                selectedCategory?.id === category.id
                                  ? 'bg-sky-500 text-white' // Changed from blue
                                  : isCategoryQualified ? 'bg-green-100 text-green-600' : 'bg-sky-100 text-sky-600' // Changed from blue
                                }`}>
                                {isCategoryQualified ? <FaCheckCircle size={20} /> : <FaGraduationCap size={20} sm:size={24} aria-hidden="true" />}
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
                      )
                    })}
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
              className="overflow-hidden mb-6 sm:mb-8" // Use rounded-lg, remove shadow
            >
              <div className="bg-background text-text">
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

          {/* Level Panel - Redesigned Flow */}
          {showLevelPanel && (
            <motion.div
              key="levels"
              {...pageTransition}
              className="md:rounded-lg overflow-hidden mb-6 sm:mb-8"
            >
              <div className="text-text">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center">
                    <FaLayerGroup className="mr-2 sm:mr-3" aria-hidden="true" />
                    Assessment Journey
                  </h2>
                  <button
                    type="button"
                    onClick={handleBackToSubjects}
                    className="bg-primary text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>

                <p className="text-text mt-1 text-sm sm:text-base text-center">
                  Current Subject: <span className="font-medium">{selectedSubject?.subject_name}</span>
                </p>
              </div>

              <div className="">
                <div className="space-y-4 max-w-3xl mx-auto pb-5 mt-3">
                  {/* Level 1 Card */}
                  {/* Level 1 Card */}
                  {levels.filter(l => l.level_code === 1.0).map(level => {
                    const isQualified = checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 1.0);
                    return (
                      <div key={level.id} className={`relative rounded-2xl border transition-all duration-300 overflow-hidden group ${isQualified
                        ? 'bg-white border-teal-200 shadow-sm hover:shadow-md'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300'
                        }`}>
                        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
                          {/* Icon Section */}
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${isQualified
                            ? 'bg-teal-50 text-teal-600'
                            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-105 transition-transform duration-300'
                            }`}>
                            {isQualified ? (
                              <FaCheckCircle className="text-2xl sm:text-3xl" />
                            ) : (
                              <span className="text-2xl sm:text-3xl font-bold font-mono">01</span>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-start gap-2 mb-1">
                              <h3 className="font-bold text-lg sm:text-xl text-slate-800">
                                Level 1: (from home)
                              </h3>
                              {isQualified && (
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  Passed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                              Fundamental concepts check. This is a mandatory step to unlock advanced levels.
                            </p>
                          </div>

                          {/* Action Section */}
                          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                            {isQualified ? (
                              <div className="w-full md:w-auto px-5 py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-teal-100">
                                <FaCheckCircle />
                                <span>Completed</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleLevelSelect(level)}
                                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group-hover:ring-2 group-hover:ring-blue-200 group-hover:ring-offset-1"
                              >
                                <span>Start Exam</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connector */}
                  <div className="hidden lg:block h-6 w-0.5 bg-gray-300 mx-auto" />

                  {/* Level 2 Card */}
                  {/* Level 2 Card */}
                  {levels.filter(l => l.level_code === 2.0).map(level => {
                    const isQualified = checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.0);
                    const isLocked = !checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 1.0);

                    return (
                      <div key={level.id} className={`relative rounded-2xl border transition-all duration-300 overflow-hidden group ${isLocked
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : isQualified
                          ? 'bg-white border-teal-200 shadow-sm hover:shadow-md'
                          : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300'
                        }`}>
                        {isLocked && (
                          <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2 text-slate-500 font-medium text-sm">
                              <FaLock className="text-slate-400" />
                              <span>Complete Level 1 to Unlock</span>
                            </div>
                          </div>
                        )}

                        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
                          {/* Icon Section */}
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${isLocked
                            ? 'bg-slate-200 text-slate-400'
                            : isQualified
                              ? 'bg-teal-50 text-teal-600'
                              : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-105 transition-transform duration-300'
                            }`}>
                            {isLocked ? (
                              <FaLock className="text-2xl" />
                            ) : isQualified ? (
                              <FaCheckCircle className="text-2xl sm:text-3xl" />
                            ) : (
                              <span className="text-2xl sm:text-3xl font-bold font-mono">02</span>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-start gap-2 mb-1">
                              <h3 className={`font-bold text-lg sm:text-xl ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                                Level 2: (from home)
                              </h3>
                              {isQualified && (
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  Passed
                                </span>
                              )}
                              {!isLocked && !isQualified && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  From Home
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                              In-depth subject knowledge test. Demonstrate your expertise to proceed to the final stage.
                            </p>
                          </div>

                          {/* Action Section */}
                          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                            {!isLocked && (
                              <>
                                {isQualified ? (
                                  <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                      onClick={() => handleLevelSelect(level)}
                                      className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium text-sm transition-colors"
                                    >
                                      Reattempt
                                    </button>
                                    <div className="px-4 py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-teal-100">
                                      <FaCheckCircle />
                                      <span className="hidden sm:inline">Done</span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleLevelSelect(level)}
                                    className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group-hover:ring-2 group-hover:ring-indigo-200 group-hover:ring-offset-1"
                                  >
                                    <span>Start Exam</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Connector */}
                  <div className="hidden lg:block h-6 w-0.5 bg-gray-300 mx-auto" />

                  {/* Final Stage: Split into Center Exam & Interview */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Center Exam Card */}
                    {levels.filter(l => l.level_code === 2.5).map(level => {
                      const isLocked = !checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.0);
                      const isQualified = checkLevelQualification(selectedCategory?.id, selectedSubject?.id, 2.5);

                      // Find the attempt for this level to get the score
                      const attempt = attempts?.find(a =>
                        a?.exam?.class_category_id === selectedCategory?.id &&
                        a?.exam?.subject_id === selectedSubject?.id &&
                        a?.exam?.level_code === 2.5
                      );

                      return (
                        <div key={level.id} className={`relative rounded-xl border-2 transition-all bg-white overflow-hidden ${isLocked ? 'border-gray-200 opacity-75' : isQualified ? 'border-green-200' : 'border-purple-200 shadow-sm'
                          }`}>
                          {isLocked && <div className="absolute inset-0 bg-gray-50/50 z-10 cursor-not-allowed" />}
                          <div className="p-2 lg:p-4 flex flex-col gap-3 h-full">
                            <div className="flex items-center gap-3">
                              <div className={`hidden lg:flex w-8 md:w-10 h-8 md:h-10 rounded-full items-center justify-center shrink-0 ${isLocked ? 'bg-gray-100 text-gray-400' : isQualified ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {isQualified ? <FaCheckCircle /> : <FaMapMarkerAlt />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-xs lg:text-base text-gray-800 truncate">Level 2 (Exam Center)</h3>
                                {isQualified && attempt?.calculate_percentage !== undefined && (
                                  <span className="text-xs font-semibold text-green-600">
                                    Score: {attempt.calculate_percentage}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 flex-1">
                              {isQualified
                                ? "You have successfully completed the center exam."
                                : "Visit an exam center for verification."}
                            </p>
                            {!isLocked && (
                              <div className="mt-auto">
                                {isQualified ? (
                                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <FaCheckCircle className="mr-1.5" size={12} />
                                    Qualified
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleLevelSelect(level)}
                                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                                  >
                                    Select Center
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Interview Card */}
                    <div className={`relative rounded-xl border-2 transition-all bg-white overflow-hidden ${!hasLevel2Qualified ? 'border-gray-200 opacity-75' : 'border-cyan-200 shadow-sm'
                      }`}>
                      {!hasLevel2Qualified && <div className="absolute inset-0 bg-gray-50/50 z-10 cursor-not-allowed" />}
                      <div className="p-2 lg:p-4 flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-3">
                          <div className={`hidden lg:flex w-8 h-8 md:w-12 md:h-12 rounded-full items-center justify-center shrink-0 ${!hasLevel2Qualified ? 'bg-gray-100 text-gray-400' : 'bg-cyan-100 text-cyan-600'
                            }`}>
                            <FaUserTie />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs lg:text-base text-gray-800">Interview</h3>
                            {(() => {
                              const relevantAttempt = attempts?.find(attempt =>
                                attempt?.exam?.class_category_id === selectedCategory?.id &&
                                attempt?.exam?.subject_id === selectedSubject?.id &&
                                (attempt?.exam?.level_code === 2.0 || attempt?.exam?.level_code === 2)
                              );
                              const latestInterview = relevantAttempt?.interviews?.sort((a, b) =>
                                new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
                              )[0];

                              if (latestInterview?.grade !== undefined && latestInterview?.grade !== null && latestInterview?.status == 'fulfilled') {
                                return (
                                  <span className={`text-xs font-semibold ${latestInterview.grade >= 6 ? 'text-green-600' : 'text-amber-600'}`}>
                                    Grade: {latestInterview.grade}/10
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 flex-1">Final interview assessment.</p>
                        {hasLevel2Qualified && (
                          <div className="mt-auto">
                            {getInterviewStatus(selectedCategory?.id, selectedSubject?.id) ? (
                              <div className="flex flex-col gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${getInterviewStatus(selectedCategory?.id, selectedSubject?.id) === 'fulfilled'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                                  }`}>
                                  {getInterviewStatus(selectedCategory?.id, selectedSubject?.id) === 'fulfilled' ? (
                                    <><FaCheckCircle className="mr-1.5" size={12} /> Qualified</>
                                  ) : (
                                    <><FaClock className="mr-1.5" size={12} /> {getInterviewStatus(selectedCategory?.id, selectedSubject?.id)}</>
                                  )}
                                </span>
                                <button
                                  onClick={handleInterviewSelect}
                                  className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold text-left"
                                >
                                  View Details →
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={handleInterviewSelect}
                                className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium text-sm"
                              >
                                Schedule
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* Interview Panel */}
          {showInterviewPanel && (
            <motion.div
              key="interview"
              {...pageTransition}
              className="bg-white rounded-lg md:border border-gray-200 overflow-hidden mb-6 sm:mb-8"
            >
              <div className="bg-background p-4 sm:p-6 text-text border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center">
                    <FaCalendarAlt className="mr-2 sm:mr-3" aria-hidden="true" />
                    Interview Assessment
                  </h2>
                  <button
                    type="button"
                    onClick={handleBackToLevels}
                    className="bg-primary text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Back to levels"
                  >
                    <FaChevronLeft className="mr-1" aria-hidden="true" />
                    Back
                  </button>
                </div>
                <p className="text-text mt-1 text-sm sm:text-base">
                  Manage your interview for <span className="font-medium">{selectedSubject?.subject_name}</span>
                </p>
              </div>

              <div className="p-0">
                <InterviewCard />
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



        {/* Exam Ready Modal */}
        <AnimatePresence>
          {examReady && selectedLevel && !error && !showInterviewPanel && !isExamCenterModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FaCheckCircle className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Ready to Begin</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Your exam is configured and ready</p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {/* Exam Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Subject</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedSubject?.subject_name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Level</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedLevel?.name}</span>
                    </div>
                  </div>


                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setExamReady(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      onClick={handleExam}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {selectedLevel?.level_code === 2.5 ? 'Select Center' : 'Start Exam'}
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Initial State / Welcome Message */}
        {
          !selectedCategory && !selectedSubject && !selectedLevel && !error && !examReady && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className="bg-white rounded-lg  border border-slate-100 overflow-hidden mb-6 sm:mb-8"
            >
              <div className="bg-background p-6 sm:p-8 text-center">
                <div className="w-full mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <FaGraduationCap className="text-slate-500 text-2xl sm:text-3xl" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2 sm:mb-3">Start Your Assessment / परीक्षा शुरू करें</h3> {/* Adjust text size/margin */}
                  <p className="text-sm sm:text-base text-gray-400"> {/* Adjust text size */}
                    Follow the steps above: select category, subject, and level to begin. <br /> ऊपर दिए गए चरणों का पालन करें: शुरू करने के लिए श्रेणी, विषय और स्तर चुनें।
                  </p>
                </div>
              </div>


            </motion.div>
          )
        }
      </div >

      {/* Exam Center Modal */}
      {
        isExamCenterModalOpen && (
          <ExamCenterModal
            isOpen={isExamCenterModalOpen}
            onClose={() => {
              setIsExamCenterModalOpen(false);
              setShowVerificationCard(false);
            }}
            isverifyCard={showVerificationCard}
            examCenterData={examCenterData}
            examCards={examCards}
            onPasskeyGenerated={onExamDataChange}
          />
        )
      }
    </div >
  );
});

export default FilterdExamCard;
