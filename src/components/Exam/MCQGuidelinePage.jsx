import React from 'react';
import { Link } from 'react-router-dom';

const MCQGuidelinePage = () => {
  return (
    <div className="min-h-screen text-gray-800">
      {/* Header */}
      <header className="py-2">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center underline">Exam Guidelines</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-2">
        <div className="bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Ensure you have a stable internet connection.</li>
            <li>Use the latest version of Google Chrome or Mozilla Firefox for the best experience.</li>
            <li>Make sure your device is fully charged or connected to a power source.</li>
            <li>Read each question carefully before answering.</li>
            <li>You cannot go back to previous questions once you move to the next one.</li>
            <li>Manage your time wisely; each question has a time limit.</li>
            <li>Do not refresh the page or press the back button on your browser.</li>
            <li>Review your answers if allowed before submitting.</li>
            <li>Click the "Submit" button to finish the test.</li>
            <li>If you encounter technical issues, contact support immediately.</li>
            <li>Ensure no external assistance is used; tests are monitored for fairness.</li>
          </ul>

          <div className="mt-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-teal-600" />
              <span>I have read and agree to the guidelines</span>
            </label>
          </div>

          <div className="mt-4 text-center">
            <Link to="/exam" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
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
