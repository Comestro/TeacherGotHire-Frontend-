import React from "react";
import Navbar from "../Navbar/Navbar";
import Button from "../Button";
import { IoSearchOutline } from "react-icons/io5";
import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import TeacherProfiles from "../HomePage/Review/TeacherProfile";
import TeacherSection from "../HomePage/TeacherSection";
import SchoolSection from "../HomePage/SchoolSection";
import FeaturesSection from "../HomePage/FeaturesSection";
import ExamSection from "../HomePage/ExamSection";
import DetailSection from "../HomePage/DetailSection";
import TutorCategoriesSection from "../HomePage/TutorCategoriesSection";
import { Helmet } from "react-helmet-async";

function Home() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <>
      <Helmet>
        <title>Home | PTPI</title>
      </Helmet>

      <div
        className="md:bg-contain bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('Home3.png')`,
        }}
      >
        <div className="hero min-h-[600px] w-full flex flex-col items-center justify-center px-4 relative">
          {/* Decorative elements */}
          <div className="hidden md:block absolute top-10 right-10">
            <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
            </svg>
          </div>
          <div className="hidden md:block absolute bottom-10 left-10 animate-pulse">
            <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div className="flex justify-center items-center mx-auto flex-col w-full lg:w-[65%] text-gray-800 mb-2 relative">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 mb-6">
                <svg className="hidden md:block w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h1 className="font-bold text-xl md:text-5xl text-teal-600">
                  Private Teacher Provider Institute
                </h1>
              </div>

              <div className="relative inline-block">
                <span className="block text-xl md:text-2xl text-gray-600 text-center">
                  पढ़ने, पढ़ाने और पढ़वाने का बेहतरीन मंच
                </span>
                <svg
                  className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-[180px] md:w-[220px] text-teal-600"
                  viewBox="0 0 180 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 2C36.5 10.5 143.5 -3.5 178 2"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Call to action button */}
              <button className="mt-12 px-8 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Your Perfect Teacher
              </button>
            </div>
          </div>
        </div>

        <TutorCategoriesSection />

        <TeacherSection onSelectRole={handleRoleSelection} />
        <FeaturesSection />
        <SchoolSection onSelectRole={handleRoleSelection} />
        <ExamSection />
        <DetailSection />
        {/* <TeacherProfiles /> */}
      </div>
    </>
  );
}

export default Home;
