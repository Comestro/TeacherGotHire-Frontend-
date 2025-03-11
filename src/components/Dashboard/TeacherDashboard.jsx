import React, { useState, useEffect, useRef } from "react";
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
import { Helmet } from "react-helmet-async";
import { updateBasicProfile } from "../../services/profileServices";
import { toast } from "react-toastify";
import axios from "axios";
import { ToastContainer } from "react-toastify";

function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [passcode, setPasscode] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const { basicData } = useSelector((state) => state.personalProfile);
  const percentage = useSelector(
    (state) => state.personalProfile?.completionData?.profile_completed
  );
  const { userData } = useSelector((state) => state?.auth);
  const { interview, attempts, passkeyresponse, verifyresponse } = useSelector(
    (state) => state.examQues
  );
  const user_id = userData.id;
  const { exam } = useSelector((state) => state.examQues);

  const exams = verifyresponse?.offline_exam;
  const exam_id = passkeyresponse?.exam?.id;
  console.log("examid",exam_id)

  //const exam_id = exam?.id;


  const passedOfflineAttempt = attempts?.filter(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.level_name === "2nd Level Offline"&&
      attempt.exam?.level_id === 3
  );
  const isPassedOfflineAttemptNext = attempts?.some(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.level_name === "2nd Level Offline" &&
      attempt.exam?.level_id === 3 
  );
  console.log("passkeyresponse",passkeyresponse);
  console.log("isPassedOfflineAttemptNext",isPassedOfflineAttemptNext);
  console.log("passedOfflineAttempt",passedOfflineAttempt);

  // Check if the user has passed the Offline Exam
  const passedOfflineExam = !!passedOfflineAttempt;
  useEffect(() => {
    dispatch(getInterview());
    dispatch(getSubjects());
    dispatch(getProfilCompletion()).then(() => {
      // Show modal if phone number is not set
      if (!basicData?.phone_number) {
        setShowPhoneModal(true);
      }
    });
  }, [dispatch, basicData?.phone_number]);

  const handleSubmitPhoneNumber = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      await updateBasicProfile({ phone_number: phoneNumber });
      toast.success("Phone number updated successfully!");
      setShowPhoneModal(false);
      dispatch(getProfilCompletion());
    } catch (err) {
      const errorMessage = err.response?.data?.phone_number 
        ? Array.isArray(err.response.data.phone_number)
          ? err.response.data.phone_number[0]
          : err.response.data.phone_number
        : "An error occurred. Please try again.";
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const PhoneNumberModal = () => {
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
  
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Please Provide your Contact Number
          </h2>
          <form onSubmit={handleSubmitPhoneNumber}>
            <div className="mb-4">
              <label className="block text-teal-600 text-sm font-medium mb-2">
                Phone Number*
              </label>
              <input
                ref={inputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="Enter 10-digit phone number"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  error 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-200 focus:border-teal-600"
                }`}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className={`px-5 py-2 text-white rounded-lg transition-all ${
                  loading || phoneNumber.length !== 10
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 hover:shadow-md"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Teacher Dashboard</title>
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} />
      {showPhoneModal && !basicData?.phone_number && <PhoneNumberModal />}

      <div className="min-h-screen bg-white">
        <div className="md:px-6 py-5">
          <div className="">
            <TeacherDashboardCard />
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
                            Soon your interview will be approved, and you will
                            get your meeting link.
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-green-600">Approved</span>
                          <p className="text-gray-700 text-base">
                            <strong>Subject:</strong>{" "}
                            {item.subject_name || "N/A"}
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
      </div>
    </>
  );
}

export default TeacherDashboard;
