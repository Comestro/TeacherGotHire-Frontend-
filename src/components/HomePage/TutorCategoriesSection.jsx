import React, { useState, useEffect } from "react";
import { BiMath } from "react-icons/bi";
import { RiEnglishInput, RiGalleryView2 } from "react-icons/ri";
import { MdBiotech } from "react-icons/md";
import { FaFlask, FaAtom, FaFileInvoiceDollar, FaCode } from "react-icons/fa";

const categories = [
  { name: "Mathematics", count: 12802, icon: <BiMath className="text-orange-400" /> },
  { name: "English", count: 4723, icon: <RiEnglishInput className="text-orange-400" /> },
  { name: "Biological Science", count: 3358, icon: <MdBiotech className="text-orange-400" /> },
  { name: "Science", count: 4170, icon: <FaFlask className="text-orange-400" /> },
  { name: "Physics", count: 1876, icon: <FaAtom className="text-orange-400" /> },
  { name: "Accounting", count: 1088, icon: <FaFileInvoiceDollar className="text-orange-400" /> },
  { name: "Programming Language", count: 341, icon: <FaCode className="text-orange-400" /> },
  { name: "view all", count: 178, icon: <RiGalleryView2 className="text-orange-400" /> },
];

function TutorCategoriesSection() {
  const [showAll, setShowAll] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleMinimize = () => {
    setShowAll(false);
  };

  return (
    <div className="bg-gray-50 flex flex-col p-8">
      <div className="flex justify-center">
        <div className="text-center my-10 max-w-3xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-600">
            Find the Perfect Tutor for You!
          </h1>
          <p className="text-gray-600 mt-4">
            More than 50,000 students have already found their tutor. Whether you need help with English, Math, History, French, or coding like C++ and Node.js, we’ve got you covered!
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center">
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-6 lg:px-14 gap-8">
            {categories.slice(0, showAll || windowWidth >= 1024 ? categories.length : 4).map((category, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl border py-5 px-2 max-w-xl flex flex-col items-center text-center"
              >
                <div className="text-3xl text-red-500 mb-3">{category.icon}</div>
                <h3 className="text-xlg font-semibold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-500">{category.count} tutors</p>
              </div>
            ))}
          </div>

          <div className="lg:hidden mt-6">
            {!showAll ? (
              <button
                onClick={handleShowMore}
                className="py-2 px-6 bg-orange-400 text-white rounded-xl text-lg w-full"
              >
                Show More
              </button>
            ) : (
              <button
                onClick={handleMinimize}
                className="py-2 px-6 bg-orange-400 text-white rounded-xl text-lg w-full"
              >
                Minimize
              </button>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="flex-shrink-0 mt-8 lg:mt-0">
          <img src="tutor.png" className="w-full max-w-sm lg:max-w-md" alt="Tutors" />
        </div>
      </div>
    </div>
  );
}

export default TutorCategoriesSection;
