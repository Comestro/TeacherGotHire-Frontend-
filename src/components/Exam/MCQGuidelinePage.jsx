import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllQues, setLanguage } from "../../features/examQuesSlice";
import ExamCenterModal from "../Dashboard/components/passkeyCard";
import { checkPasskey } from "../../services/examServices";

const MCQGuidelinePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("");
  // const {exam,verifyresponse}= useSelector((state) => state.examQues);
  // const examID = exam?.id;
  // const verfyExamId = verifyresponse?.offline_exam?.id;
  const [isChecked, setIsChecked] = useState(false);
  // console.log("exam",exam)
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
    dispatch(setLanguage(selectedLanguage));
    console.log("Selected Language:", language);
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
        navigate("/exam/portal");
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
    <div className="min-h-screen text-gray-800">
      {/* Header */}
      <header className="mt-8 md:mt-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Exam Guidelines</h1>
        </div>
        <Link
          to="/teacher"
          className="flex items-center justify-end px-5 py-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200"
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
          <span className="font-medium">Back to Teacher Dashboard</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8">
        <div className="bg-white p-6">
          <ul className="list-disc list-outside space-y-2">
            <li>
              Ensure you have a stable internet connection. / सुनिश्चित करें कि
              आपका इंटरनेट कनेक्शन स्थिर है।
            </li>
            <li>
              Use the latest version of Google Chrome or Mozilla Firefox for the
              best experience. / सर्वोत्तम अनुभव के लिए Google Chrome या Mozilla
              Firefox के नवीनतम संस्करण का उपयोग करें।
            </li>
            <li>
              Make sure your device is fully charged or connected to a power
              source. / सुनिश्चित करें कि आपका डिवाइस पूरी तरह चार्ज है या बिजली
              के स्रोत से जुड़ा हुआ है।
            </li>
            <li>
              Read each question carefully before answering. / प्रत्येक प्रश्न
              का उत्तर देने से पहले ध्यानपूर्वक पढ़ें।
            </li>
            <li>
              You cannot go back to previous questions once you move to the next
              one. / एक बार अगले प्रश्न पर जाने के बाद, आप पिछले प्रश्न पर वापस
              नहीं जा सकते।
            </li>
            <li>
              Manage your time wisely each question has a time limit. / अपने समय
              का बुद्धिमानी से प्रबंधन करें; प्रत्येक प्रश्न की समय सीमा होती
              है।
            </li>
            <li>
              Do not refresh the page or press the back button on your browser.
              / पेज को रीफ्रेश न करें और न ही ब्राउज़र का बैक बटन दबाएँ।
            </li>
            <li>
              Review your answers if allowed before submitting. / यदि अनुमति हो
              तो सबमिट करने से पहले अपने उत्तरों की समीक्षा करें।
            </li>
            <li>
              Click the "Submit" button to finish the test. / टेस्ट समाप्त करने
              के लिए "Submit" बटन पर क्लिक करें।
            </li>
            <li>
              If you encounter technical issues, contact support immediately. /
              यदि आपको कोई तकनीकी समस्या आती है, तो तुरंत सहायता से संपर्क करें।
            </li>
            <li>
              Ensure no external assistance is used tests are monitored for
              fairness. / सुनिश्चित करें कि कोई बाहरी सहायता नहीं ली जा रही है;
              परीक्षाएं निष्पक्षता के लिए निगरानी की जाती हैं।
            </li>
            <li>
              Report incorrect questions immediately. / गलत प्रश्नों की तुरंत
              रिपोर्ट करें।
            </li>
          </ul>

          <div className="mt-6">
            {/* Language Selector */}
            <div className="flex flex-col items-start space-y-2">
              <label htmlFor="language" className="text-blue-700 font-medium">
                Choose the language / भाषा चुनें:
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select Language / भाषा चुनें
                </option>
                <option value="Hindi" disabled={subjectName === "English"}>
                  हिन्दी
                </option>
                <option value="English" disabled={subjectName === "Hindi"}>
                  English
                </option>
              </select>
            </div>

            {/* Checkbox for Agreement */}
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-teal-600"
                required
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <span>
                I have read and agree to the guidelines / मैंने दिशा-निर्देश पढ़
                लिए हैं और सहमत हूँ।
              </span>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="mt-5 text-center mb-4 md:md-0">
            {/* <Link
            to={selectedLanguage && isChecked && !isLoading ? "/exam/portal" : "#"}
            onClick={handleProceedClick}
            className={`${
              selectedLanguage && isChecked
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded`}
          >
            Proceed to Exam / परीक्षा के लिए आगे बढ़ें
          </Link> */}
          </div>
          <button
            onClick={handleProceedClick}
            disabled={loading}
            className={`${
              selectedLanguage && isChecked
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded`}
          >
            {loading ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Proceeding.....
    </>
  ) : (
    "Proceed to Exam / परीक्षा के लिए आगे बढ़ें"
  )}

          </button>
          {
            card && <ExamCenterModal
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
      <footer className="border-t border-gray-300 py-3 mt-5">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">
            &copy; 2024 Comestro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MCQGuidelinePage;
