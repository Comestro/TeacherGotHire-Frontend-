import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const HeroSection = () => {
  const [expandedCards, setExpandedCards] = useState({
    student: false,
    institute: false,
    teacher: false
  });
  const INITIAL_STEPS_TO_SHOW = 3;

  const studentSteps = [
    "सबसे पहले www.ptpinstitute.com को सर्च करें!",
    'होम पेज पर जाएं, "शिक्षक खोजें" बटन पर क्लिक करें!',
    "न्यू पेज पर तीन तरह के शिक्षक को हम लोग चुन सकते हैं (।) स्कूल टीचर(।।)कोचिंग टीचर(।।।)पर्सनल(होम) टीचर किसी एक को चुने !",
    "Class Category और Subject को चुने!",
    "जिस जगह पर आपको शिक्षक चाहिए वहां का पिन कोड नंबर डालें( चाहे तो आप Optional area को भी सेलेक्ट कर सकते हैं जो आपके करीब हो) फिर सर्च करें!",
    "अगर मनो-योग्य शिक्षक मिलता है तो आप उसे Order कर सकते हैं",
  ];

  const instituteSteps = [
    "सबसे पहले www.ptpinstitute.com को सर्च करें!",
    'होम पेज पर जाएं, "शिक्षक खोजें" बटन पर क्लिक करें!',
    "School Teacher या Coaching Teacher चयन करें",
    "Class Category और Subject को चुने!",
    "जिस जगह पर स्कूल या कोचिंग है वहां का पिन कोड नंबर डालें( चाहे तो आप Optional area को भी सेलेक्ट कर सकते हैं जो स्कूल या कोचिंग के करीब हो) फिर सर्च करें!",
    "अगर मनो-योग्य शिक्षक मिलता है तो आप उसे Order कर सकते हैं"
  ];

  const teacherSteps = [
    "सबसे पहले www.ptpinstitute.com को सर्च करें!",
    'होम पेज पर जाएं "Register as a Teacher" पर क्लिक करें!',
    'फॉर्म को भरकर "Sign up as a Teacher" करें!',
    "ID बनाने के बाद उसमें ईमेल आईडी और फोन नंबर जोड़े और सारा डिटेल को को भरना है",
    "Level-1( Test from home) का टेस्ट घर से दे!",
    "Level-1 का टेस्ट पास करने के बाद Level-2(Test from home)पास करें!",
    "Level-2(test from home ) पास करने के बाद आप इंटरव्यू के लिए अप्लाई कर सकते हैं या Level-2(Test from Exam centre) के लिए apply कर सकते हैं!",
    "Level-2(test from Exam centre) या इंटरव्यू पास करने के बाद आप पढ़ाने के लिए अप्लाई कर सकते हैं या Level-3(test from home ) test दे सकते हैं!",
    "Level-3(test from home ) का टेस्ट पास करने के बाद Level-3 (test from Exam centre) का टेस्ट दे सकते हैं और उसे भी पास कर सकते हैं!",
    "अब Level-3 का इंटरव्यू दे सकते हैं और पास कर सकते हैं।",
  ];

  const highlightItems = [
    {
      id: "student",
      title: "Students/Parents",
      content:
        "अगर आप एक छात्र/अभिभावक हैं और आपको एक अच्छे शिक्षक (Home Tutor) की आवश्यकता है।",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
      ),
      steps: studentSteps,
      color: "teal"
    },
    {
      id: "institute",
      title: "Educational Institutes",
      content:
        "अगर आपको शिक्षण संस्थान (स्कूल, कोचिंग) के लिए किसी भी विषय के शिक्षकों की आवश्यकता है।",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      steps: instituteSteps,
      color: "indigo"
    },
    {
      id: "teacher",
      title: "Teachers/Tutors",
      content:
        "अगर आप एक शिक्षक हैं और आपको Home Tuition, कोचिंग, स्कूल में पढ़ाना है।",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      steps: teacherSteps,
      color: "purple"
    },
  ];

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <div className="relative w-full bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Images */}
        <div
          className="hidden md:block absolute z-0 inset-0 w-full h-full bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('Home3.png')" }}
        ></div>
        <img
          src="teacher-student.svg"
          alt="Teacher and Student"
          className="md:hidden w-full h-auto max-w-[500px] mx-auto mt-12"
        />

        {/* Content */}
        <div className="relative z-0 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-24 md:pt-40 pb-16 md:pb-24">
            <div className="text-center max-w-4xl mx-auto animate-slide-up">
              {/* Heading */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Private Teacher
                </span>
                <br />
                Provider Institute
              </h1>

              {/* Subtitle */}
              <div className="relative mb-12">
                <p className="text-xl md:text-3xl text-slate-600 font-medium mb-4">
                  पढ़ने, पढ़ाने और पढ़वाने का बेहतरीन मंच
                </p>
                <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
                  <svg
                    className="w-48 md:w-64 text-teal-500"
                    viewBox="0 0 180 12"
                    fill="none"
                  >
                    <path
                      d="M2 2C36.5 10.5 143.5 -3.5 178 2"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Link
                  to="/recruiter"
                  className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-xl shadow-sm hover:bg-teal-700 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 font-bold transform hover:-translate-y-0.5"
                >
                  <IoSearchOutline className="w-5 h-5" />
                  Find Your Perfect Teacher
                </Link>
                <Link
                  to="/teacher"
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all duration-300 font-bold"
                >
                  Join as a Teacher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Steps Section */}
      <div className="relative z-0 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {highlightItems.map((item, index) => (
              <div
                key={item.title}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-none hover:shadow-sm transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`mb-6 p-4 rounded-2xl inline-block ${item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">{item.content}</p>

                {/* Steps Section - Always visible (3 steps) */}
                {item.steps && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="space-y-4">
                      {item.steps
                        .slice(0, expandedCards[item.id] ? item.steps.length : INITIAL_STEPS_TO_SHOW)
                        .map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-0.5">
                              <div className={`w-6 h-6 ${item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                                item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                  'bg-teal-100 text-teal-600'
                                } rounded-full flex items-center justify-center text-xs font-bold`}>
                                {index + 1}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-snug">{step}</p>
                          </div>
                        ))}
                    </div>

                    {/* Show More/Less Button (only if there are more steps) */}
                    {item.steps.length > INITIAL_STEPS_TO_SHOW && (
                      <button
                        onClick={() => toggleCardExpansion(item.id)}
                        className={`mt-4 text-sm font-bold flex items-center transition-colors ${item.color === 'indigo' ? 'text-indigo-600 hover:text-indigo-700' :
                          item.color === 'purple' ? 'text-purple-600 hover:text-purple-700' :
                            'text-teal-600 hover:text-teal-700'
                          }`}
                      >
                        {expandedCards[item.id] ? (
                          <>
                            Show Less
                            <IoIosArrowUp className="ml-1" />
                          </>
                        ) : (
                          <>
                            Show {item.steps.length - INITIAL_STEPS_TO_SHOW} More Steps
                            <IoIosArrowDown className="ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;