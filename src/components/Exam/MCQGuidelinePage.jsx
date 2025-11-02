import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllQues} from "../../features/examQuesSlice";
import ExamCenterModal from "../Dashboard/components/passkeyCard";
import { checkPasskey } from "../../services/examServices";
import { HiOutlineArrowLeft, HiOutlineClipboardDocumentList, HiOutlineExclamationTriangle, HiOutlineGlobeAlt, HiOutlineLanguage } from "react-icons/hi2";
import { HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineCheck, HiOutlineCheckCircle, HiOutlineClock, HiOutlineCog, HiOutlineDesktopComputer, HiOutlineEye, HiOutlineLightningBolt, HiOutlineRefresh, HiOutlineSpeakerphone, HiOutlineSupport, HiOutlineUpload } from "react-icons/hi";
const MCQGuidelinePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const { examCards } = useSelector((state) => state.exam);
  const {loading}= useSelector((state)=>state.examQues);
  const subjectName = examCards?.subject?.name;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isExamCenterModalOpen, setIsExamCenterModalOpen] = useState();
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [card,setCard]=useState(false);
  const [examCenterData, setExamCenterData] = useState(null);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    if (subjectName === "English") {
      setSelectedLanguage("English");
    } else if (subjectName === "Hindi") {
      setSelectedLanguage("Hindi");
    }
  }, [subjectName]);

  // Handle language change
  const handleLanguageChange = (event) => {
    const language = event.target.value;
    setSelectedLanguage(language); // Update selected language in state
    
  };

  const handleProceedClick = async (e) => {
    e.preventDefault();

    if (!selectedLanguage || !isChecked) return;
    try {
      setIsLoading(true);
      setError(null);

      if (examCards?.type === "offline") {
        const examid = examCards?.id;
        // Check passkey status
        const response = await checkPasskey({ exam: examid });
        

        if (response?.passkey === true) {
          // If passkey exists, show verification with center info
          setExamCenterData(response.center);
          setShowVerificationCard(true);
        } else {
          // If no passkey, show center selection
          setShowVerificationCard(false);
        }
        setIsExamCenterModalOpen(true);
        setCard(true);
      } else {
        // Handle online exam flow
        await dispatch(
          getAllQues({
            exam_id: examCards?.id,
            language: selectedLanguage,
          })
        );
        navigate("/exam/portal", {
          state: { language: selectedLanguage }
        });
      }
    } catch (err) {
      setError(err.message || "Failed to proceed");
      toast.error("Error checking exam status");
    } finally {
      setIsLoading(false);
    }
  };

  // Modified ExamCente
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="= mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/teacher"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <HiOutlineArrowLeft className="h-5 w-5" />
              <span className="font-semibold text-sm sm:text-base">Back</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-text">
                Exam Guidelines
              </h1>
            </div>
          </div>
        </div>
      </header>

    
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-8xl">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Guidelines Card - English */}
          <div className="flex flex-1 flex-col gap-4 w-full md:w-3/4">
            <div className="bg-white flex-1 rounded-lg p-5  sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4 ">
              <HiOutlineClipboardDocumentList className="h-6 w-6 text-accent" />
              <h2 className="text-lg sm:text-xl font-bold text-text">
                Important Instructions
              </h2>
            </div>
            
            <ul className="space-y-1 text-sm sm:text-base text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Ensure stable internet connection and use latest Chrome/Firefox browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Keep your device fully charged or plugged in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Read each question carefully before answering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span><strong>Cannot go back</strong> to previous questions once you proceed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Manage your time - each question has a time limit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error mt-0.5">•</span>
                <span><strong>Do not refresh</strong> the page or use browser back button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Review answers before submitting (if allowed)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Contact support immediately if you encounter technical issues</span>
              </li>
            </ul>
            <br />
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineClipboardDocumentList className="h-6 w-6 text-accent" />
              <h2 className="text-lg sm:text-xl font-bold text-text">
                महत्वपूर्ण निर्देश
              </h2>
            </div>
            
            <ul className="space-y-1 text-sm sm:text-base text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>सुनिश्चित करें कि आपका इंटरनेट कनेक्शन स्थिर है और नवीनतम Chrome/Firefox ब्राउज़र का उपयोग करें</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>अपने डिवाइस को पूरी तरह चार्ज रखें या प्लग इन करें</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>उत्तर देने से पहले प्रत्येक प्रश्न को ध्यानपूर्वक पढ़ें</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span><strong>वापस नहीं जा सकते</strong> - एक बार आगे बढ़ने के बाद पिछले प्रश्न पर</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>अपने समय का प्रबंधन करें - प्रत्येक प्रश्न की समय सीमा है</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error mt-0.5">•</span>
                <span><strong>रीफ्रेश न करें</strong> पेज को और न ही ब्राउज़र बैक बटन का उपयोग करें</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>सबमिट करने से पहले उत्तरों की समीक्षा करें (यदि अनुमति हो)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>तकनीकी समस्या आने पर तुरंत सहायता से संपर्क करें</span>
              </li>
            </ul>
          </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white w-full md:w-1/4 rounded-lg p-5 sm:p-6 border border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-text mb-4">Select Language</h3>

            <div className="space-y-4">
              <select
                id="language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
              >
                <option value="" disabled>
                  Choose language...
                </option>
                <option value="Hindi" disabled={subjectName === "English"}>
                  Hindi
                </option>
                <option value="English" disabled={subjectName === "Hindi"}>
                  English
                </option>
              </select>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  required
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <span className="text-sm text-secondary">
                  I have read and agree to all the guidelines
                </span>
              </label>

              <button
                onClick={handleProceedClick}
                disabled={loading || !selectedLanguage || !isChecked}
                className={`w-full ${
                  selectedLanguage && isChecked
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-gray-300 cursor-not-allowed"
                } text-white px-6 py-3 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Start Exam</span>
                    <HiOutlineArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {
            card && <ExamCenterModal
            selectedLanguage = {selectedLanguage}
            isOpen={isExamCenterModalOpen}
            onClose={() => {
              setIsExamCenterModalOpen(false);
              setShowVerificationCard(false);
              setCard(false);
            }}
            isverifyCard={showVerificationCard}
            examCenterData={examCenterData}
          />
          }
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-10">
        <div className="container mx-auto text-center px-4">
          <p className="text-xs text-secondary">
            &copy; 2024 PTP Institute. Need help? Contact support
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MCQGuidelinePage;
