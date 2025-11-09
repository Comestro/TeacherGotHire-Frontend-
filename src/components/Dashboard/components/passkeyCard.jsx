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
  const [showPasscodeStep, setShowPasscodeStep] = useState(false);
  const [examLanguage, setExamLanguage] = useState("");
  const [showLanguageStep, setShowLanguageStep] = useState(false);
  const [pincodeFilter, setPincodeFilter] = useState("");

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

  

  // Redux state for other data
  const { passkeyresponse, error } = useSelector((state) => state.examQues);
  const { examCards } = useSelector((state) => state.exam);
  
  // Filter centers by pincode
  const filteredCenters = React.useMemo(() => {
    if (!pincodeFilter || !Array.isArray(centers)) return centers;
    return centers.filter((center) => 
      center?.pincode?.includes(pincodeFilter)
    );
  }, [centers, pincodeFilter]);

  // Debug log for centers data
  useEffect(() => {
    if (centers) {
      
    }
    if (centersError) {
      
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
      
      // Show language selection step
      setShowLanguageStep(true);
      
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

      toast.success("Passkey generated successfully! Please enter the verification code.");
      
      // Move to passcode verification step
      setShowPasscodeStep(true);
      
    } catch (error) {
      if (error?.message?.includes("already exists")) {
        toast.info(
          "A passkey already exists. Please enter the verification code."
        );
        setShowPasscodeStep(true);
      } else {
        toast.error("Failed to generate passkey");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExam = async (e) => {
    e.preventDefault();

    if (!examLanguage) {
      toast.warning("Please select a language");
      return;
    }

    try {
      setIsVerifying(true);
      
      await dispatch(
        getAllQues({
          exam_id: examCards?.id,
          language: examLanguage,
        })
      ).unwrap();

      onClose();
      navigate("/exam/portal", {
        state: { language: examLanguage }
      });
    } catch (error) {
      toast.error("Failed to load exam questions. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl relative shadow-2xl overflow-hidden w-full max-w-xl transform transition-all animate-scaleIn">
        
        {/* Close button - improved positioning and styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-gray-100 hover:bg-red-50 transition-all duration-200 group shadow-sm hover:shadow-md"
          aria-label="Close modal"
        >
          <svg
            className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 mb-2 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-slideDown">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {/* Step 3: Language Selection */}
        {showLanguageStep ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Select Exam Language
              </h2>
              <p className="text-gray-600 text-sm">
                Choose your preferred language for the exam
              </p>
            </div>

            <form onSubmit={handleStartExam} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={examLanguage}
                  onChange={(e) => setExamLanguage(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-gray-700 bg-gray-50 hover:bg-white"
                  required
                >
                  <option value="">Choose language...</option>
                  <option value="Hindi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="English">🇬🇧 English</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={isVerifying || !examLanguage}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  isVerifying || !examLanguage
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading Exam...</span>
                  </>
                ) : (
                  <>
                    <span>Start Exam</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : showPasscodeStep || isverifyCard ? (
          /* Step 2: Passcode Verification */
          (<div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Enter Verification Code
              </h2>
              <p className="text-gray-600 text-sm">
                Please enter the passkey provided by the exam center
              </p>
            </div>
            <form onSubmit={handleverifyPasskey} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entered_passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter your verification code"
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-gray-700 text-center text-lg font-mono tracking-wider bg-gray-50 hover:bg-white"
                  disabled={isVerifying}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Contact the exam center if you haven't received your code
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isVerifying || !entered_passcode}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  isVerifying || !entered_passcode
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </form>
          </div>)
        ) : (
          /* Step 1: Center Selection */
          (<div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Select Exam Center
              </h3>
              <p className="text-gray-600 text-sm">
                Choose the exam center where you'll take your assessment
              </p>
            </div>
            <form onSubmit={handleGeneratePasskey} className="space-y-5">
              {/* Pincode Filter Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter by Pincode
                  <span className="ml-1.5 text-xs text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pincodeFilter}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincodeFilter(value);
                      setSelectedCenterId("");
                    }}
                    placeholder="e.g., 854301"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-gray-700 bg-gray-50 hover:bg-white"
                    disabled={isLoadingCenters}
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {pincodeFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setPincodeFilter("");
                        setSelectedCenterId("");
                      }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {pincodeFilter && (
                  <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Showing centers in pincode: <span className="font-semibold ml-1">{pincodeFilter}</span>
                  </div>
                )}
              </div>

              {/* Center Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Center <span className="text-red-500">*</span>
                </label>
                {isLoadingCenters ? (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl text-center border-2 border-gray-200">
                    <svg
                      className="animate-spin h-8 w-8 text-primary mx-auto mb-3"
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
                    <span className="text-gray-600 font-medium">Loading exam centers...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedCenterId}
                      onChange={(e) => setSelectedCenterId(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-gray-700 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                      disabled={isGenerating}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">
                        {pincodeFilter 
                          ? `📍 ${filteredCenters?.length || 0} centers found in ${pincodeFilter}` 
                          : "Select an exam center"}
                      </option>
                      {Array.isArray(filteredCenters) && filteredCenters?.length > 0 ? (
                        filteredCenters.map((center) => (
                          <option key={center?.id} value={center?.id}>
                            📍 {center?.center_name || center?.name || "Unknown Center"} • {center?.city}, {center?.state} ({center?.pincode})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {pincodeFilter 
                            ? `No centers found for pincode ${pincodeFilter}` 
                            : "No centers available"}
                        </option>
                      )}
                    </select>
                    
                    {pincodeFilter && filteredCenters?.length === 0 && !isLoadingCenters && (
                      <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-800">No centers found</p>
                            <p className="text-xs text-blue-700 mt-1">
                              No centers available for pincode "<span className="font-semibold">{pincodeFilter}</span>". Try a different pincode or clear the filter.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Error Messages */}
              {centersError && !isLoadingCenters && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Failed to load centers</p>
                      <p className="text-xs text-red-700 mt-1">Please try again or contact support for assistance</p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoadingCenters && (!centers || centers.length === 0) && !centersError && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">No exam centers available</p>
                      <p className="text-xs text-yellow-700 mt-1">Please contact support for assistance</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || !selectedCenterId || isLoadingCenters}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                  isGenerating || !selectedCenterId || isLoadingCenters
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Requesting Passkey...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Submit & Get Passkey</span>
                  </>
                )}
              </button>
            </form>
          </div>)
        )}
      </div>
    </div>
  );
};

export default ExamCenterModal;
