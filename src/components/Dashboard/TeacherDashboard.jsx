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
    <div className="rounded-2xl min-h-screen">
      {/* Teacher Dashboard Header */}
      <div className="flex items-center justify-between px-2 ">
        <div className="ml-2">
          <IoMdMenu className="size-7 text-gray-600" />
        </div>
        <div className="flex items-center gap-7 mr-2">
          <button>
            <IoMdSettings className="size-7 text-gray-600" />
          </button>
          <button>
            <IoIosNotifications className="size-7 text-gray-600" />
          </button>
          <button className=" py-1 font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-10 h-10">
              <img
                src={"https://via.placeholder.com/200"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-md"
              />
            </div>
            Rahul Kumar
            <GoChevronDown className="-ml-1 mt-1" />
          </button>
        </div>
      </div>
      {/* main section */}
      <div className="w-full flex flex-col  mt-2 mx-auto">
        <div className="px-2">
          <img src="/ptpi1.png" alt="" className="rounded-lg" />
          {/* <div className="bg-teal-700 w-full h-48 max-h-60 rounded-md flex items-center justify-around text-white">
            <div className=" bg-white  rounded-full text-teal-600 h-32 w-32 flex items-center justify-center mx-auto font-semibold capitalize cursor-pointer">
              profile section
            </div>
            <div className=" bg-white  rounded-full text-teal-600 h-32 w-32 flex items-center justify-center mx-auto font-semibold capitalize cursor-pointer">
              Exam section
            </div>
            <div className="bg-white  rounded-full  text-teal-600 h-32 w-32 flex items-center justify-center mx-auto font-semibold capitalize cursor-pointer">
              Become Teacher
            </div>
          </div> */}
        </div>
      </div>

      {/* exam level Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 px-2 mt-3 gap-4">
        <ExamLevelCard level="Level-1" isLocked={false}/>
        <ExamLevelCard level="Level-2" isLocked={true} />
        <ExamLevelCard level="Level-3" isLocked={true}/>
      </div>

    </div>
  );
}

export default TeacherDashboard;
