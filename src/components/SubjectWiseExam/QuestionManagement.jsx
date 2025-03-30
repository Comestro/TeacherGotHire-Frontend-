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
  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    solution: "",
    language: [],
    time: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSetterInfo());
    dispatch(getLevels());
  }, [dispatch]);

  const { setterExamSet, loading, setterUser, levels, error } = useSelector(
    (state) => state.examQues
  );
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    // Assuming you fetch this data from an API

    const filtered = setterUser[0]?.class_category
      .map((cat) => ({
        ...cat,
        subjects: setterUser[0]?.subject.filter(
          (s) => s.class_category === cat.id
        ),
      }))
      .filter((item) => item.subjects.length > 0);

    setCategories(filtered);
  }, [setterUser]);
  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const category = categories.find((cat) => cat.id === categoryId);

    setSelectedCategory(category);
    setSubjects(category?.subjects || []);
    setSelectedSubject(null); // Reset subject when category changes
  };

  console.log("exam set value", setterExamSet);

  const handleSubjectChange = (e) => {
    const subjectId = parseInt(e.target.value);
    const subject = subjects.find((sub) => sub.id === subjectId);
    setSelectedSubject(subject);
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
  }, [dispatch, showModal]);

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

    setIsSubmitting(true); // Start loading

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
        const response = await dispatch(putQuestionToExamSet(payload)).unwrap();
        console.log("API Response:", response);
        toast.success("Question updated successfully!");
      } else {
        const response = await dispatch(
          postQuestionToExamSet(payload)
        ).unwrap();
        toast.success("Question is added successfully!");
      }
      // Reset form after successful submission
      setCurrentQuestion({
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        solution: "",
        language: [],
        time: "",
      });
      setEditingQuestionIndex(null);
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to submit question");
    } finally {
      setIsSubmitting(false); // Stop loading
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

          {/* Exam Sets List */}
          {setterExamSet && setterExamSet.length === 0 && !isEditing ? (
            <p className="text-gray-600 text-center">No exam sets available</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Exam Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Class Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      View
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
                        <td className="px-6 py-4">
                          {examSet.level.name}
                        </td>
                        <td className="px-6 py-4 capitalize">{examSet.type}</td>
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
              className="bg-white p-8 rounded-lg shadow-sm mt-6 border"
            >
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingIndex !== null ? "Edit" : "Create"} Exam Set
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Fill in the details below to{" "}
                  {editingIndex !== null ? "update" : "create"} your exam set
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Category - First Field */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Class Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("class_category", {
                      required: "Class category is required",
                    })}
                    id="category"
                    onChange={handleCategoryChange}
                    value={selectedCategory?.id || ""}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.class_category && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.class_category.message}
                    </p>
                  )}
                </div>

                {/* Subject Select */}
                {selectedCategory && (
                  <div className="md:col-span-2">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("subject", {
                        required: "Subject is required",
                      })}
                      id="subject"
                      onChange={handleSubjectChange}
                      value={selectedSubject?.id || ""}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("level", { required: "Level is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                  >
                    <option value="">Select a Level</option>
                    {levels.map((lev) => (
                      <option key={lev.id} value={lev.id}>
                        {lev.name}
                      </option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.level.message}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("type", { required: "Type is required" })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("total_marks", {
                      required: "Total marks is required",
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                  />
                  {errors.total_marks && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.total_marks.message}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("duration", {
                      required: "Duration is required",
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                {/* Description - Last Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
                    placeholder="Enter exam set description..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200"
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
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="border-b border-gray-100 pb-6 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Add New Question
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Fill in the question details below
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Question Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentQuestion.text}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          text: e.target.value,
                        })
                      }
                      className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 min-h-[100px] transition-all duration-200"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-teal-500 transition-all duration-200"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Option {index + 1}{" "}
                          <span className="text-red-500">*</span>
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
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200"
                          placeholder={`Enter option ${index + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer and Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correct Answer <span className="text-red-500">*</span>
                      </label>
                      <select
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="">Select Correct Answer</option>
                        {currentQuestion.options.map((option, index) => (
                          <option key={index} value={option} disabled={!option}>
                            Option {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={currentQuestion.language}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            language: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 bg-white"
                        required
                      >
                        <option value="">Select Language</option>
                        <option value="Hindi">Hindi</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                  </div>

                  {/* Solution and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Solution{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={currentQuestion.solution}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            solution: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 min-h-[80px] transition-all duration-200"
                        placeholder="Enter solution explanation..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time (minutes) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentQuestion.time}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            time: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200"
                        placeholder="Enter time in minutes"
                        required
                      />
                    </div>
                  </div>

                  {/* Question Form Buttons */}
                  <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExamSet(null);
                        setCurrentQuestion({
                          text: "",
                          options: ["", "", "", ""],
                          correctAnswer: "",
                          solution: "",
                          language: [],
                          time: "",
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting} // Disable button while submitting
                      className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 ${
                        isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add Question
                        </>
                      )}
                    </button>
                  </div>
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
                        {/* <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                        >
                          Delete
                        </button> */}
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
                            <div key={i} className="p-3 rounded-md bg-gray-50">
                              <span className="font-medium mr-2">{i + 1}.</span>
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
                              <span className="font-medium mr-2">{i + 1}.</span>
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
    </>
  );
};

export default QuestionManagement;
