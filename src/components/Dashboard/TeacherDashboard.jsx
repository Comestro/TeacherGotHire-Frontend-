import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSubjects } from "../../features/dashboardSlice";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getProfilCompletion } from "../../features/personalProfileSlice";
import { getInterview } from "../../features/examQuesSlice";

function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const percentage = useSelector(
    (state) => state.personalProfile?.completionData?.profile_completed
  );

  const { interview } = useSelector((state) => state.examQues);

  console.log("interview", interview);

  useEffect(() => {
    dispatch(getInterview());
    dispatch(getSubjects());
    dispatch(getProfilCompletion());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* main section */}
      <div className="px-2">
        <div className="w-full flex flex-col mx-auto rounded-md">
          <div className="px-4 flex gap-4 py-4 w-full">
            {/* Welcome */}
            <div className="w-full md:w-9/12 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-blue-300 rounded-lg  flex flex-col gap-5 overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Background circles */}
                <div className="absolute top-20 -left-20 w-56 h-56 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-70"></div>
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-r from-green-200 to-green-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-5 right-16 w-16 h-16 border-4 border-white rounded-full"></div>

                {/* Floating circles */}
                <div className="absolute top-12 left-16 w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-3 center w-6 h-6 border-2 border-orange-400 rounded-full"></div>
                <div className="absolute top-20 right-28 w-6 h-6 bg-white shadow-md rounded-full"></div>

                {/* Dotted and cross patterns */}
                <div className="absolute bottom-10 left-10 grid grid-cols-4 gap-1">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 bg-orange-400 rounded-full"
                    ></div>
                  ))}
                </div>
                <div className="absolute top-24 right-10">
                  <div className="text-orange-400 text-2xl font-bold">+</div>
                </div>

                {/* Text content */}
                <div className="z-10 text-center absolute top-5 left-5 ">
                  <h1 className="text-2xl font-bold text-[#1e6e99] px-4 py-2">
                    We’re thrilled to have you here, Rahul!
                  </h1>
                </div>
                <div className="absolute max-w-80">
                  <p className=" text-sm mt-2 rounded-md font-semibold text-gray-500">
                    With our platform, you can explore teaching opportunities in
                    schools, coaching centers, and even provide personalized
                    home tuition.
                  </p>
                </div>
              </div>
            </div>
            {/* Profile Section */}
            <div className="w-1/4 rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-4 flex flex-col items-center">
              <div className="">
                {/* Progress Bar Section */}
                <div className="flex w-20">
                  <CircularProgressbar
                    value={percentage && percentage[0]}
                    text={`${percentage && percentage[0]}%`}
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
                  {/* {percentage && percentage[0]}% profile completed. */}
                </p>
              </div>
              {/* Button Section */}
              <button className="mt-4 px-6 py-3 bg-[#3E98C7] text-white text-sm font-medium rounded-lg transition-all duration-300">
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
     
      {interview &&
        interview.length > 0 &&
        interview.map((item) => (
          <div className="flex flex-col items-center mt-10">
          <div
            key={item.id}
            className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden mb-4 "
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">
                {item.status === false ? (
                  <span className="text-yellow-600">Pending</span>
                ) : (
                  <span className="text-green-600">Approved</span>
                )}
              </div>
              <p className="text-gray-700 text-base">
                <strong>Subject:</strong> {item.subject_name || "N/A"}
              </p>
              <p className="text-gray-700 text-base">
                <strong>Time:</strong> {new Date(item.time).toLocaleString()}
              </p>
              {/* Additional details can go here */}
            </div>
            {item.status !== false && item.link && (
              <div className="px-6 py-4 bg-gray-100">
                <p className="text-blue-600 font-semibold">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Join Interview
                  </a>
                </p>
              </div>
            )}
          </div>
          </div>
        ))}
    </div>
  );
}

export default TeacherDashboard;
