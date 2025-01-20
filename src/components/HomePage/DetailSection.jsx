import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";

// FeatureCard Component
const FeatureCard = ({ icon, title, description, quote }) => (
  <div className="bg-teal-50 shadow-md  rounded-xl p-6 text-left">
    <div className="mb-4 flex items-center justify-center">{icon}</div>
    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 text-center">
      {title}
    </h3>
    <p className="text-gray-600 mb-4 text-sm md:text-base">{description}</p>
    <blockquote className="text-teal-600 font-semibold text-center">
      &ldquo;{quote}&rdquo;
    </blockquote>
  </div>
);

// DetailSection Component
const DetailSection = () => {
  const features = [
    {
      icon: (
        <img
          src="teach.png"
          alt="Find Tutors Instantly"
          className="w-36 h-36 sm:w-48 sm:h-48"
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
          className="w-36 h-36 sm:w-48 sm:h-48"
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
          className="w-36 h-36 sm:w-48 sm:h-48"
        />
      ),
      title: "Connect with a qualified tutor",
      description:
        "Say goodbye to the hassle of coordinating schedules. Our platform allows students and teachers to book sessions effortlessly.",
      quote: "Scheduling lessons has never been easier!",
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-600">
          The <span className="text-orange-400" style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}>#1 Platform</span> for Teacher and Tutor Hiring
        </h1>
        <p className="text-teal-500 mt-4 text-base sm:text-lg">
          Connecting students with expert tutors and teachers. Quality education, on your schedule.
        </p>
      </header>
      <div className="grid lg:mx-11 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index}>
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
      <div className="text-center flex items-center justify-center mt-10">
        <button className="bg-teal-500 text-white py-2 px-6 flex items-center justify-center rounded-full text-base sm:text-lg hover:bg-teal-600">
          Find Tutors <FaArrowRightLong className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default DetailSection;
