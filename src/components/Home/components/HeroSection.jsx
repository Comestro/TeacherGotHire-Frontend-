import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiUserPlus, FiArrowRight, FiBookOpen, FiBriefcase, FiUsers, FiCheckCircle, FiX } from "react-icons/fi";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const paths = {
    student: {
      id: "student",
      title: "Students & Parents",
      icon: <FiUsers className="w-5 h-5" />,
      tagline: "Find Your Perfect Home Tutor",
      description: "अगर आप एक छात्र/अभिभावक हैं और आपको एक अच्छे शिक्षक (Home Tutor) की आवश्यकता है।",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      steps: [
        "सबसे पहले www.ptpinstitute.com को सर्च करें!",
        'होम पेज पर जाएं, "शिक्षक खोजें" बटन पर क्लिक करें!',
        "न्यू पेज पर तीन तरह के शिक्षक को हम लोग चुन सकते हैं (।) स्कूल टीचर(।।)कोचिंग टीचर(।।।)पर्सनल(होम) टीचर किसी एक को चुने !",
        "Class Category और Subject को चुने!",
        "जिस जगह पर आपको शिक्षक चाहिए वहां का पिन कोड नंबर डालें( चाहे तो आप Optional area को भी सेलेक्ट कर सकते हैं जो आपके करीब हो) फिर सर्च करें!",
        "अगर मनो-योग्य शिक्षक मिलता है तो आप उसे Order कर सकते हैं"
      ],
      primaryAction: { label: "Search Tutors", to: "/recruiter", icon: <FiSearch className="w-5 h-5"/> }
    },
    institute: {
      id: "institute",
      title: "Educational Institutes",
      icon: <FiBriefcase className="w-5 h-5" />,
      tagline: "Hire Top-Tier Faculty",
      description: "अगर आपको शिक्षण संस्थान (स्कूल, कोचिंग) के लिए किसी भी विषय के शिक्षकों की आवश्यकता है।",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      steps: [
        "सबसे पहले www.ptpinstitute.com को सर्च करें!",
        'होम पेज पर जाएं, "शिक्षक खोजें" बटन पर क्लिक करें!',
        "School Teacher या Coaching Teacher चयन करें",
        "Class Category और Subject को चुने!",
        "जिस जगह पर स्कूल या कोचिंग है वहां का पिन कोड नंबर डालें( चाहे तो आप Optional area को भी सेलेक्ट कर सकते हैं जो स्कूल या कोचिंग के करीब हो) फिर सर्च करें!",
        "अगर मनो-योग्य शिक्षक मिलता है तो आप उसे Order कर सकते हैं"
      ],
      primaryAction: { label: "Find Faculty", to: "/recruiter", icon: <FiSearch className="w-5 h-5"/> }
    },
    teacher: {
      id: "teacher",
      title: "Teachers & Tutors",
      icon: <FiBookOpen className="w-5 h-5" />,
      tagline: "Launch Your Teaching Career",
      description: "अगर आप एक शिक्षक हैं और आपको Home Tuition, कोचिंग, स्कूल में पढ़ाना है।",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      steps: [
        "सबसे पहले www.ptpinstitute.com को सर्च करें!",
        'होम पेज पर जाएं "Register" पर क्लिक करें!',
        "फिर 'As a Teacher' link पर क्लिक करें!",
        'फॉर्म को भरकर "Sign up as a Teacher" करें!',
        "ID बनाने के बाद उसमें ईमेल आईडी और फोन नंबर जोड़े और सारा डिटेल को को भरना है",
        "Level-1( Test from home) का टेस्ट घर से दे!",
        "Level-1 का टेस्ट पास करने के बाद Level-2(Test from home)पास करें!",
        "Level-2(test from home ) पास करने के बाद आप इंटरव्यू के लिए अप्लाई कर सकते हैं या Level-2(Test from Exam centre) के लिए apply कर सकते हैं!",
        "Level-2(test from Exam centre) या इंटरव्यू पास करने के बाद आप पढ़ाने के लिए अप्लाई कर सकते हैं या Level-3(test from home ) test दे सकते हैं!",
        "Level-3(test from home ) का टेस्ट पास करने के बाद Level-3 (test from Exam centre) का टेस्ट दे सकते हैं और उसे भी पास कर सकते हैं!",
        "अब Level-3 का इंटरव्यू दे सकते हैं और पास कर सकते हैं।"
      ],
      primaryAction: { label: "Apply Now", to: "/teacher", icon: <FiUserPlus className="w-5 h-5"/> }
    }
  };

  const activeData = paths[activeTab];

  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center bg-[#fcfdfd] overflow-hidden font-outfit border-b border-slate-100">
      
      {/* Abstract Background Shapes (No Gradients, Just Solid Soft Colors) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-50/40 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[75vh]">
          
          {/* Left Column: Typography & Hook */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-100 bg-teal-50/50 w-fit">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-teal-700 tracking-widest uppercase">The Future of Education</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 leading-[1.1] tracking-tight">
              Private Teacher <br />
              <span className="text-teal-600">Provider Institute</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-lg">
              पढ़ने, पढ़ाने और पढ़वाने का <span className="text-slate-800 font-bold border-b-2 border-teal-200">बेहतरीन मंच</span>। Connect with top educators and institutions instantly without the friction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/recruiter" className="px-8 py-4 bg-teal-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-95 transition-all">
                <FiSearch className="w-5 h-5" /> Start Exploring
              </Link>
              <Link to="/teacher" className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all">
                <FiUserPlus className="w-5 h-5" /> Join as Educator
              </Link>
            </div>
            
            <div className="flex items-center gap-8 pt-8 border-t border-slate-100 mt-4">
               <div>
                  <h4 className="text-3xl font-black text-slate-800">10k+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Tutors</p>
               </div>
               <div className="w-px h-12 bg-slate-100"></div>
               <div>
                  <h4 className="text-3xl font-black text-slate-800">5k+</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Institutes</p>
               </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Content Switching Box */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl lg:ml-auto"
          >
            {/* The Tab Controls */}
            <div className="flex p-1.5 bg-white border border-slate-200 rounded-lg gap-1.5 mb-6">
              {Object.values(paths).map((path) => (
                <button
                  key={path.id}
                  onClick={() => setActiveTab(path.id)}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-2.5 md:py-3 rounded-lg font-bold transition-all duration-300 ${
                    activeTab === path.id 
                      ? `${path.bgColor} ${path.color} border ${path.borderColor}`
                      : "text-slate-400 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {path.icon}
                  <span className="text-[10px] md:text-sm tracking-tight leading-none text-center whitespace-nowrap">{path.title}</span>
                </button>
              ))}
            </div>

            {/* The Interactive Content Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 min-h-[380px] flex flex-col relative overflow-hidden">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeData.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full flex-1"
                  >
                     <div className="flex items-center gap-4 mb-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${activeData.bgColor} ${activeData.color}`}>
                           {activeData.icon}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800">{activeData.title}</h3>
                     </div>
                     <p className="text-xs md:text-sm font-medium text-slate-500 mb-5 leading-relaxed max-w-[95%]">
                        {activeData.description}
                     </p>
                     
                     <div className="space-y-3 mb-6 flex-1">
                        {activeData.steps.slice(0, 5).map((step, idx) => (
                           <div key={idx} className="flex items-start gap-3">
                              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${activeData.borderColor} ${activeData.color} bg-white shrink-0 font-bold text-[9px]`}>
                                 {idx + 1}
                              </div>
                              <span className="text-xs md:text-sm text-slate-600 font-medium leading-tight line-clamp-2">{step}</span>
                           </div>
                        ))}
                        {activeData.steps.length > 5 && (
                           <button 
                             onClick={() => setIsModalOpen(true)}
                             className={`text-[11px] font-bold ${activeData.color} hover:underline uppercase tracking-widest mt-4 flex items-center gap-1`}
                           >
                              See all {activeData.steps.length} steps <FiArrowRight size={12}/>
                           </button>
                        )}
                     </div>

                     <Link
                       to={activeData.primaryAction.to}
                       className={`w-full py-3.5 md:py-4 rounded-lg flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all border ${activeData.borderColor} ${activeData.bgColor} ${activeData.color} hover:bg-white`}
                     >
                        {activeData.primaryAction.label}
                        <FiArrowRight />
                     </Link>
                  </motion.div>
               </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
               onClick={() => setIsModalOpen(false)} 
             />
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.95, opacity: 0, y: 20 }} 
               className="relative bg-white w-full max-w-lg rounded-lg p-6 md:p-8 border border-slate-100 font-outfit"
             >
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-slate-100 ${activeData.bgColor} ${activeData.color}`}>
                         {activeData.icon}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{activeData.title}</h3>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                      <FiX size={18} />
                   </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                   {activeData.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                         <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${activeData.borderColor} ${activeData.color} bg-white shrink-0 font-bold text-[10px]`}>
                            {idx + 1}
                         </div>
                         <span className="text-sm text-slate-600 font-medium leading-relaxed">{step}</span>
                      </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;
