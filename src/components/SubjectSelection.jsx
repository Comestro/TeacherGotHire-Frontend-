// import React, { useState } from "react";

// const SubjectSelection = () => {
//   const [selectedSubjects, setSelectedSubjects] = useState([]); // Track selected subjects
//   const [examStarted, setExamStarted] = useState(false); // Flag to check if exam has started
//   const [marks, setMarks] = useState({}); // Store marks for each subject
//   const [subject, setSubject] = useState(""); // Current subject being selected

//   const subjects = [
//     "Mathematics",
//     "Science",
//     "History",
//     "Geography",
//     "English",
//     "Computer Science",
//   ];

//   const handleSubjectChange = (event) => {
//     setSubject(event.target.value); // Set the currently selected subject
//   };

//   const handleAddSubject = () => {
//     if (subject && !selectedSubjects.includes(subject)) {
//       setSelectedSubjects([...selectedSubjects, subject]); // Add the subject to the list
//       setSubject(""); // Clear the dropdown after selection
//     } else {
//       alert("Subject already added or no subject selected.");
//     }
//   };

//   const handleProceedToExam = () => {
//     if (selectedSubjects.length > 0) {
//       setExamStarted(true); // Lock subject selection after exam starts
//     } else {
//       alert("Please select at least one subject before proceeding.");
//     }
//   };

//   const handleFinishExam = (subject) => {
//     // Simulate exam completion and set random marks for the specific subject
//     const randomMarks = Math.floor(Math.random() * 101); // Marks between 0 and 100
//     setMarks((prevMarks) => ({ ...prevMarks, [subject]: randomMarks }));
//   };

//   return (
//     <div className="flex justify-center items-center  bg-gray-100">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full">
//         <h2 className="text-xl font-semibold mb-4">Please Select Subjects</h2>

//         {/* Subject selection dropdown */}
//         {!examStarted ? (
//           <div className="mb-4">
//             <select
//               value={subject}
//               onChange={handleSubjectChange}
//               className="w-full p-2 border border-gray-300 rounded-md mb-4"
//             >
//               <option value="">-- Select Subject --</option>
//               {subjects.map((subject, index) => (
//                 <option key={index} value={subject}>
//                   {subject}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleAddSubject}
//               className="w-full bg-blue-500 text-white py-2 rounded-md"
//             >
//               Add Subject
//             </button>
//           </div>
//         ) : (
//           <div>
//             <p className="text-green-500">You have selected: {selectedSubjects.join(", ")}</p>
//           </div>
//         )}

//         {/* Proceed to Exam Button */}
//         {!examStarted && selectedSubjects.length > 0 && (
//           <button
//             onClick={handleProceedToExam}
//             className="w-full bg-green-500 text-white py-2 rounded-md mt-4"
//           >
//             Proceed to Exam
//           </button>
//         )}

//         {/* Display selected subjects in cards */}
//         <div className="grid grid-cols-2 gap-4 mt-6">
//           {selectedSubjects.map((subject) => (
//             <div
//               key={subject}
//               className="p-4 bg-gray-50 rounded-lg shadow-md border-2 border-gray-300"
//             >
//               <h4 className="text-xl font-semibold mb-2">{subject}</h4>
//               {marks[subject] !== undefined ? (
//                 <p className="text-lg">Marks: {marks[subject]}</p>
//               ) : (
//                 <button
//                   onClick={() => handleFinishExam(subject)}
//                   className="w-full bg-purple-500 text-white py-2 rounded-md"
//                 >
//                   Finish Exam for {subject}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubjectSelection;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

const SubjectSelection = () => {
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Track selected subjects
  const [examStarted, setExamStarted] = useState(false); // Flag to check if exam has started
  const [marks, setMarks] = useState({}); // Store marks for each subject
  const [subject, setSubject] = useState(""); // Current subject being selected
  const [showPopup, setShowPopup] = useState(false); // Flag to show popup
  const [subjectToStart, setSubjectToStart] = useState(""); // Track which subject the user wants to start
  const navigate = useNavigate(); // Use useNavigate for navigation

  const subjects = [
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "English",
    "Computer Science",
  ];

  const handleSubjectChange = (event) => {
    setSubject(event.target.value); // Set the currently selected subject
  };

  const handleAddSubject = () => {
    if (subject && !selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]); // Add the subject to the list
      setSubject(""); // Clear the dropdown after selection
    } else {
      alert("Subject already added or no subject selected.");
    }
  };

  const handleProceedToExam = (subject) => {
    setSubjectToStart(subject); // Track the subject to start
    setShowPopup(true); // Show confirmation popup
  };

  const handleConfirmExamStart = () => {
    setShowPopup(false); // Hide the popup
    navigate(`/exam/${subjectToStart}`); // Redirect to the exam page with the selected subject
  };

  const handleCancelExamStart = () => {
    setShowPopup(false); // Close the popup without redirecting
  };

  const handleFinishExam = (subject) => {
    // Simulate exam completion and set random marks for the specific subject
    const randomMarks = Math.floor(Math.random() * 101); // Marks between 0 and 100
    setMarks((prevMarks) => ({ ...prevMarks, [subject]: randomMarks }));
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Please Select Subjects</h2>

        {/* Subject selection dropdown */}
        {!examStarted ? (
          <div className="mb-4">
            <select
              value={subject}
              onChange={handleSubjectChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddSubject}
              className="w-full bg-blue-500 text-white py-2 rounded-md"
            >
              Add Subject
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-500">You have selected: {selectedSubjects.join(", ")}</p>
          </div>
        )}

        {/* Display selected subjects in cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {selectedSubjects.map((subject) => (
            <div
              key={subject}
              className="p-4 bg-gray-50 rounded-lg shadow-md border-2 border-gray-300"
            >
              <h4 className="text-xl font-semibold mb-2">{subject}</h4>
              {marks[subject] !== undefined ? (
                <p className="text-lg">Marks: {marks[subject]}</p>
              ) : (
                <div>
                  <button
                    onClick={() => handleProceedToExam(subject)}
                    className="w-full bg-green-500 text-white py-2 rounded-md"
                  >
                    Proceed to Exam
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Popup for confirmation */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">
                Are you sure you want to start the exam for {subjectToStart}?
              </h3>
              <div className="flex justify-between">
                <button
                  onClick={handleConfirmExamStart}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelExamStart}
                  className="bg-red-500 text-white py-2 px-4 rounded-md"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelection;
