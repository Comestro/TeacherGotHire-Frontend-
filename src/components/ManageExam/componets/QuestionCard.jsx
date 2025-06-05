import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const QuestionCard = ({ question, index, showAnswers, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-300 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
            Question {index + 1}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            question.language === 'English' 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {question.language}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-lg transition-colors ${
              showOptions 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-600 hover:bg-gray-50'
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
        <p className="text-lg text-gray-900">{question.text}</p>
      </div>
      
      {showOptions && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, optIndex) => (
              <div 
                key={optIndex}
                className={`p-4 rounded-xl border ${
                  showAnswers && question.correct_option === optIndex + 1
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
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