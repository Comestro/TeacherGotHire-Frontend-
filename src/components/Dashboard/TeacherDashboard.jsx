import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSubjects } from "../../features/dashboardSlice";
import ExamLevelCard from "./ExamLevelCard";
import JobProfileCard from "./JobProfileCard";
import PrefrenceLocation from "./PrefrenceLocation";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import HorizontalLinearAlternativeLabelStepper from "./components/Stepper";
import SubjectAndLevelSelector from "./components/SubjectAndLevelSelector";

function TeacherDashboard() {
  const subjects = useSelector((state) => state.dashboard.subjects.data || []);
  // console.log("sub", subjects);
  // console.log("subject", subjects);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const percentage = 60;

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
    <div className="min-h-screen bg-white ">
      {/* main section */}
      <div className="px-2">
        <div className="w-full flex flex-col mx-auto rounded-md">
          <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Profile Section */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-4 flex flex-col items-center">
              <div className="">
                {/* Progress Bar Section */}
                <div className="flex w-20">
                  <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    styles={{
                      path: { stroke: "#3E98C7" },
                      trail: { stroke: "#D6EAF8" },
                      text: {
                        fill: "#3E98C7",
                        fontSize: "20px",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </div>
              </div>
              <div className="mt-1">
                <p className="text-gray-500 font-semibold">
                  {percentage}% profile completed.
                </p>
              </div>
              {/* Button Section */}
              <button className="mt-4 px-6 py-3 bg-[#3E98C7] text-white text-sm font-medium rounded-lg transition-all duration-300">
                Complete Profile
              </button>
            </div>

            {/* Exam Section */}
            <div className="col-span-2 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-blue-300 rounded-lg  p-4 flex flex-col gap-5">
              <div className="">
                <p className="text-xl font-semibold text-[#3E98C7] text-center">Compelete your exam in 3 levels</p>
              </div>
              <div className=" w-full mt-2">
              <HorizontalLinearAlternativeLabelStepper />
              </div>
            </div>
          </div>
          <div className="examSubjectAndLevels px-4">
            <SubjectAndLevelSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
