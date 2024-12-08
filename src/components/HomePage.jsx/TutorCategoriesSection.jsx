import React from "react";
import { BiMath } from "react-icons/bi";
import { FaBook, FaMicroscope, FaFlask, FaAtom, FaFileInvoiceDollar, FaCode, FaLandmark } from "react-icons/fa";
import { MdBiotech } from "react-icons/md";
import { RiEnglishInput, RiGalleryView2 } from "react-icons/ri";

const categories = [
  { name: "Mathematics", count: 12802, icon: <BiMath />  },
  { name: "English", count: 4723, icon: <RiEnglishInput />  },
  { name: "Biological Science", count: 3358, icon: <MdBiotech />  },
  { name: "Science", count: 4170, icon: <FaFlask /> },
  { name: "Physics", count: 1876, icon: <FaAtom /> },
  { name: "Accounting", count: 1088, icon: <FaFileInvoiceDollar /> },
  { name: "Programming Language", count: 341, icon: <FaCode /> },
  { name: "view all", count: 178, icon: <RiGalleryView2 />  },
];

function TutorCategoriesSection() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center  p-8" >
      {/* Header Section */}
      <div className="text-center max-w-3xl mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        Find the Perfect Tutor for You!
                </h1>
        <p className="text-gray-600 mt-4">
        More than 50,000 students have already found their tutor. Whether you need help with English, Math, History, French, or coding like C++ and Node.js, we’ve got you covered!        </p>
        <button className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Request a Tutor
        </button>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center"
          >
            <div className="text-4xl text-red-500 mb-4">{category.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800">
              {category.name}
            </h3>
            <p className="text-gray-500 mt-2">{category.count} tutors</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TutorCategoriesSection;
