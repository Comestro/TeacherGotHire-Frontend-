import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getSubjects } from "../../features/dashboardSlice";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getProfilCompletion } from "../../features/personalProfileSlice";
import {
  getInterview,
  setExam,
  verifyPasscode,
} from "../../features/examQuesSlice";
import TeacherDashboardCard from "./components/TeacherDashboardCard";
import ExamManagement from "./components/ExamManagement";

function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [passcode, setPasscode] = useState("");

  const percentage = useSelector(
    (state) => state.personalProfile?.completionData?.profile_completed
  );
  const { userData } = useSelector((state) => state?.auth);
  const { interview, attempts, passkeyresponse, verifyresponse } = useSelector(
    (state) => state.examQues
  );
  const user_id = userData.id;
  console.log("attempts", attempts);
  const { exam } = useSelector((state) => state.examQues);

  const exams = verifyresponse?.offline_exam;
  console.log("exams", exams);

  const exam_id = passkeyresponse?.exam?.id;

  // const exam_id = exam?.id;

  console.log("passkeyresponse", passkeyresponse);
  console.log("verfyresponse", verifyresponse);

  console.log("exam_id", exam_id);
  console.log("exam", exam);
  // console.log("exams",exams)

  const passedOfflineAttempt = attempts?.find(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.type === "offline" &&
      attempt.exam?.level?.id === 2
  );

  const isPassedOfflineAttemptNext = attempts?.some(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.type === "offline" &&
      attempt.exam?.level?.id === 2 &&
      attempt.exam?.id === exam_id
  );

  console.log(isPassedOfflineAttemptNext);

  // Check if the user has passed the Offline Exam
  const passedOfflineExam = !!passedOfflineAttempt;

  useEffect(() => {
    dispatch(getInterview());
    dispatch(getSubjects());
    dispatch(getProfilCompletion());
  }, []);

  const teacherData = {
    profilePicture: "https://via.placeholder.com/150",
    completionPercentage: 75,
    missingDetails: [
      "Add address info",
      "Add mobile number",
      "Add education details",
    ],
  };

  const handleverifyPasskey = (event) => {
    event.preventDefault();

    dispatch(verifyPasscode({ user_id, exam_id, passcode })).then(() => {
      // Show the alert immediately after successful verification
      alert("You are verified successfully!");

      // Delay the timer-related action by 1 second
      setTimeout(() => {
        const exams = verifyresponse.offline_exam;
        console.log("exams", exams);
        dispatch(setExam(exams));
        navigate("/exam"); // Navigate to the exam page after dispatching the action
      }, 2000);
    });
  };

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

      <div className="md:px-6 py-5">
        <div className="">
          <TeacherDashboardCard teacher={teacherData} />
        </div>
      </div>

      <div className="md:px-6">
        <ExamManagement />
      </div>

      <div className="flex flex-col items-center mt-10">
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
                          Soon your interview will be approved, and you will get
                          your meeting link.
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
        {passedOfflineAttempt && (
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 text-center mb-4">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Congratulations!
            </h2>
            <p className="text-gray-700 mb-6">
              Now you are eligible to be a{" "}
              <strong>
                {passedOfflineAttempt.exam?.subject?.subject_name} Teacher.
              </strong>
            </p>
            {/* Display the exam result */}
            <div className="text-gray-700">
              <p>
                <strong>Exam Name:</strong> {passedOfflineAttempt.exam.name}
              </p>
              <p>
                <strong>Score:</strong> {passedOfflineAttempt.correct_answer}
              </p>
              <p>
                <strong>Total Marks:</strong>{" "}
                {passedOfflineAttempt.correct_answer +
                  passedOfflineAttempt.is_unanswered}
              </p>
              {/* Add any other exam result data you want to display */}
            </div>
          </div>
        )}
        {passkeyresponse &&
          Object.entries(passkeyresponse).length > 0 &&
          !isPassedOfflineAttemptNext && (
            <div>
              <p>
                {} is your center for offline Exam And you will get your Pass
                key at center
              </p>

              <form onSubmit={handleverifyPasskey} className="space-y-4">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Verification Code"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Submit
                </button>
              </form>
            </div>
          )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
