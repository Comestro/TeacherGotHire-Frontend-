import React from "react";

const TeacherLevelCard = ({ subject, marks }) => {
  // Function to calculate the level based on marks
  const getTeacherLevel = (marks) => {
    if (marks >= 90) return "Expert";
    if (marks >= 70) return "Intermediate";
    if (marks >= 50) return "Beginner";
    return "Needs Improvement";
  };

  // Get level
  const level = getTeacherLevel(marks);

  // Level Colors (optional for better UI feedback)
  const levelColor = {
    Expert: "text-green-500",
    Intermediate: "text-blue-500",
    Beginner: "text-yellow-500",
    "Needs Improvement": "text-red-500",
  };

  return (
    <div className="max-w-sm rounded-lg shadow-md bg-white p-6 border">
      <h2 className="text-xl font-semibold text-gray-800">{subject}</h2>
      <p className="mt-2 text-gray-600">Marks: {marks}</p>
      <p className={`mt-4 text-lg font-bold ${levelColor[level]}`}>
        Level: {level}
      </p>
    </div>
  );
};


export default TeacherLevelCard;
