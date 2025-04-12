import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  verifyPasscode,
  getAllQues,
  generatePasskey,
  getAllCenter,
  getgeneratedPasskey,
} from "../../../features/examQuesSlice";

const ExamCenterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [abortController] = useState(new AbortController());

  // State management
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Redux state
  const { allcenter, passkeyresponse, loading, error } = useSelector(
    (state) => state.examQues
  );
  const { examCards } = useSelector((state) => state.exam);
  const { userData } = useSelector((state) => state.auth);
  const { selectedLanguage } = useSelector((state) => state.exam);
  console.log("passkeyresponse",passkeyresponse)

  // Fetch centers on mount
  useEffect(() => {
    dispatch(getAllCenter({ signal: abortController.signal }));
    dispatch(getgeneratedPasskey());
    return () => abortController.abort();
  }, [dispatch]);

  const handleverifyPasskey = async (e) => {
    e.preventDefault();
    
    if (!passcode) {
      toast.error("Please enter a verification code");
      return;
    }

    try {
      setIsVerifying(true);
      
      // 1. Verify passcode
      const verificationResult = await dispatch(
        verifyPasscode({
          user_id: userData?.id,
          exam_id: examCards?.id,
          passcode,
        }, { signal: abortController.signal })
      ).unwrap();

      if (verificationResult.error) {
        throw new Error(verificationResult.error);
      }

      toast.success("Verification successful! Loading questions...");
      
      // 2. Fetch questions
      await dispatch(
        getAllQues({
          exam_id: examCards?.id,
          language: selectedLanguage,
        }, { signal: abortController.signal })
      ).unwrap();

      // 3. Navigate to exam
      navigate("/exam/portal");
      
    } catch (error) {
      console.error("Verification failed:", error);
      
      if (error.message.includes("network")) {
        toast.error("Network error. Please check your connection.");
      } else if (error.message.includes("Invalid")) {
        toast.error("Invalid passcode. Please try again.");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGeneratePasskey = async (event) => {
    event.preventDefault();

    try {
      setIsGenerating(true);
      
      if (!selectedCenterId) {
        toast.warning("Please select an exam center");
        return;
      }

      const result = await dispatch(
        generatePasskey({
          exam_id: examCards?.id,
          center_id: selectedCenterId,
        }, { signal: abortController.signal })
      ).unwrap();

      toast.success("Passkey generated successfully!");
      setShowVerificationCard(true);
    } catch (error) {
      console.error("Passkey generation failed:", error);
      
      if (error.message.includes("network")) {
        toast.error("Network error during passkey generation");
      } else {
        toast.error("Failed to generate passkey");
      }
      setShowVerificationCard(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 w-full max-w-md">
        {/* Close button */}
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showVerificationCard ? (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Exam Center</h3>
            <form onSubmit={handleGeneratePasskey} className="space-y-4">
              <div className="flex flex-col gap-4">
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  disabled={isGenerating}
                >
                  <option value="">Select Exam Center</option>
                  {allcenter?.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.center_name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isGenerating || !selectedCenterId}
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center ${
                    isGenerating || !selectedCenterId ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Passkey for Offline Exam"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-white rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Offline Exam Verification</h2>
              <p className="text-gray-600 mb-4">
                Your exam center is {passkeyresponse?.center_name}. 
                Please enter the verification code provided at the center.
              </p>
              
              <form onSubmit={handleverifyPasskey} className="space-y-4">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Verification Code"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isVerifying}
                />
                <button
                  type="submit"
                  disabled={isVerifying || !passcode}
                  className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${
                    isVerifying || !passcode ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify and Proceed to Exam"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCenterModal;