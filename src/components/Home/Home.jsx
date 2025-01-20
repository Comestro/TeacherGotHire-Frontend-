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

function Home() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div
      className="md:bg-contain bg-cover bg-no-repeat "
      style={{
        backgroundImage: `url('Home3.png')`,
      }}
    >
      {/* <nav>
        <Navbar
          links={[
            { id: "1", label: "Register", to: "/signup/teacher" },
            { id: "2", label: "Login", to: "/signin" },
            { id: "5", label: "Admin", to: "/admin-signin" },
            { id: "3", label: "Contact Us", to: "/contact" },
            { id: "4", label: "About Us", to: "/about" },
          ]}
          variant="dark"
        />
      </nav> */}
      <div className="hero h-[600px] w-full flex flex-col items-center justify-center px-4 ">
        <div className="flex justify-center items-center mx-auto flex-col w-full lg:w-[65%] text-gray-800 mb-2">
          <div className="flex">
            <p className="mb-4 font-bold text-2xl md:text-5xl leading-none text-center">
              <span className="font-bold text-2xl pb-10 md:text-6xl text-teal-600 me-1">
                PTPI
              </span>
              – Connect with top teachers and great teaching jobs.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full px-4 lg:w-3/4 lg:px-10">
          <div className="flex items-center rounded-full border-2 p-2 bg-white">
            <input
              type="text"
              placeholder="What subject do you need help with?"
              className="flex-1 p-2 px-4 border-none focus:outline-none text-gray-600 placeholder-gray-400 placeholder:font-semibold"
            />
            <div className="h-6 w-px bg-gray-300 mx-4 hidden sm:block"></div>
            <IoLocationOutline className="text-gray-600 hidden sm:block" />
            <input
              type="text"
              placeholder="Pin code"
              className="hidden sm:block w-24 md:w-32 p-2 border-none focus:outline-none text-gray-600 placeholder-gray-400"
            />
            <button className="bg-teal-700 p-2 rounded-full flex items-center justify-center">
              <IoSearchOutline className="text-white w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              Math
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              Science
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              History
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              Geography
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="px-4 py-2 rounded-full"
            >
              Music
            </Button>
          </div>
        </div>
      </div>
      <div className=" border-gray-300 py-8 -mt-16">
        <div className="flex justify-between max-w-7xl mx-auto px-4  sm:px-6 lg:px-24 gap-6 text-center">
          {/* Item 1 */}
          <div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">16+</h2>
            <p className="mt-2 text-sm sm:text-lg text-gray-600">years helping learners</p>
          </div>
          {/* Item 2 */}
          <div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">10 million+</h2>
            <p className="mt-2 text-sm sm:text-lg text-gray-600">hours of 1-on-1 instruction</p>
          </div>
          {/* Item 3 */}
          <div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-gray-900">3,000+</h2>
            <p className="mt-2 text-sm sm:text-lg text-gray-600">subjects to explore</p>
          </div>
        </div>
      </div>

      <TutorCategoriesSection />

      <TeacherSection onSelectRole={handleRoleSelection} />
      <FeaturesSection />
      <SchoolSection onSelectRole={handleRoleSelection} />
      <ExamSection />
      <DetailSection />
      <TeacherProfiles className="w-full" />
    </div>
  );
}

export default Home;
