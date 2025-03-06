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
  getSetterInfo,
} from "../../features/examQuesSlice";
import { getClassCategory } from "../../features/jobProfileSlice";
import Loader from "../Loader";

const QuestionManagement = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [currentExamSet, setCurrentExamSet] = useState("");
  // const [currentQuestion, setCurrentQuestion] = useState();
  const [selectedExamSet, setSelectedExamSet] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    solution: "",
    marks: 1,
  });
  const dispatch = useDispatch();
  const { setterExamSet, loading, setterUser,error } = useSelector(
    (state) => state.examQues
  );
  console.log("setterUser",setterUser);
  console.log("selectedExamSet", selectedExamSet);

  console.log("currentQuestion", currentQuestion);
  console.log("setterExamSet", setterExamSet);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getSetterInfo());
  }, [dispatch]);

  const { classCategories } = useSelector((state) => state?.jobProfile);
  console.log("classCategories", classCategories);

  const handleClassCategory = (e) => {
    setSelectedClass(e.target.value);
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
  }, [dispatch]);

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
        const id = setterExamSet[editingIndex].id;
        console.log("id",id)
        await dispatch(putExamSet({ payload, id })).unwrap();
      } else {
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

  // Question Actions
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    const updatedExamSet = {
      ...selectedExamSet,
      questions: [
        ...selectedExamSet.questions,
        {
          ...currentQuestion,
          id: Date.now(),
        },
      ],
    };
    postQuestionToExamSet(
      setterExamSet.map((set) =>
        set.id === selectedExamSet.id ? updatedExamSet : set
      )
      
    );
    console.log('hckds')
    setSelectedExamSet(updatedExamSet);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    });
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Subject Expert</title>
      </Helmet>
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
                              onClick={() =>
                                setSelectedExamSet(examSet)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Add Questions
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
                      Subject
                    </label>
                    <input
                      type="number"
                      {...register("subject", {
                        required: "Subject is required",
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.subject && (
                      <span className="text-red-500 text-sm">
                        {errors.subject.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Level
                    </label>
                    <input
                      type="text"
                      {...register("level", { required: "Level is required" })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.level && (
                      <span className="text-red-500 text-sm">
                        {errors.level.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="relative flex-1 w-full">
                      <select
                        {...register("class_category", {
                          required: "Category is required",
                        })}
                        className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white 
                       focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none 
                       transition-all cursor-pointer text-gray-700"
                        value={selectedClass}
                        onChange={handleClassCategory}
                      >
                        <option value="" className="text-gray-400">
                          Select a class Category
                        </option>
                        {classCategories.map((category, index) => (
                          <option key={index} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                        value={currentQuestion.question}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            question: e.target.value,
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
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={currentQuestion.marks}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              marks: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>
                </form>

                {/* Questions List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                   <h2 className="text-xl font-semibold mb-6">
                    Exam Questions ({selectedExamSet.questions.length})
                  </h2>
                  {selectedExamSet.questions.map((question, index) => (
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
                        </div>
                      </div>
                      <p className="mb-4">{question.text}</p>
                      <div className="grid grid-cols-2 gap-4">
                        {question.options.map((option, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-md ${
                              option === question.correctAnswer
                                ? "bg-green-100 border border-green-300"
                                : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium mr-2">{i + 1}.</span>
                            {option.option}
                          </div>
                        ))}
                      </div>
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
