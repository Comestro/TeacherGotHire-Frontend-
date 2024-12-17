import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSubjects } from "../../features/dashboardSlice";
import ExamLevelCard from "./ExamLevelCard";
import JobProfileCard from "./JobProfileCard";
import PrefrenceLocation from "./PrefrenceLocation";

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

  const sub = ["Mathematics", "Physics", "Programming"];
  const location = ["Madhubani", "Pratap Nagar"];

  return (
    <div className="min-h-screen bg-white ">
      {/* main section */}
      <div className="px-2">
        <div className="w-full flex flex-col mx-auto rounded-md">
          <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Profile Section */}
            <div className="bg-teal-100 rounded-lg  p-4 flex flex-col items-center">
              <h2 className="text-teal-700 font-bold text-lg mt-2">
                Profile Setup
              </h2>
              <p className="text-gray-600 text-sm text-center mt-2">
                Create your profile with personal and professional details.
              </p>
              <button className="mt-4 px-4 py-2 bg-[#21897e] text-white rounded-md hover:bg-teal-800">
                Set Up Profile
              </button>
            </div>

            {/* Exam Section */}
            <div className="bg-teal-100 rounded-lg  p-4 flex flex-col items-center">
              <h2 className="text-teal-700 font-bold text-lg mt-2">
                Take Exams
              </h2>
              <p className="text-gray-600 text-sm text-center mt-2">
                Complete the exam series (Level 1, Level 2, Level 3) to qualify.
              </p>
              <button className="mt-4 px-4 py-2 bg-[#21897e] text-white rounded-md hover:bg-teal-800">
                Start Exam
              </button>
            </div>

            <div className="bg-teal-100 rounded-lg  p-4 flex flex-col items-center">
              <h2 className="text-teal-700 font-bold text-lg mt-2">
                Become a Teacher
              </h2>
              <p className="text-gray-600 text-sm text-center mt-2">
                Qualify to teach in schools and coaching centers. Start your
                journey!
              </p>
              <button className="mt-4 px-4 py-2 bg-[#21897e] text-white rounded-md hover:bg-teal-800">
                Get Certified
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 mt-4">
        <JobProfileCard subjects={sub} />
        <PrefrenceLocation locations={location}/>
      </div>

      {/* exam level Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 px-6 mt-4 gap-4 mx-auto">
        <ExamLevelCard level="Level-1" isLocked={false} />
        <ExamLevelCard level="Level-2" isLocked={true} />
        <ExamLevelCard level="Level-3" isLocked={true} />
      </div>
    </div>
  );
}

export default TeacherDashboard;
