import React from 'react';

const ExamPortal = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-4">Exam Portal</h1>
      <p className="text-lg text-gray-700 mb-6">
        Welcome to the exam portal. Please follow the instructions carefully and submit your answers before the timer runs out.
      </p>
      <ul className="list-disc pl-5 text-gray-600 mb-6">
        <li className="mb-2">Read all the questions carefully.</li>
        <li className="mb-2">Submit your answers using the provided form.</li>
        <li>Best of luck!</li>
      </ul>
      <div className="text-center">
        <button
          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default ExamPortal;
