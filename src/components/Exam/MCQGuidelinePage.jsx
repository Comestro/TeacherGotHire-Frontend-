import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllQues, setLanguage } from "../../features/examQuesSlice";

const MCQGuidelinePage = () => {
  const dispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState(""); 
  const exam = useSelector((state) => state.examQues);
  const examID = exam.exam?.id; 

  // Handle language change
  const handleLanguageChange = (event) => {
    const language = event.target.value;
    setSelectedLanguage(language); // Update selected language in state
    console.log("Selected Language:", language);
  };

  // Handle proceed button click
  const handleProceedClick = () => {
    if (selectedLanguage) {
      dispatch(setLanguage(selectedLanguage)); // Dispatch setLanguage action
      dispatch(getAllQues({ exam_id: examID, language: selectedLanguage })); // Dispatch getAllQues action
      console.log("Proceeding with:", selectedLanguage, examID);
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* Header */}
      <header className="py-2">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center underline">
            Exam Guidelines
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-2">
        <div className="bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Ensure you have a stable internet connection.</li>
            <li>
              Use the latest version of Google Chrome or Mozilla Firefox for the
              best experience.
            </li>
            <li>
              Make sure your device is fully charged or connected to a power
              source.
            </li>
            <li>Read each question carefully before answering.</li>
            <li>
              You cannot go back to previous questions once you move to the next
              one.
            </li>
            <li>Manage your time wisely; each question has a time limit.</li>
            <li>
              Do not refresh the page or press the back button on your browser.
            </li>
            <li>Review your answers if allowed before submitting.</li>
            <li>Click the "Submit" button to finish the test.</li>
            <li>
              If you encounter technical issues, contact support immediately.
            </li>
            <li>
              Ensure no external assistance is used; tests are monitored for
              fairness.
            </li>
          </ul>

          <div className="mt-6">
            {/* Language Selector */}
            <div className="flex flex-col items-start space-y-2">
              <label htmlFor="language" className="text-gray-700 font-medium">
                Choose the language:
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Language
                </option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Checkbox for Agreement */}
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-teal-600"
              />
              <span>I have read and agree to the guidelines</span>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="mt-4 text-center">
            <Link
              to={selectedLanguage ? "/exam" : "#"}
              className={`${
                selectedLanguage
                  ? "bg-teal-600 hover:bg-teal-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white px-4 py-2 rounded`}
              onClick={handleProceedClick}
            >
              Proceed to Exam
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-gray-300 py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">&copy; 2024 Comestro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MCQGuidelinePage;
