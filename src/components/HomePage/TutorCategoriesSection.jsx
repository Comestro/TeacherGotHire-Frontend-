import React, { useState, useEffect } from "react";
import { BiMath } from "react-icons/bi";
import { RiEnglishInput, RiGalleryView2 } from "react-icons/ri";
import { MdBiotech } from "react-icons/md";
import { FaFlask, FaAtom, FaFileInvoiceDollar, FaCode } from "react-icons/fa";
import { FiArrowRight, FiChevronDown, FiChevronUp } from "react-icons/fi";

const categories = [
  { name: "Mathematics", count: 12802, icon: <BiMath /> },
  { name: "English", count: 4723, icon: <RiEnglishInput /> },
  { name: "Biological Science", count: 3358, icon: <MdBiotech /> },
  { name: "Science", count: 4170, icon: <FaFlask /> },
  { name: "Physics", count: 1876, icon: <FaAtom /> },
  { name: "Accounting", count: 1088, icon: <FaFileInvoiceDollar /> },
  { name: "Programming", count: 341, icon: <FaCode /> },
  { name: "View All", count: 178, icon: <RiGalleryView2 /> },
];

function TutorCategoriesSection() {
  const [showAll, setShowAll] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-outfit">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-100 bg-amber-50/50 w-fit mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-700 tracking-widest uppercase">
              Browse Subjects
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6">
            Find the Perfect <span className="text-amber-600 block mt-2">Tutor for You</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            Over 50,000 students have already found their tutor. Whether you need help with English, Math, Science, or coding — we've got you covered!
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Category Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .slice(0, showAll || windowWidth >= 1024 ? categories.length : 4)
                .map((category, index) => (
                  <div
                    key={index}
                    className="bg-[#fcfdfd] rounded-lg border border-slate-200 py-6 px-4 flex flex-col items-center text-center hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-xl text-amber-600">
                      {category.icon}
                    </div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 tracking-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      {category.count.toLocaleString()} tutors
                    </p>
                  </div>
                ))}
            </div>

            {/* Mobile toggle */}
            <div className="lg:hidden mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded-lg font-bold text-sm border border-amber-100 hover:bg-amber-100 active:scale-95 transition-all"
              >
                {showAll ? (
                  <>
                    Show Less <FiChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show More <FiChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-shrink-0">
            <div className="w-full max-w-xs lg:max-w-sm">
              <img
                src="tutor.png"
                className="w-full h-auto object-contain mix-blend-multiply"
                alt="Tutors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorCategoriesSection;
