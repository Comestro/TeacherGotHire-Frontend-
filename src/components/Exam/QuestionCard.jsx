import React from "react";

const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium">{question.text}</h3>
      <ul className="mt-4 space-y-2">
        {question.options.map((option, index) => (
          <li key={index} className="flex items-center">
            <input
              type="radio"
              id={`option-${index}`}
              name={`question-${question.id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerSelect(question.id, option)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor={`option-${index}`} className="ml-2 text-gray-700">
              {option}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionCard;
