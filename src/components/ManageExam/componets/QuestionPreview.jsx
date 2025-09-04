import React from 'react';
import { FiCheck } from 'react-icons/fi';
import MathRenderer from './MathRenderer';

const QuestionPreview = ({ question, activeLanguage }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            {activeLanguage === "English" ? "🇺🇸" : "🇮🇳"} {activeLanguage} Version:
          </h4>
          <p className="text-gray-700 mb-3 font-medium">
            <MathRenderer text={question.text || 'Question text will appear here...'} />
          </p>
          <div className="space-y-2">
            {question.options.map((opt, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg flex items-center space-x-2 transition-colors ${
                  question.correct_option === idx 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="font-semibold min-w-6">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span><MathRenderer text={opt || `Option ${idx + 1}`} /></span>
                {question.correct_option === idx && (
                  <FiCheck className="w-4 h-4 ml-auto text-green-600" />
                )}
              </div>
            ))}
          </div>
          {question.solution && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-1">Solution:</h5>
              <p className="text-blue-800 text-sm">
                <MathRenderer text={question.solution} />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPreview;