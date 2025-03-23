import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import CenterHeader from "../ExamCenter/CenterHeader";
import { Helmet } from "react-helmet-async";
import {
  getExamSets,
  postExamSet,
  putExamSet,
  deleteExamSet,
  postQuestionToExamSet,
  putQuestionToExamSet,
  getSetterInfo,
  getLevels,
} from "../../features/examQuesSlice";
import Loader from "../Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const QuestionManagement = () => {
  const [selectedExamSet, setSelectedExamSet] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    solution: "",
    language: [],
    time: "",
  });
  

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSetterInfo());
    dispatch(getLevels());
  }, [dispatch]);

  const { setterExamSet, loading, setterUser, levels, error } = useSelector(
    (state) => state.examQues
  );
  const [showModal, setShowModal] = useState(false);
  console.log("setterUser", setterUser);
  console.log("selectedExamSet", selectedExamSet);
  console.log("levels", levels);
  console.log("currentQuestion", currentQuestion);
  console.log("setterExamSet", setterExamSet);
  console.log("selectedSubject", selectedSubject);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  
  const subjects = setterUser[0]?.subject;
  console.log("subject", subjects);

  const handleSubjectChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const subject = subjects.find((sub) => sub.id === selectedId);

    if (subject) {
      setSelectedSubject(subject);
      setValue("subject_id", subject.id);
      setValue("class_category", subject.class_category);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch exam sets on mount
  useEffect(() => {
    dispatch(getExamSets());
  }, [dispatch,showModal]);

  // Handle Exam Set Submission
  const onSubmit = async (data) => {
    console.log("data", data);

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
      console.log("payload", payload);

      if (editingIndex !== null) {
        console.log("editingIndex", editingIndex);
        const id = setterExamSet[editingIndex].id;
        console.log("id");
        await dispatch(putExamSet({ payload, id })).unwrap();
      } else {
        console.log("cghbjn");
        await dispatch(postExamSet(payload)).unwrap();
      }
      dispatch(getExamSets()); // Refresh exam sets
      reset();
      setIsEditing(false);
      setEditingIndex(null);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Handle Edit
  const handleEdit = (index) => {
    setEditingIndex(index);
    console.log("editingIndex", editingIndex);
    setIsEditing(true);
    const examSet = setterExamSet[index];
    Object.keys(examSet).forEach((key) => setValue(key, examSet[key]));
  };

  // Handle Delete
  const handleDelete = async (index) => {
    try {
      const id = setterExamSet[index].id;
      await dispatch(deleteExamSet(id)).unwrap();
      dispatch(getExamSets());
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // handle Question Sumbtion
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data being sent:", currentQuestion);

    const payload = {
      text: currentQuestion.text,
      options: currentQuestion.options,
      solution: currentQuestion.solution,
      correctoption: currentQuestion.correctAnswer,
      exam: selectedExamSet.id,
      language: currentQuestion.language,
      time: parseInt(currentQuestion.time),
    };

    console.log("Payload being sent:", payload);

    try {
      if (editingQuestionIndex !== null) {
        const response = await dispatch(putQuestionToExamSet(payload)).unwrap(); // Ensure this function returns a prom
        console.log("API Response:", response);
        toast.success("Ques!");
      } else {
        const response = await dispatch(
          postQuestionToExamSet(payload)
        ).unwrap();
        toast.success("Question is added successfully!");
        
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };
  const languages = [
    ...new Set(selectedExamSet?.questions.map((q) => q.language)),
  ];        
          const [filteredQuestions, setFilteredQuestions] = useState([]);
          const [selectedLanguage, setSelectedLanguage] = useState("All");
          const [editingQuestionId, setEditingQuestionId] = useState(null);
        
          // Update filteredQuestions when selectedLanguage or selectedExamSet changes
          useEffect(() => {
            if (selectedExamSet?.questions) {
              const filtered =
                selectedLanguage === "All"
                  ? selectedExamSet.questions
                  : selectedExamSet.questions.filter(
                      (q) => q.language === selectedLanguage
                    );
              setFilteredQuestions(filtered);
            }
          }, [selectedLanguage, selectedExamSet]);
        
          const handleQuestionTextChange = (questionId, newText) => {
            const updatedQuestions = filteredQuestions.map((question) =>
              question.id === questionId ? { ...question, text: newText } : question
            );
            setFilteredQuestions(updatedQuestions);
          };
        
          const handleOptionChange = (questionId, optionIndex, newOption) => {
            const updatedQuestions = filteredQuestions.map((question) =>
              question.id === questionId
                ? {
                    ...question,
                    options: question.options.map((option, i) =>
                      i === optionIndex ? newOption : option
                    ),
                  }
                : question
            );
            setFilteredQuestions(updatedQuestions);
          };
        
          const handleEditQuestion = (questionId) => {
            setEditingQuestionId(questionId);
          };
        
          const handleSaveQuestion = (questionId) => {
            // Find the updated question
            const updatedQuestion = filteredQuestions.find((q) => q.id === questionId);
          
            // Log the updated question (for debugging)
            console.log("Updated Question:", updatedQuestion);
          
            // Dispatch the updated question to the action
            dispatch(putQuestionToExamSet(updatedQuestion));
          
            // Exit edit mode
            setEditingQuestionId(null);
          };
        
          const handleDeleteQuestion = (questionId) => {
            const updatedQuestions = filteredQuestions.filter(
              (q) => q.id !== questionId
            );
            setFilteredQuestions(updatedQuestions);
          };

  return (
    <>
      <Helmet>
        <title>PTPI | Subject Expert</title>
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen">
        <div className="top-0 fixed w-full">
          <CenterHeader name="Exam Management" />
        </div>
        <div className="mt-16 bg-slate-50 min-h-screen">
          <div className="max-w-6xl mx-auto py-5">
            {loading && <Loader />}

            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl text-teal-600 pl-4">Exam Sets</h1>
              {!isEditing && (
                <button
                  onClick={() => {
                    reset();
                    setIsEditing(true);
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                >
                  Add New Exam Set
                </button>
              )}
            </div>

            {/* Error Message */}
            {/* {error && <div className="text-red-500 text-center">{error}</div>} */}

            {/* Exam Sets List */}
            {setterExamSet && setterExamSet.length === 0 && !isEditing ? (
              <p className="text-gray-600 text-center">
                No exam sets available
              </p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Exam Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {setterExamSet &&
                      setterExamSet.map((examSet, index) => (
                        <tr key={examSet.id}>
                          <td className="px-6 py-4">
                            {examSet.subject.subject_name}
                          </td>
                          <td className="px-6 py-4">
                            {examSet.class_category.name}
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {examSet.type}
                          </td>
                          <td className="py-4 space-x-4 text-center">
                            <button
                              onClick={() => setSelectedExamSet(examSet)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Add Questions
                            </button>
                          </td>
                          <td className="py-4 space-x-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedExamSet(examSet); // Set the selected exam set
                                setShowModal(true); // Open the modal
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              All Questions
                            </button>
                          </td>

                          <td className="py-4 space-x-4 text-center">
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              className="text-red-600 hover:text-red-800"
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

            {/* Exam Set Form */}
            {isEditing && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-6 rounded-lg shadow-md mt-6"
              >
                <h2 className="text-xl font-semibold mb-4">
                  {editingIndex !== null ? "Edit" : "Create"} Exam Set
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      {...register("description", {
                        required: "Description is required",
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.description && (
                      <span className="text-red-500 text-sm">
                        {errors.description.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Level
                    </label>
                    <select
                      {...register("level", {
                        required: "Level is required",
                      })}
                      className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white 
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none 
                       transition-all cursor-pointer text-gray-700"
                    >
                      <option value="" className="text-gray-400">
                        Select a Level
                      </option>
                      {levels.map((lev, index) => (
                        <option key={index} value={lev.id}>
                          {lev.name}
                        </option>
                      ))}
                    </select>

                    {errors.level && (
                      <span className="text-red-500 text-sm">
                        {errors.level.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Type
                    </label>
                    <select
                      {...register("type", { required: "Type is required" })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                    {errors.type && (
                      <span className="text-red-500 text-sm">
                        {errors.type.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="relative flex-1 w-full">
                      <label className="block text-sm font-medium mb-1">
                        Select a Subject
                      </label>
                      <select
                        {...register("subject", {
                          required: "subject is required",
                        })}
                        className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white 
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none 
                       transition-all cursor-pointer text-gray-700"
                        onChange={handleSubjectChange}
                      >
                        <option value="" className="text-gray-400">
                          Select a Subject
                        </option>
                        {setterUser[0]?.subject.map((sub, index) => (
                          <option key={index} value={sub.id}>
                            {sub.subject_name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="hidden"
                        {...register("class_category")}
                        value={selectedSubject?.class_category || ""}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Total Marks
                    </label>
                    <input
                      type="text"
                      {...register("total_marks", {
                        required: "Total Marks is required",
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.total_marks && (
                      <span className="text-red-500 text-sm">
                        {errors.total_marks.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="text"
                      {...register("duration", {
                        required: "Duration is required",
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.duration && (
                      <span className="text-red-500 text-sm">
                        {errors.duration.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  >
                    {editingIndex !== null ? "Save Changes" : "Create Exam Set"}
                  </button>
                </div>
              </form>
            )}

            {/* Question Management Section */}
            {selectedExamSet && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-xl font-mono text-gray-800">
                      {selectedExamSet.subject_name}
                    </p>
                    <div className="text-gray-500 mt-2">
                      {selectedExamSet.class_category_name} |{" "}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExamSet(null)}
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Back to Exam Sets
                  </button>
                </div>

                {/* Question Form */}
                <form
                  onSubmit={handleQuestionSubmit}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold mb-6">
                    Add New Question
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question
                      </label>
                      <textarea
                        value={currentQuestion.text}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            text: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-12"
                        required
                      />
                    </div>
                    {/* Options Input */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium mb-1">
                            Option {index + 1}
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOptions,
                              });
                            }}
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer and Marks Input */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Correct Answer
                        </label>
                        <select
                          // value={currentQuestion.correctAnswer}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              correctAnswer: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Select Correct Answer</option>
                          {currentQuestion.options.map((option, index) => (
                            <option
                              key={index}
                              value={option}
                              disabled={!option}
                            >
                              Option {index + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Choose Language
                        </label>
                        <select
                          value={currentQuestion.language} // Corrected attribute name
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              language: e.target.value, // Corrected attribute name
                            })
                          }
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Select Language</option>
                          <option value="Hindi">Hindi</option>
                          <option value="English">English</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Solution
                      </label>
                      <textarea
                        value={currentQuestion.solution}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            solution: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md h-12"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Time (in hours)
                      </label>
                      <input
                        type="number"
                        step="0.1" // Allows decimal values (e.g., 1.5 for 1 hour and 30 minutes)
                        value={currentQuestion.time}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            time: parseFloat(e.target.value), // Convert the input value to a float
                          })
                        }
                        className="w-full p-2 border rounded-md h-12"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Full-Screen Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white w-full h-full p-6 overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">All Questions</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                      Back to Exam Set
                    </button>
                    <h2 className="text-xl font-semibold mb-6">
                      Exam Questions ({filteredQuestions.length})
                    </h2>
                  </div>
                  {/* Filter Dropdown */}
                  <div className="mb-4">
                    <label className="font-medium mr-2">
                      Filter by Language:
                    </label>
                    <select
                      className="border rounded px-3 py-2"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="All">All</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Render Questions */}
                  {filteredQuestions?.map((question, index) => (
                    <div
                      key={question.id}
                      className="border-b last:border-0 pb-6 mb-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg">
                            Question {index + 1}
                          </h3>
                          <p className="text-gray-500">
                            Marks: {question.total_marks}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Language: {question.language}
                          </p>
                        </div>
                        <div className="space-x-2">
                          {editingQuestionId === question.id ? (
                            <button
                              onClick={() => handleSaveQuestion(question.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditQuestion(question.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Render editable fields if in edit mode */}
                      {editingQuestionId === question.id ? (
                        <>
                          <textarea
                            value={question.text}
                            onChange={(e) =>
                              handleQuestionTextChange(
                                question.id,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded-md mb-4"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-md bg-gray-50"
                              >
                                <span className="font-medium mr-2">
                                  {i + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      question.id,
                                      i,
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 border rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mb-4">{question.text}</p>
                          <div className="grid grid-cols-2 gap-4">
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className={`p-3 rounded-md ${
                                  option === question.correct_option
                                    ? "bg-green-100 border border-green-300"
                                    : "bg-gray-50"
                                }`}
                              >
                                <span className="font-medium mr-2">
                                  {i + 1}.
                                </span>
                                {option}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionManagement;
