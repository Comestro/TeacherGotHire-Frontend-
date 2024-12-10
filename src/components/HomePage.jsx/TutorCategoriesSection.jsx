import React from "react";
import { BiMath } from "react-icons/bi";
import { FaBook, FaMicroscope, FaFlask, FaAtom, FaFileInvoiceDollar, FaCode, FaLandmark } from "react-icons/fa";
import { MdBiotech } from "react-icons/md";
import { RiEnglishInput, RiGalleryView2 } from "react-icons/ri";

const categories = [
  { name: "Mathematics", count: 12802, icon: <BiMath className="text-orange-400" /> },
  { name: "English", count: 4723, icon: <RiEnglishInput className="text-orange-400" /> },
  { name: "Biological Science", count: 3358, icon: <MdBiotech className="text-orange-400" /> },
  { name: "Science", count: 4170, icon: <FaFlask className="text-orange-400" /> },
  { name: "Physics", count: 1876, icon: <FaAtom className="text-orange-400" /> },
  // { name: "Accounting", count: 1088, icon: <FaFileInvoiceDollar className="text-orange-400" /> },
  // { name: "Programming Language", count: 341, icon: <FaCode className="text-orange-400" /> },
  { name: "view all", count: 178, icon: <RiGalleryView2 className="text-orange-400" /> },
];

function TutorCategoriesSection() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center  p-8" >
      {/* Header Section */}
      <div className="text-center my-10 max-w-3xl mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-600">
          Find the Perfect Tutor for You!
        </h1>
        <p className="text-gray-600 mt-4">
          More than 50,000 students have already found their tutor. Whether you need help with English, Math, History, French, or coding like C++ and Node.js, we’ve got you covered!        </p>
        <button className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Request a Tutor
        </button>
      </div>

      {/* Categories Section */}
      <div className="flex flex-row">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-10 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white shadow-sm rounded-xl border p-2 justify-center flex flex-col items-center text-center transform transition duration-300 hover:scale"
            >
              <div className="text-4xl text-red-500 mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {category.name}
              </h3>
              <p className="text-gray-500 mt-2">{category.count} tutors</p>
            </div>
          ))}
        </div>

        <div>
          <img src="tutor.png" className="" alt="" />
        </div>
      </div>
    </div>
  );
}

export default TutorCategoriesSection;
