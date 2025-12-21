import React, { useState } from "react";
import MathRenderer from "./MathRenderer";
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
      className={`border border-gray-100 rounded-xl p-3 sm:p-4 hover:border-teal-300 hover:shadow-sm transition-all bg-white relative group ${
        isDragging ? "shadow-2xl z-50 ring-2 ring-teal-500" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-teal-100">
            Q{index + 1}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              question.language === "English"
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : "bg-purple-50 text-purple-700 border-purple-100"
            }`}
          >
            {question.language}
          </span>
          {question.id && (
            <span className="text-[10px] font-medium text-gray-400">
              ID: {question.id}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
              title="Drag to reorder"
            >
              <FiMove className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-1.5 rounded-lg transition-all ${
              showOptions
                ? "text-green-600 bg-green-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
            title={showOptions ? "Hide Options" : "Show Options"}
          >
            {showOptions ? (
              <FiEyeOff className="w-4 h-4" />
            ) : (
              <FiEye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(question)}
            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit Question"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Question"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed">
          <MathRenderer text={question.text} />
        </div>
      </div>

      {showOptions && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((option, optIndex) => (
              <div
                key={optIndex}
                className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-3 ${
                  showAnswers && question.correct_option === optIndex + 1
                    ? "border-green-500 bg-green-50/50 text-green-900 font-medium"
                    : "border-gray-100 bg-gray-50/30 text-gray-700"
                }`}
              >
                <div className="shrink-0">
                  {showAnswers && question.correct_option === optIndex + 1 ? (
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <MathRenderer text={option} />
                </div>
              </div>
            ))}
          </div>

          {(showAnswers || showOptions) && question.solution && (
            <div className="mt-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-indigo-700">
                    💡
                  </span>
                </div>
                <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Solution
                </p>
              </div>
              <div className="text-xs sm:text-sm text-indigo-900 leading-relaxed pl-7">
                <MathRenderer text={question.solution} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
