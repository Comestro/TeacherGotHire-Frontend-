import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
//import ProfileButton from '../Profile_Button/Profile_Button';
import Footer from "../Footer/Footer";
import ResultCard from "../Result/Result";
import { getSubjects } from "../../features/dashboardSlice";

function TeacherDashboard() {
  const subjects = useSelector((state) => state.dashboard.subjects.data || []);
  console.log("sub", subjects);
  console.log("subject", subjects);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    dispatch(getSubjects());
  }, [dispatch]);

  const handleSubjectSelect = (subjects) => {
    setSelectedSubject(subjects);
  };

  const handleProceedToExam = () => {
    alert(`Proceeding to exam for ${selectedSubject.name}`);
    navigate("/exam");
  };

  return (
    <div className="">
      <div className="flex w-full justify-center">
        <section className="">
          <div className=" flex flex-col items-center py-10 px-4">
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
              <ResultCard />
            </div>

            {/* Subject Selection Section */}
            {/* {!selectedSubject && ( */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl w-full">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.subject_name)}
                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer transform hover:scale-105 transition-all"
                  >
                    <h3 className="text-xl font-bold text-blue-700">
                      {subject.name}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {subject.subject_description}
                    </p>
                  </div>
                ))
              ) : (
                <div>No subjects available</div>
              )}
            </div>

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
      {/* <Footer /> */}
    </div>
  );
}

export default TeacherDashboard;
