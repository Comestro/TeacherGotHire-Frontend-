import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import {  useNavigate } from "react-router-dom";

// FeatureCard Component
const FeatureCard = ({ icon, title, description, quote }) => (

  <div className="bg-white border border-slate-200 shadow-none hover:shadow-sm rounded-2xl p-8 text-left transition-all duration-300 group h-full flex flex-col">
    <div className="mb-6 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 text-center">
      {title}
    </h3>
    <p className="text-slate-600 mb-6 text-base leading-relaxed flex-grow text-center">{description}</p>
    <blockquote className="text-teal-600 font-medium text-center italic bg-teal-50 p-4 rounded-xl">
      &ldquo;{quote}&rdquo;
    </blockquote>
  </div>
);

// DetailSection Component
const DetailSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: (
        <img
          src="teach.png"
          alt="Find Tutors Instantly"
          className="w-32 h-32 object-contain"
        />
      ),
      title: "Find Tutors Instantly",
      description:
        "Connect with qualified tutors in your area or online. Our platform matches students with the right tutors based on their needs and goals.",
      quote: "Thank you for helping me find the perfect tutor!",
    },
    {
      icon: (
        <img
          src="first.png"
          alt="Individual Tutoring"
          className="w-32 h-32 object-contain"
        />
      ),
      title: "Individual Tutoring (One-On-One)",
      description:
        "Teachers can easily connect with students looking for personalized learning experiences. Set your schedule, rates, and subjects.",
      quote: "A game-changer for my tutoring business!",
    },
    {
      icon: (
        <img
          src="qualified.png"
          alt="Streamlined Scheduling"
          className="w-32 h-32 object-contain"
        />
      ),
      title: "Connect with a qualified tutor",
      description:
        "Say goodbye to the hassle of coordinating schedules. Our platform allows students and teachers to book sessions effortlessly.",
      quote: "Scheduling lessons has never been easier!",
    },
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500" style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}>#1 Platform</span> for Teacher and Tutor Hiring
          </h1>
          <p className="text-teal-600 mt-4 text-lg sm:text-xl font-medium max-w-3xl mx-auto">
            Connecting students with expert tutors and teachers. Quality education, on your schedule.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="h-full">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

        <div className="text-center flex items-center justify-center">
          <button onClick={() => navigate('/get-preferred-teacher')} className="bg-teal-600 text-white py-4 px-8 flex items-center justify-center rounded-xl text-lg font-bold shadow-sm hover:bg-teal-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300">
            Find Tutors <FaArrowRightLong className="ml-2" />
          </button> 
        </div>
      </div>
    </div>
  );
};

export default DetailSection;
