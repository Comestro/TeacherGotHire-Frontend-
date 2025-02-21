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
import { Helmet } from "react-helmet-async";
import { updateBasicProfile } from "../../services/profileServices";
import { toast } from "react-toastify";

function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [passcode, setPasscode] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // const exam_id = exam?.id;


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
    dispatch(getProfilCompletion()).then(() => {
      // Show modal if phone number is not set
      if (!basicData?.phone_number) {
        setShowPhoneModal(true);
      }
    });
  }, [dispatch, basicData?.phone_number]);

  const handleSubmitPhoneNumber = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await updateBasicProfile({ phone_number: phoneNumber });
      if (response.status === 200) {
        toast.success("Phone number saved successfully");
        setShowPhoneModal(false);
        dispatch(getProfilCompletion());
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save phone number");
      toast.error("Failed to save phone number");
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
    const inputRef = React.useRef(null);
  
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
              <label className="block text-[#67B3DA] text-sm font-medium mb-2">
                Phone Number*
              </label>
              <input
                ref={inputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="Enter 10-digit phone number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                  error ? "border-red-500" : "focus:border-[#67B3DA]"
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2 text-white rounded-md transition-colors ${
                  loading ? "bg-[#67B3DA]" : "bg-gradient-to-r from-[#3E98C7] to-[#67B3DA]"
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
              <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Offline Exam Verification
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your exam center is{" "}
                    <strong>{passkeyresponse.center_name}</strong>. You will
                    receive your passkey at the center. Please enter the
                    verification code provided to proceed with the exam.
                  </p>
                  <form onSubmit={handleverifyPasskey} className="space-y-4">
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter Verification Code"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Verify and Proceed to Exam
                    </button>
                  </form>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default TeacherDashboard;
