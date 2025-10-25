import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllQues} from "../../features/examQuesSlice";
import ExamCenterModal from "../Dashboard/components/passkeyCard";
import { checkPasskey } from "../../services/examServices";
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
    console.log("Selected Language:", language);
  };

  const handleProceedClick = async (e) => {
    e.preventDefault();

    if (!selectedLanguage || !isChecked) return;
  console.log("selected",selectedLanguage)
    try {
      setIsLoading(true);
      setError(null);

      if (examCards?.type === "offline") {
        const examid = examCards?.id;
        // Check passkey status
        const response = await checkPasskey({ exam: examid });
        console.log("Passkey check response:", response);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/teacher"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-all duration-200 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-semibold text-sm sm:text-base">Back / वापस</span>
            </Link>
            
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📋 Exam Guidelines
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">परीक्षा दिशानिर्देश</p>
            </div>
            
            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Guidelines Card */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-6 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gradient-to-r from-indigo-200 to-purple-200">
              <span className="text-3xl sm:text-4xl">📝</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Important Instructions / महत्वपूर्ण निर्देश
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Please read carefully before starting / शुरू करने से पहले ध्यान से पढ़ें
                </p>
              </div>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">🌐</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Ensure you have a stable internet connection.</strong> / सुनिश्चित करें कि आपका इंटरनेट कनेक्शन स्थिर है।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">🌍</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Use the latest version of Google Chrome or Mozilla Firefox</strong> for the best experience. / सर्वोत्तम अनुभव के लिए Google Chrome या Mozilla Firefox के नवीनतम संस्करण का उपयोग करें।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">🔋</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Make sure your device is fully charged</strong> or connected to a power source. / सुनिश्चित करें कि आपका डिवाइस पूरी तरह चार्ज है या बिजली के स्रोत से जुड़ा हुआ है।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">📖</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Read each question carefully</strong> before answering. / प्रत्येक प्रश्न का उत्तर देने से पहले ध्यानपूर्वक पढ़ें।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>You cannot go back to previous questions</strong> once you move to the next one. / एक बार अगले प्रश्न पर जाने के बाद, आप पिछले प्रश्न पर वापस नहीं जा सकते।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">⏰</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Manage your time wisely</strong> - each question has a time limit. / अपने समय का बुद्धिमानी से प्रबंधन करें; प्रत्येक प्रश्न की समय सीमा होती है।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-600 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">🚫</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Do not refresh the page</strong> or press the back button on your browser. / पेज को रीफ्रेश न करें और न ही ब्राउज़र का बैक बटन दबाएँ।
                </span>
                </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-l-4 border-teal-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">✅</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Review your answers</strong> if allowed before submitting. / यदि अनुमति हो तो सबमिट करने से पहले अपने उत्तरों की समीक्षा करें।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-l-4 border-green-600 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">📤</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Click the "Submit" button</strong> to finish the test. / टेस्ट समाप्त करने के लिए "Submit" बटन पर क्लिक करें।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">🆘</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>If you encounter technical issues</strong>, contact support immediately. / यदि आपको कोई तकनीकी समस्या आती है, तो तुरंत सहायता से संपर्क करें।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-l-4 border-purple-600 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">👁️</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Ensure no external assistance</strong> is used - tests are monitored for fairness. / सुनिश्चित करें कि कोई बाहरी सहायता नहीं ली जा रही है; परीक्षाएं निष्पक्षता के लिए निगरानी की जाती हैं।
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-all">
                <span className="text-xl flex-shrink-0">📢</span>
                <span className="text-sm sm:text-base text-gray-700">
                  <strong>Report incorrect questions</strong> immediately. / गलत प्रश्नों की तुरंत रिपोर्ट करें।
                </span>
              </li>
            </ul>
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-6 border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⚙️</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Exam Configuration / परीक्षा कॉन्फ़िगरेशन
              </h2>
            </div>

            {/* Language Selector */}
            <div className="mb-6">
              <label htmlFor="language" className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-800 mb-3">
                <span className="text-2xl">🌐</span>
                Choose Language / भाषा चुनें:
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full p-3 sm:p-4 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 font-medium transition-all hover:shadow-md"
              >
                <option value="" disabled>
                  Select Language / भाषा चुनें
                </option>
                <option value="Hindi" disabled={subjectName === "English"}>
                  🇮🇳 हिन्दी (Hindi)
                </option>
                <option value="English" disabled={subjectName === "Hindi"}>
                  🇬🇧 English (अंग्रेज़ी)
                </option>
              </select>
            </div>

            {/* Checkbox for Agreement */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-5 rounded-xl border-2 border-teal-300">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 sm:h-6 sm:w-6 text-teal-600 border-2 border-gray-400 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer transition-all"
                  required
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <span className="text-sm sm:text-base text-gray-800 font-medium group-hover:text-teal-700 transition-colors">
                  ✓ I have read and agree to all the guidelines / मैंने सभी दिशा-निर्देश पढ़ लिए हैं और उनसे सहमत हूँ।
                </span>
              </label>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center">
            <button
              onClick={handleProceedClick}
              disabled={loading || !selectedLanguage || !isChecked}
              className={`${
                selectedLanguage && isChecked
                  ? "bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-lg hover:shadow-2xl transform hover:scale-105"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              } text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center gap-3 disabled:transform-none disabled:shadow-none`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Proceeding... / आगे बढ़ रहे हैं...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span>
                  <span>Proceed to Exam / परीक्षा शुरू करें</span>
                  <span className="text-2xl">→</span>
                </>
              )}
            </button>
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
      <footer className="bg-white border-t-2 border-gray-200 py-4 sm:py-6 mt-8">
        <div className="container mx-auto text-center px-4">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            &copy; 2024 Comestro. All rights reserved. / सर्वाधिकार सुरक्षित।
          </p>
          <p className="text-xs text-gray-500 mt-2">
            📧 Need help? Contact support / सहायता चाहिए? समर्थन से संपर्क करें
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MCQGuidelinePage;
