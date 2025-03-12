import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllQues, setLanguage,resetVerifyResponse } from "../../features/examQuesSlice";

const MCQGuidelinePage = () => {
  const dispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState(""); 
  const {exam,verifyresponse}= useSelector((state) => state.examQues);
  const examID = exam?.id; 
  const verfyExamId = verifyresponse?.offline_exam?.id;
  const [isChecked, setIsChecked] = useState(false);

  console.log("verfied",verifyresponse)
  
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };


 
  console.log("exam",examID)

  // Handle language change
  const handleLanguageChange = (event) => {
    const language = event.target.value;
    setSelectedLanguage(language); // Update selected language in state
    console.log("Selected Language:", language);
  };

  // Handle proceed button click
  const handleProceedClick = () => {
    if (selectedLanguage && Object.entries(verifyresponse).length > 0) {
      dispatch(setLanguage(selectedLanguage)); // Dispatch setLanguage action
      dispatch(getAllQues({ exam_id: verfyExamId, language: selectedLanguage })); // Dispatch getAllQues action
      console.log("Proceeding with:", selectedLanguage, examID);
      dispatch(resetVerifyResponse());
    }else{
      dispatch(setLanguage(selectedLanguage)); // Dispatch setLanguage action
      dispatch(getAllQues({ exam_id: examID, language: selectedLanguage })); // Dispatch getAllQues action
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      {/* Header */}
      <header className="mt-8 md:mt-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">
            Exam Guidelines
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8">
      <div className="bg-white p-6">
        <ul className="list-disc list-outside space-y-2">
          <li>Ensure you have a stable internet connection. / सुनिश्चित करें कि आपका इंटरनेट कनेक्शन स्थिर है।</li>
          <li>Use the latest version of Google Chrome or Mozilla Firefox for the best experience. / सर्वोत्तम अनुभव के लिए Google Chrome या Mozilla Firefox के नवीनतम संस्करण का उपयोग करें।</li>
          <li>Make sure your device is fully charged or connected to a power source. / सुनिश्चित करें कि आपका डिवाइस पूरी तरह चार्ज है या बिजली के स्रोत से जुड़ा हुआ है।</li>
          <li>Read each question carefully before answering. / प्रत्येक प्रश्न का उत्तर देने से पहले ध्यानपूर्वक पढ़ें।</li>
          <li>You cannot go back to previous questions once you move to the next one. / एक बार अगले प्रश्न पर जाने के बाद, आप पिछले प्रश्न पर वापस नहीं जा सकते।</li>
          <li>Manage your time wisely each question has a time limit. / अपने समय का बुद्धिमानी से प्रबंधन करें; प्रत्येक प्रश्न की समय सीमा होती है।</li>
          <li>Do not refresh the page or press the back button on your browser. / पेज को रीफ्रेश न करें और न ही ब्राउज़र का बैक बटन दबाएँ।</li>
          <li>Review your answers if allowed before submitting. / यदि अनुमति हो तो सबमिट करने से पहले अपने उत्तरों की समीक्षा करें।</li>
          <li>Click the "Submit" button to finish the test. / टेस्ट समाप्त करने के लिए "Submit" बटन पर क्लिक करें।</li>
          <li>If you encounter technical issues, contact support immediately. / यदि आपको कोई तकनीकी समस्या आती है, तो तुरंत सहायता से संपर्क करें।</li>
          <li>Ensure no external assistance is used tests are monitored for fairness. / सुनिश्चित करें कि कोई बाहरी सहायता नहीं ली जा रही है; परीक्षाएं निष्पक्षता के लिए निगरानी की जाती हैं।</li>
          <li>Report incorrect questions immediately. / गलत प्रश्नों की तुरंत रिपोर्ट करें।</li>
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
              <option value="Hindi">हिन्दी</option>
              <option value="English">English</option>
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
            <span>I have read and agree to the guidelines / मैंने दिशा-निर्देश पढ़ लिए हैं और सहमत हूँ।</span>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="mt-5 text-center mb-4 md:md-0">
          <Link
            to={selectedLanguage && isChecked ? "/exam/portal" : "#"}
            onClick={handleProceedClick}
            className={`${
              selectedLanguage && isChecked
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white px-4 py-2 rounded`}
          >
            Proceed to Exam / परीक्षा के लिए आगे बढ़ें
          </Link>
        </div>
      </div>
    </main>

      {/* Footer */}
      <footer className="border-t border-gray-300 py-3 mt-5">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">&copy; 2024 Comestro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MCQGuidelinePage;
