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
  const dispatch = useDispatch();
  const  notification = useSelector((state) => state.notification);

  console.log(notification.show, "notification");

  useEffect(() => {
    if (notification.show) {
      if (notification.type === 'success') {
        toast.success(notification.message);
      } else if (notification.type === 'error') {
        toast.error(notification.message);
      }
      // Clear the notification after showing
      dispatch(clearNotification());
    }
  }, [notification.show, notification.message, notification.type, dispatch]);

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <>
      <Helmet>
        <title>Home | PTPI</title>
      </Helmet>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        limit={1}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="relative md:bg-contain bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url('Home3.png')`,
      }}>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-40 pb-16 md:pt-40 md:pb-28">
            {/* Hero Content */}
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo and Title */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-gray-500">
                  <span className="text-teal-600">Private Teacher</span> Provider Institute
                </h1>
              </div>

              {/* Hindi Tagline */}
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

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "1000+", label: "Teachers" },
                { number: "500+", label: "Schools" },
                { number: "5000+", label: "Students" },
                { number: "50+", label: "Cities" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-teal-600">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Your existing feature cards here */}
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-20 h-20 text-teal-600 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Private Tutoring
              </h3>
              <p className="text-gray-600">
                Connect with experienced private tutors for personalized
                learning
              </p>
            </div>

            {/* School Hiring Icon */}
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-20 h-20 text-teal-600 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                School Recruitment
              </h3>
              <p className="text-gray-600">
                Helping schools find qualified teachers for their
                institutions
              </p>
            </div>

            {/* Teacher Opportunities Icon */}
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-20 h-20 text-teal-600 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 7h6"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Teaching Opportunities
              </h3>
              <p className="text-gray-600">
                Find teaching positions at schools, coaching centers, and
                private tutoring
              </p>
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
