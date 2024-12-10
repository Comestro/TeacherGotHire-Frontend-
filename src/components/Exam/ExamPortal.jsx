import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchQuestions } from "../../features/questionSlice";
import Subheader from "./ExamHeader";
import { IoWarningOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import LeftSidebar from "./LeftSidebar";

const ExamPortal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const reportOptions = [
    "Wrong Translation",
    "Scroll Not Working",
    "Wrong Question",
    "Out of Syllabus",
    "No Solution",
    "Question and Options not visible",
  ];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: questions, loading, error } = useSelector(
    (state) => state.questions
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  // Debug loaded questions
  useEffect(() => {
    if (questions && questions.length > 0) {
      console.log("Loaded Questions:", questions);
    }
  }, [questions]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions have been answered
    const unansweredQuestions = questions.filter((q) => !selectedAnswers[q.id]);

    if (unansweredQuestions.length > 0) {
      setErrorMessage("Please attempt all questions before submitting.");
      return;
    }

    setIsSubmitted(true);
    navigate("/result", { state: { selectedAnswers, questions } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="lg:flex justify-between h-screen bg-gray-100 w-full">
      {/*Left Sidebar */}
     <LeftSidebar/>


      {/* Main Content */}
      <div className="lg:w-[75%] md:p-8 px-10 py-3">
        <Subheader
          totalQuestion={questions?.length || 0}
          subject={currentQuestion}
        />
        {errorMessage && (
          <div className="mb-4 text-red-500 font-semibold">{errorMessage}</div>
        )}
        {currentQuestion ? (
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 w-full px-5 mt-4">
            <div className="flex justify-between ">
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-600 ">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-sm text-gray-500">Not yet answered</p>
                <p className="text-sm text-gray-500">Marked out of 0.50</p>
              </div>
              <div>
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 text-white "
                >
                  <IoWarningOutline className="text-2xl text-gray-500" />
                </button>
                {/* Modal */}
                {isOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
                      <div className="flex justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                          Report Question!
                        </h2>
                        <button
                          onClick={() => setIsOpen(false)}
                          className=" "
                        >
                          <RxCross2 />
                        </button>


                      </div>
                      <ul className="space-y-3">
                        {reportOptions.map((option, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                          >
                            <span>{option}</span>
                            <span className=""><IoWarningOutline className=" text-gray-500" />
                            </span>
                          </li>
                        ))}
                      </ul>
                      {/* <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div> */}
                    </div>
                  </div>
                )}

              </div>

            </div>

            <p className="text-gray-500  font-bold text-lg mb-6">{currentQuestion.text}</p>
            <div className="space-y-4 ">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id={`${currentQuestion.id}-option${idx}`}
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={selectedAnswers[currentQuestion.id] === option}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion.id, option)
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${currentQuestion.id}-option${idx}`}
                    className="text-gray-700 font-semibold"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-full ${currentQuestionIndex === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
              >
                <div className="flex gap-2 justify-center items-center"> <div><FaArrowLeftLong />
                </div><span>Previous</span></div>
              </button>

              {currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={handleNext}
                  className={`px-6 py-2 rounded-full ${currentQuestionIndex === questions.length - 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                >
                  <div className="flex justify-center gap-2 items-center">
                    <span>Next</span>
                    <div><FaArrowRight />
                    </div>
                  </div>
                </button>
              )}

              {currentQuestionIndex === questions.length - 1 && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-red-300 text-white rounded-xl hover:bg-red-600"
                >
                  Finished..
                </button>
              )}
            </div>

          </div>
        ) : (
          <p className="text-red-500">No questions available.</p>
        )}
      </div>

      {/* right sidebar */}

      <div className="hidden lg:block w-full sm:w-[30%] md:w-[20%] bg-white shadow-md border-r border-gray-200 p-4">
        <h3 className="text-xl font-bold text-center text-gray-700 py-4 border-b border-gray-300">
          Questions Navigation <br /> <span className="text-gray-500 font-semibold text-lg ">Finishe attempt..</span>
        </h3>
        {/* <h3 className="text-center font-semibold text-gray-500 mt-2">
          Total Questions ({questions.length})
        </h3> */}
        <ul className="p-2 flex flex-wrap gap-2 mt-2 justify-center sm:justify-start overflow-y-auto max-h-[calc(100vh-150px)]">
          {questions.map((q, index) => (
            <li key={q.id} className="flex">
              <button
                onClick={() => setCurrentQuestionIndex(index)}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${selectedAnswers[q.id] ? "bg-green-500" : "bg-slate-300"
                  } text-white font-bold`}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-center items-center flex-col text-xl font-bold text-center text-gray-700 py-4 border-t my-20 border-gray-300">
          <div> <h1 className="text-gray-500   font-semibold text-4xl ">
            <span style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }} className="text-teal-400">P</span>TPI
          </h1></div>
          <div className=" items-center ">
            <img src="orange-border.svg" alt="" />
          </div>
        </div>
      </div>

    </div>

  );
};

export default ExamPortal;
