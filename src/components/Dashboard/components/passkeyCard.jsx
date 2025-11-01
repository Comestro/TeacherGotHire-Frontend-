import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  verifyPasscode,
  getAllQues,
  generatePasskey,
  getgeneratedPasskey,
} from "../../../features/examQuesSlice";
import { useGetCentersQuery } from "../../../features/api/apiSlice";
import { checkPasskey } from "../../../services/examServices";

const ExamCenterModal = ({
  isOpen,
  onClose,
  isverifyCard,
  examCenterData,
  selectedLanguage,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [abortController] = useState(new AbortController());

  // State management
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [entered_passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use RTK Query hook to fetch centers
  const {
    data: centers = [],
    isLoading: isLoadingCenters,
    error: centersError,
    refetch: refetchCenters,
  } = useGetCentersQuery(undefined, {
    // Only fetch when modal is open and we're not on verify card
    skip: !isOpen || isverifyCard,
  });

  console.log("centers", centers);

  // Redux state for other data
  const { passkeyresponse, error } = useSelector((state) => state.examQues);
  const { examCards } = useSelector((state) => state.exam);
  console.log("error", error);

  // Debug log for centers data
  useEffect(() => {
    if (centers) {
      console.log("Centers from RTK Query:", centers);
    }
    if (centersError) {
      console.error("RTK Query centers error:", centersError);
      toast.error("Failed to load exam centers. Please try again.");
    }
  }, [centers, centersError]);

  // Manually trigger a refetch if needed
  useEffect(() => {
    if (isOpen && !isverifyCard) {
      refetchCenters();
    }
  }, [isOpen, isverifyCard, refetchCenters]);

  const handleverifyPasskey = async (e) => {
    e.preventDefault();

    if (!entered_passcode) {
      toast.error("Please enter a verification code");
      return;
    }

    try {
      setIsVerifying(true);

      const verificationResult = await dispatch(
        verifyPasscode({
          exam_id: examCards?.id,
          entered_passcode,
        })
      ).unwrap();
      if (verificationResult.error) {
        throw new Error(verificationResult.error);
      }

      toast.success("Verification successful!");
      console.log("selectedLanguage", selectedLanguage);
      await dispatch(
        getAllQues({
          exam_id: examCards?.id,
          language: selectedLanguage,
        })
      ).unwrap();

      onClose();
      navigate("/exam/portal");
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGeneratePasskey = async (event) => {
    event.preventDefault();

    if (!selectedCenterId) {
      toast.warning("Please select an exam center");
      return;
    }

    try {
      setIsGenerating(true);

      const result = await dispatch(
        generatePasskey({
          exam_id: examCards?.id,
          center_id: selectedCenterId,
        })
      ).unwrap();

      toast.success("Passkey generated successfully!");

      // After generating passkey, check status again
      const response = await checkPasskey({ exam: examCards?.id });
      if (response?.passkey === true) {
        onClose();
        // Reopen modal with verification view
        setTimeout(() => {
          setSelectedCenterId("");
          onClose(); // Close and reopen to reset state
          window.location.reload(); // Refresh to get updated state
        }, 1500);
      }
    } catch (error) {
      if (error?.message?.includes("already exists")) {
        toast.info(
          "A passkey already exists. Please enter the verification code."
        );
        window.location.reload();
      } else {
        toast.error("Failed to generate passkey");
      }
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
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Error display - modified to match design */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 mx-4 mt-2 rounded">
            {error}
          </div>
        )}
        {isverifyCard ? (
          <div className="p-6">
            <div className="bg-white rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Offline Exam Verification
              </h2>
              <p className="text-gray-600 mb-4">
                Your exam center is{" "}
                {examCenterData?.name || passkeyresponse?.center_name}. Please
                enter the verification code provided at the center.
              </p>

              <form onSubmit={handleverifyPasskey} className="space-y-4">
                <input
                  type="text"
                  value={entered_passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Verification Code"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isVerifying}
                />
                <button
                  type="submit"
                  disabled={isVerifying || !entered_passcode}
                  className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${
                    isVerifying || !entered_passcode
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Verify and Proceed to Exam"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Select Exam Center
            </h3>
            <form onSubmit={handleGeneratePasskey} className="space-y-4">
              <div className="flex flex-col gap-4">
                {isLoadingCenters ? (
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500 mx-auto mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-gray-600">
                      Loading exam centers...
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedCenterId}
                    onChange={(e) => setSelectedCenterId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={isGenerating}
                  >
                    <option value="">Select Exam Center</option>
                    {Array.isArray(centers) && centers?.length > 0 ? (
                      centers.map((center) => (
                        <option key={center?.id} value={center?.id}>
                          {center?.center_name ||
                            center?.name ||
                            "Unknown Center"}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No centers available
                      </option>
                    )}
                  </select>
                )}

                {centersError && !isLoadingCenters && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
                    Failed to load exam centers. Please try again or contact
                    support.
                  </div>
                )}

                {!isLoadingCenters &&
                  (!centers || centers.length === 0) &&
                  !centersError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
                      No exam centers found. Please try again or contact
                      support.
                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    isGenerating || !selectedCenterId || isLoadingCenters
                  }
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center ${
                    isGenerating || !selectedCenterId || isLoadingCenters
                      ? "opacity-75 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isGenerating ? "Generating Passkey..." : "Generate Passkey"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCenterModal;
