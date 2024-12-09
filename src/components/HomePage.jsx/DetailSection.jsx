import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";

// FeatureCard Component
const FeatureCard = ({ icon, title, description, quote }) => (
  <div className="bg-teal-50 shadow-md rounded-xl p-6 text-left">
    <div className="mb-4 ">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <blockquote className="text-teal-600 font-semibold">
      &ldquo;{quote}&rdquo;
    </blockquote>
  </div>
);

// DetailSection Component
const DetailSection = () => {
  // Feature data
  const features = [
    {
      icon: (
        <img
          src="teach.png"
          alt="Find Tutors Instantly"
          className="w-48 h-48"
        />
      ),
      title: "Find Tutors Instantly",
      description:
        "Connect with qualified tutors in your area or online. Our platform matches students with the right tutors based on their needs and goals.",
      quote: "Thank you for helping me find the perfect tutor !",
    },
    {
      icon: (
        <img
          src="first.png"
          alt="Expand Your Teaching Opportunities"
          className="w-48 h-48"
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
          className="w-48 h-48"
        />
      ),
      title: "Connect with a qualified tutor",
      description:
        "Say goodbye to the hassle of coordinating schedules. Our platform allows students and teachers to book sessions effortlessly.",
      quote: "Scheduling lessons has never been easier!",
    },
  ];

  return (
    <div className="py-16 px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-600">
          The #1 Platform for Teacher and Tutor Hiring
        </h1>
        <p className="text-teal-500 mt-2 text-lg">
          Connecting students with expert tutors and teachers. Quality education, on your schedule.
        </p>
      </header>
      <div className="grid mx-20 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index}>
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
      <div className="text-center flex items-center justify-center mt-10">
      <button className="bg-teal-500 text-white py-2 px-6 flex items-center  justify-center rounded-full text-lg hover:bg-teal-600">
  Find Tutors <FaArrowRightLong className=""  />

</button>
      </div>
    </div>
  );
};

export default DetailSection;
