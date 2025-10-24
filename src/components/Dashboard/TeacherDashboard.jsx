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
import FilterdExamCard from "./components/FilterdExamCard"
import { Helmet } from "react-helmet-async";
import { updateBasicProfile } from "../../services/profileServices";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import InterviewCard from "./components/InterviewCard";
import { attemptsExam } from "../../features/examQuesSlice";
import PrefrenceProfile from "../Profile/JobProfile/PrefrenceProfile";
import { getPrefrence } from "../../features/jobProfileSlice";

function TeacherDashboard() {
  const dispatch = useDispatch();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const { basicData } = useSelector((state) => state.personalProfile);
  const {  attempts } = useSelector(
      (state) => state.examQues
    );
  const teacherprefrence = useSelector((state) => state.jobProfile?.prefrence);
  
  console.log("attempts",attempts);
  
  useEffect(()=>{
    dispatch(attemptsExam());
    dispatch(getPrefrence());
  },[dispatch]);

  const qualifiedExamNames = attempts
  .filter(item => item?.exam?.level_code === 2 && item.isqualified)
  .map(item => item.exam.name);

  console.log("qualifiedExamNames",qualifiedExamNames);
  
  // Check if user has class categories set up
  const hasClassCategories = teacherprefrence?.class_category?.length > 0;
  
  useEffect(() => {
    dispatch(getSubjects());
    // dispatch(getProfilCompletion()).then(() => {
    //   // Show modal if phone number is not set
    //   if (!basicData?.phone_number) {
    //     setShowPhoneModal(true);
    //   }
    // });
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
       <ToastContainer 
        position="top-right" 
        autoClose={1000} 
        closeButton={true}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {showPhoneModal && !basicData?.phone_number && <PhoneNumberModal />}

      <div className="min-h-screen">
        {/* Show preference form if user doesn't have class categories */}
        {!hasClassCategories ? (
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <PrefrenceProfile forceEdit={true} />
          </div>
        ) : (
          <>
            {/* <div className="md:px-6 md:py-5">
                <TeacherDashboardCard />
            </div> */}
         
            <div className="">
              {/* <ExamManagement /> */}
              <FilterdExamCard/>
            </div>
           {qualifiedExamNames.length>0 && (
            <div className="md:px-6">
            <InterviewCard />
          </div>
           ) 
            }
          </>
        )}
      </div>
    </>
  );
}

export default TeacherDashboard;
