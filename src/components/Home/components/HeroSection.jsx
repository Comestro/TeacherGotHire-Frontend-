import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const highlightItems = [
    {
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
    },
    {
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
    },
    {
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
    },
  ];

  return (
    <div className="relative w-full bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Images */}
        <div
          className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('Home3.png')" }}
        ></div>
        <img
          src="teacher-student.svg"
          alt="Teacher and Student"
          className="md:hidden w-full h-auto max-w-[500px] mx-auto mt-12"
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-24 md:pt-40 pb-16 md:pb-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Heading */}
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6">
                <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Private Teacher
                </span>
                <br />
                Provider Institute
              </h1>

              {/* Subtitle */}
              <div className="relative mb-12">
                <p className="text-xl md:text-3xl text-gray-600 font-medium mb-4">
                  पढ़ने, पढ़ाने और पढ़वाने का बेहतरीन मंच
                </p>
                <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
                  <svg
                    className="w-48 md:w-64 text-teal-600"
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
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-full hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
                >
                  <IoSearchOutline className="w-5 h-5" />
                  Find Your Perfect Teacher
                </Link>
                <Link
                  to="/teacher"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition-colors duration-300 font-semibold"
                >
                  Join as a Teacher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Steps Section */}
      <div className="relative z-10 bg-gradient-to-b from-teal-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {highlightItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4 text-teal-600">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;