import React, { useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiMove,
} from "react-icons/fi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const QuestionCard = ({
  question,
  index,
  showAnswers,
  onEdit,
  onDelete,
  isDraggable = false,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-300 transition-all ${
        isDragging ? "shadow-2xl z-50" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
            Question {index + 1}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.language === "English"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {question.language}
          </span>
        </div>

        <div className="flex space-x-2">
          {/* Drag handle - only show if draggable */}
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <FiMove className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-lg transition-colors ${
              showOptions
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            title={showOptions ? "Hide Options" : "Show Options"}
          >
            {showOptions ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onEdit(question)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
            title="Edit Question"
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete Question"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        {/* <span className="text-xs text-gray-500">ID: {question.id}</span> */}
        <p className="text-lg text-gray-900 mt-1">{question.text}</p>
      </div>

      {showOptions && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, optIndex) => (
              <div
                key={optIndex}
                className={`p-4 rounded-xl border ${
                  showAnswers && question.correct_option === optIndex + 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  {showAnswers && question.correct_option === optIndex + 1 ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 mr-3" />
                  )}
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          {showAnswers && question.solution && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-900">Solution:</p>
              <p className="mt-1 text-gray-700">{question.solution}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionCard;
