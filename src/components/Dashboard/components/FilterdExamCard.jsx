import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLevel } from "../../../services/examQuesServices";
import { examCard } from "../../../features/examSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { setError } from "../../../features/examSlice";

const ClassSelectionCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prefrence } = useSelector((state) => state.jobProfile);
  const classCategories = useSelector(
    (state) => state.jobProfile.prefrence.class_category
  );
  console.log("prefrence", prefrence);
  const { examCards, error } = useSelector((state) => state?.exam);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [levels, setLevels] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [progress, setProgress] = useState(0);
  console.log("error", error);
  console.log("examCards", examCards);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const levels = await fetchLevel();
        setLevels(levels);
        console.log("Fetched levels:", levels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };

    fetchData();
  }, []);
  console.log("selectedLevel", selectedLevel);
  console.log("levels", levels);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubject(null);
    setSelectedLevel(levels?.data);
    setShowResultCard(false);
  };

  console.log("selectedCategory", selectedCategory);
  const handleSubjectSelect = (subject) => {
    console.log("subject", subject);
    setSelectedSubject(subject);
    setSelectedLevel(null);
    setShowResultCard(false);
  };
  console.log("selectedSubject", selectedSubject);

  const handleLevelSelect = async (level) => {
    // Validate selections
    if (!selectedSubject || !selectedCategory) {
      setErrors("Please select both category and subject first");
      return;
    }

    try {
      setIsLoading(true);
      setErrors(null);
      setSelectedLevel(level);

      const payload = {
        subject_id: selectedSubject.id,
        class_category_id: selectedCategory.id,
        level_id: level.id,
      };

      // Dispatch async action
      await dispatch(examCard(payload)).unwrap();

      // Only show result on success
      setShowResultCard(true);
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
    setShowResultCard(false);

    dispatch(setError());
  };

  const handleExam = () => {
    navigate("/exam");
  };

  return (
    <>
      <div className=" bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Loading Overlay */}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">
                Preparing Your Exam
              </h3>
              <p className="text-gray-600 mt-2">Just a moment...</p>
            </div>
          </motion.div>
        )}

        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-6 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Course Selection</h2>
              <p className="text-blue-100 mt-1">Choose your learning path</p>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    <div className="mt-3">
                      <button
                        onClick={resetSelection}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                      >
                        <svg
                          className="-ml-0.5 mr-2 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Change Selection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Content */}
            <div className="p-6">
              {/* Step 1: Category Selection */}
              {!selectedCategory && (
                <motion.div
                  key="category"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Select Class Category
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {classCategories?.map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategorySelect(category)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left flex items-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                          {category.name.charAt(0)}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Subject Selection */}

              {selectedCategory && !selectedSubject && (
                <motion.div
                  key="subject"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-6"
                >
                  <div className="flex items-center mb-4">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setProgress(0);
                      }}
                      className="mr-2 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Select Subject for {selectedCategory.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedCategory?.subjects?.map((subject) => (
                      <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubjectSelect(subject)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left flex items-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                          {subject.subject_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium block">
                            {subject.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {subject.subject_name}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Level Selection */}

              {selectedSubject && !selectedLevel && (
                <motion.div
                  key="level"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="mb-6"
                >
                  <div className="flex items-center mb-4">
                    <button
                      onClick={() => {
                        setSelectedSubject(null);
                        setProgress(33);
                      }}
                      className="mr-2 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Select Level for {selectedSubject.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {levels?.map((level) => (
                      <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLevelSelect(level)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{level.name}</span>
                          <span className="text-blue-600">→</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Result Card */}
              <AnimatePresence>
                {showResultCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-6 border border-green-200 bg-green-50 rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-green-800">
                        Your Selection
                      </h3>
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 font-medium text-gray-600">
                          Category:
                        </span>
                        <span className="font-semibold">
                          {selectedCategory?.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 font-medium text-gray-600">
                          Subject:
                        </span>
                        <span className="font-semibold">
                          {selectedSubject?.subject_name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 font-medium text-gray-600">
                          Level:
                        </span>
                        <span className="font-semibold">
                          {selectedLevel?.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={resetSelection}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Change Selection
                      </button>
                      <button
                        onClick={handleExam}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        Start Exam
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ClassSelectionCard;
