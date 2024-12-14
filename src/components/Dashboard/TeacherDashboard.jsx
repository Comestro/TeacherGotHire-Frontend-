import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
//import ProfileButton from '../Profile_Button/Profile_Button';
import ResultCard from "../Result/Result";
import { getSubjects } from "../../features/dashboardSlice";
import { IoMdSettings, IoIosNotifications, IoMdMenu } from "react-icons/io";
import { GoChevronDown } from "react-icons/go";
import ExamLevelCard from "./ExamLevelCard";
import JobProfileCard from "./JobProfileCard";

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
    <div className="rounded-2xl min-h-screen">
      {/* Teacher Dashboard Header */}
      <div className="flex items-center justify-between px-2 ">
        <div className="ml-2">
          <IoMdMenu className="size-7 text-teal-700" />
        </div>
        <div className="flex items-center gap-7 mr-2">
          <button>
            <IoMdSettings className="size-7 text-teal-700" />
          </button>
          <button>
            <IoIosNotifications className="size-7 text-teal-700" />
          </button>
          <button className=" py-1 font-semibold text-teal-700 flex items-center gap-2">
            <div className="w-10 h-10">
              <img
                src={"https://via.placeholder.com/200"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-teal-600 shadow-md"
              />
            </div>
            Rahul Kumar
            <GoChevronDown className="-ml-1 mt-1 text-teal-600" />
          </button>
        </div>
      </div>
      {/* main section */}
      <div className="w-full flex flex-col mt-2 mx-auto">
        {/* Header Section */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-teal-700">
            Join as a Teacher
          </h1>
          <p className="text-gray-600">
            Follow the steps to become a certified teacher and start teaching
            today!
          </p>
        </div>

        <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Section */}
          <div className="bg-teal-100 rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="bg-teal-700 text-white rounded-full h-20 w-20 flex items-center justify-center text-xl font-semibold">
              1
            </div>
            <h2 className="text-teal-700 font-bold text-lg mt-2">
              Profile Setup
            </h2>
            <p className="text-gray-600 text-sm text-center mt-2">
              Create your profile with personal and professional details.
            </p>
            <button className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800">
              Set Up Profile
            </button>
          </div>

          {/* Exam Section */}
          <div className="bg-teal-100 rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="bg-teal-700 text-white rounded-full h-20 w-20 flex items-center justify-center text-xl font-semibold">
              2
            </div>
            <h2 className="text-teal-700 font-bold text-lg mt-4">Take Exams</h2>
            <p className="text-gray-600 text-sm text-center mt-2">
              Complete the exam series (Level 1, Level 2, Level 3) to qualify.
            </p>
            <button className="mt-2 px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800">
              Start Exam
            </button>
          </div>

          <div className="bg-teal-100 rounded-lg shadow-md p-4 flex flex-col items-center">
            <div className="bg-teal-700 text-white rounded-full h-20 w-20 flex items-center justify-center text-xl font-semibold">
              3
            </div>
            <h2 className="text-teal-700 font-bold text-lg mt-2">
              Become a Teacher
            </h2>
            <p className="text-gray-600 text-sm text-center mt-2">
              Qualify to teach in schools and coaching centers. Start your
              journey!
            </p>
            <button className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800">
              Get Certified
            </button>
          </div>
        </div>
      </div>

      {/* exam level Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 px-4 mt-3 gap-4 mx-auto">
        <ExamLevelCard level="Level-1" isLocked={false} />
        <ExamLevelCard level="Level-2" isLocked={true} />
        <ExamLevelCard level="Level-3" isLocked={true} />
      </div>

      <div className="flex px-4 mt-2">
        <JobProfileCard subjects={sub} locations={location} />
      </div>
    </div>
  );
}

export default TeacherDashboard;
