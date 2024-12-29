// import React from "react";

// const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
//   return (
//     <div className="mt-4">
//       <h3 className="text-lg font-medium">{question.text}</h3>
//       <ul className="mt-4 space-y-2">
//         {question.options.map((option, index) => (
//           <li key={index} className="flex items-center">
//             <input
//               type="radio"
//               id={`option-${index}`}
//               name={`question-${question.id}`}
//               value={option}
//               checked={selectedAnswer === option}
//               onChange={() => onAnswerSelect(question.id, option)}
//               className="h-4 w-4 text-blue-600"
//             />
//             <label htmlFor={`option-${index}`} className="ml-2 text-gray-700">
//               {option}
//             </label>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default QuestionCard;
// src/components/QuestionFilter.js

import React, { useState, useMemo } from 'react';
import questions from '../data/questions';

const QuestionFilter = () => {
  const languages = [...new Set(questions.map(q => q.language))];
  const classes = [...new Set(questions.map(q => q.class))];
  const subjects = [...new Set(questions.map(q => q.subject))];

  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      return (
        (selectedLanguage ? q.language === selectedLanguage : true) &&
        (selectedClass ? q.class === selectedClass : true) &&
        (selectedSubject ? q.subject === selectedSubject : true)
      );
    });
  }, [selectedLanguage, selectedClass, selectedSubject]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Filter Questions</h1>
      
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
            <div key={q.id} className="border rounded-md p-4 mb-4 shadow-sm bg-white">
              <h2 className="text-xl font-semibold">{q.subject} - Class {q.class}</h2>
              <p className="text-gray-700 mt-2">{q.text}</p>
              <p className="text-sm text-gray-500 mt-1">Language: {q.language}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No questions match your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionFilter;
