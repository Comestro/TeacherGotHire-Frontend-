import React, { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Button from "../Button";
import { IoSearchOutline } from "react-icons/io5";
import Footer from "../Footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import TeacherProfiles from "../HomePage/Review/TeacherProfile";
import TeacherSection from "../HomePage/TeacherSection";
import SchoolSection from "../HomePage/SchoolSection";
import FeaturesSection from "../HomePage/FeaturesSection";
import ExamSection from "../HomePage/ExamSection";
import DetailSection from "../HomePage/DetailSection";
import TutorCategoriesSection from "../HomePage/TutorCategoriesSection";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { clearNotification } from "../../features/notificationSlice";
import { toast, ToastContainer } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <>
      <Helmet>
        <title>Home | PTPI</title>
      </Helmet>

      <div className="relative w-full bg-white h-[100vh]">
        <div
          className="hidden md:block absolute inset-0 w-full h-full bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url('Home3.png')`,
            backgroundPosition: "center top",
          }}
        />
        <div className="md:hidden absolute bottom-0 left-0 right-0 w-full flex justify-end items-center">
          <img
            src="teacher-student.svg"
            alt="Teacher and Student"
            className="w-[500px] h-[500px] "
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-40 pb-16 md:pt-40 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-8">
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-gray-500">
                  <span className="text-teal-600">Private Teacher</span>{" "}
                  Provider Institute
                </h1>
              </div>

              <div className="relative mb-12">
                <p className="text-xl md:text-2xl text-gray-600 font-medium">
                  पढ़ने, पढ़ाने और पढ़वाने का बेहतरीन मंच
                </p>
                <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
                  <svg
                    className="w-[180px] md:w-[220px] text-teal-600"
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

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <Link
                  to="/recruiter"
                  className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <IoSearchOutline className="w-5 h-5" />
                  <span>Find Your Perfect Teacher</span>
                </Link>
                <Link
                  to="/teacher"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <span>Join as a Teacher</span>
                </Link>
              </div>
            </div>
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
    </>
  );
};

export default Home;
