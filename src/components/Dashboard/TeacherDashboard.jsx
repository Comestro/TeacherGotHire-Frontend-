import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
//import ProfileButton from '../Profile_Button/Profile_Button';
import Footer from "../Footer/Footer";
import ResultCard from "../Result/Result";


function TeacherDashboard() {
  const profile = useSelector(
    (state) => state.personalProfile.profileData || []
  );
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      description: "Master numbers and calculations.",
    },
    {
      id: 2,
      name: "Science",
      description: "Dive into the world of experiments and discoveries.",
    },
    {
      id: 3,
      name: "English",
      description: "Improve your grammar and communication skills.",
    },
    {
      id: 4,
      name: "History",
      description: "Explore events that shaped the world.",
    },
  ];

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleProceedToExam = () => {
    alert(`Proceeding to exam for ${selectedSubject.name}`);
    navigate('/exam');
  };

  return (
    <div>
      <nav className="">
        <Navbar
          links={[
            { id: "1", label: "Home", to: "/" },
            { id: "2", label: "Contact US", to: "/contact" },
            { id: "3", label: "AboutUs", to: "/about" },
          ]}
          variant="dark"
          // notifications={notifications}
          //externalComponent={ProfileButton}
        />
      </nav>

      <div className="flex w-full justify-center  mt-10">
        <aside className="w-[25%]">
          {/*
           */}
          <div className="relative max-w-sm mx-auto h-screen bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg rounded-lg p-6 flex flex-col justify-center">
            {/* Profile Image */}
            {profile.map((profile, index) => (
              <div key={index} className="text-center">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <img
                    src={
                      profile.profileImage || "https://via.placeholder.com/150"
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-md"
                  />
                </div>

                {/* Name and Contact Info */}
                <h2 className="text-xl font-bold text-gray-800">
                  {profile.fullname || "Your Name"}
                </h2>
                <p className="text-sm text-gray-600">
                  {profile.email || "your-email@example.com"}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  {profile.phone || "your-phone-number"}
                </p>

                {/* Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/personalprofile")}
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md shadow-md hover:bg-blue-600 transition"
                  >
                    Edit Your Profile
                  </button>
                  <button
                    onClick={() => navigate("/jobprofile")}
                    className="w-full bg-green-500 text-white font-semibold py-2 rounded-md shadow-md hover:bg-green-600 transition"
                  >
                    Edit Your Job Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <section className="">
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center py-10 px-4">
            {/* Welcome Section */}
            {!selectedSubject && (
              <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">
                  Welcome to the PTPI Website!
                </h1>
                <p className="text-gray-700 mb-6">
                  This platform is designed to help teachers excel. You can
                  select a subject, understand the exam process, and proceed to
                  the test.
                </p>
                <p className="text-gray-700 mb-4 font-medium">
                  <span className="text-green-500 font-bold">
                    How it works:
                  </span>{" "}
                  Select a subject below to begin. Each subject has its own
                  dedicated exam process to evaluate your expertise.
                </p>
              </div>
            )}
                <div>
            <ResultCard/>
            </div>

            {/* Subject Selection Section */}
            {!selectedSubject && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl w-full">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer transform hover:scale-105 transition-all"
                  >
                    <h3 className="text-xl font-bold text-blue-700">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 mt-2">{subject.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Subject Details Section */}
            {selectedSubject && (
              <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full text-center">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">
                  Subject: {selectedSubject.name}
                </h2>
                <p className="text-gray-700 mb-6">
                  {selectedSubject.description}
                </p>
                <button
                  onClick={handleProceedToExam}
                  className="bg-blue-500 text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-600 transition"
                >
                  Proceed to Exam
                </button>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Back to Subjects
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default TeacherDashboard;
