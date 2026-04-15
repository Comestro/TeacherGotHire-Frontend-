import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon, title, description, quote }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-8 text-center transition-all duration-300 flex flex-col h-full hover:border-slate-300">
    <div className="mb-6 mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 tracking-tight">
      {title}
    </h3>
    <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow font-medium">
      {description}
    </p>
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg relative mt-auto">
      <blockquote className="text-slate-600 font-medium text-sm italic">
        "{quote}"
      </blockquote>
    </div>
  </div>
);

const DetailSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: (
        <img
          src="teach.png"
          alt="Find Tutors Instantly"
          className="w-full h-full object-contain drop-shadow-none"
        />
      ),
      title: "Find Tutors Instantly",
      description:
        "Connect with qualified tutors in your area or online. Our platform seamlessly matches students with the right tutors based on their exact needs and goals.",
      quote: "Thank you for helping me find the perfect tutor!",
    },
    {
      icon: (
        <img
          src="first.png"
          alt="Individual Tutoring"
          className="w-full h-full object-contain drop-shadow-none"
        />
      ),
      title: "1-on-1 Individual Tutoring",
      description:
        "Teachers can effortlessly connect with students looking for highly personalized learning experiences. Set your own schedule, rates, and subjects.",
      quote: "A game-changer for my tutoring business!",
    },
    {
      icon: (
        <img
          src="qualified.png"
          alt="Streamlined Scheduling"
          className="w-full h-full object-contain drop-shadow-none"
        />
      ),
      title: "Effortless Scheduling",
      description:
        "Say goodbye to the hassle of coordinating messy schedules via phone calls. Our platform allows students and teachers to book sessions effortlessly.",
      quote: "Scheduling lessons has never been easier!",
    },
  ];

  return (
    <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#fcfdfd] font-outfit border-t border-slate-100 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-100 bg-teal-50/50 w-fit mb-6">
               <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
               <span className="text-xs font-bold text-teal-700 tracking-widest uppercase">Why Choose PTP Institute?</span>
            </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6">
            The <span className="text-teal-600 block mt-2">#1 Hiring Platform</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            We are the bridge connecting hungry minds with expert educators. Experience premium quality education precisely on your schedule without friction.
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
          <button
            onClick={() => navigate("/recruiter")}
            className="bg-teal-600 text-white py-4 px-10 flex items-center justify-center gap-3 rounded-lg text-lg font-bold hover:bg-teal-700 active:scale-95 transition-all w-full sm:w-auto"
          >
            Start Finding Tutors <FiArrowRight className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailSection;
