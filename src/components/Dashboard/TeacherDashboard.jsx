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

  useEffect(() => {
    dispatch(getInterview());
    dispatch(getSubjects());
    dispatch(getProfilCompletion());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* main section */}
      {/* <div className="px-2">
        <div className="w-full flex flex-col mx-auto rounded-md">
          <div className="px-4 flex gap-4 py-4 w-full">
            
            <div className="w-1/4 rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-4 flex flex-col items-center">
              <div className="">
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
                  {percentage && percentage[0]}% profile completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

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
                    <>
                    <span className="text-yellow-600">Pending</span>
                    <p className="text-gray-600 mt-2">
                     Soon your interview will be approved, and you will get your meeting link.
                    </p>
                  </>
                  ) : (
                    <>
                      <span className="text-green-600">Approved</span>
                      <p className="text-gray-700 text-base">
                        <strong>Subject:</strong> {item.subject_name || "N/A"}
                      </p>
                      <p className="text-gray-700 text-base">
                        <strong>Time:</strong>{" "}
                        {new Date(item.time).toLocaleString()}
                      </p>
                      {item.status !== false && item.link && (
                        <div className="px-6 py-4 bg-gray-100">
                          <p className="text-blue-600 font-semibold">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Join Interview
                            </a>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Additional details can go here */}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default TeacherDashboard;
