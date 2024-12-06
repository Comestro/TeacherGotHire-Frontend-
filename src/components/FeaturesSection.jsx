import React from "react";
import { BiLogInCircle } from "react-icons/bi";
import {
  FaUserCheck,
  FaPencilAlt,
  FaVideo,
  FaChalkboardTeacher,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { IoVideocamOutline } from "react-icons/io5";
import { LiaChalkboardTeacherSolid, LiaMoneyCheckSolid } from "react-icons/lia";

const FeaturesSection = () => {
  return (
    <section className="bg-white py-12 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-600 mb-6">
          Simplified 5-Step Teacher Hiring Process
        </h2>
        <p className="text-gray-600 mb-12">
          Join our team in just five easy steps and kickstart your teaching journey.
        </p>

        <div className="space-y-8">
          {/* First Row */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
            <div className="feature-item flex flex-col items-center p-6  rounded-lg">
              <BiLogInCircle  className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Step 1: Login/Sign Up
              </h3>
              <p className="text-gray-600 text-center">
                Create an account to begin your application process.
              </p>
            </div>

            <div className="feature-item flex flex-col items-center p-6  rounded-lg">
            <HiOutlinePencilSquare className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Step 2: Take an Exam
              </h3>
              <p className="text-gray-600 text-center">
                Complete a secure online test with a maximum of 2 attempts.
              </p>
            </div>

            <div className="feature-item flex flex-col items-center p-6  rounded-lg">
              <IoVideocamOutline
              className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Step 3: Interview
              </h3>
              <p className="text-gray-600 text-center">
                Showcase your skills in a virtual interview.
              </p>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid lg:mx-44 sm:grid-cols-1 md:grid-cols-2">
            <div className="feature-item flex flex-col items-center p-6  rounded-lg">
            <LiaChalkboardTeacherSolid className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Step 4: Demo Classes
              </h3>
              <p className="text-gray-600 text-center">
                Conduct 10 days of demo classes to prove your teaching ability.
              </p>
            </div>

            <div className="feature-item flex flex-col items-center p-6  rounded-lg">
            <LiaMoneyCheckSolid  className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Step 5: Get Hired
              </h3>
              <p className="text-gray-600 text-center">
                Receive your salary with a 30% deduction for the hiring process.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
          <button className="px-8 py-3 text-white bg-teal-600 rounded-full hover:bg-teal-700">
            Learn More
          </button>
          <button className="px-8 py-3 text-teal-500 border-2 border-teal-500 rounded-full hover:bg-teal-100">
            Watch Process Video
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
