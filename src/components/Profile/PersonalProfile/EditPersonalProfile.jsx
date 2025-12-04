import React, { useEffect, useState, useRef } from "react";
import BasicInformation from "./BasicInformation";
import AddressProfileCard from "./AddressProfileCard";
import PrefrenceProfile from "../JobProfile/PrefrenceProfile";
import Experience from "../JobProfile/Exprience";
import Education from "../JobProfile/Education";
import Skills from "../JobProfile/Skills";
import { 
  HiUser, 
  HiBriefcase, 
  HiLocationMarker, 
  HiAcademicCap, 
  HiLightBulb,
  HiCheckCircle 
} from "react-icons/hi";

const EditPersonalProfile = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const mobileTabsRef = useRef(null);
  const tabRefs = useRef({});

  const tabs = [
    { 
      id: "basic", 
      label: "Basic Info", 
      icon: HiUser, 
      color: "blue",
      description: "Personal details"
    },
    { 
      id: "address", 
      label: "Address", 
      icon: HiLocationMarker, 
      color: "purple",
      description: "Location info"
    },
    { 
      id: "Subject Preference", 
      label: "Subject Preference", 
      icon: HiBriefcase, 
      color: "teal",
      description: "Subject preferences"
    },
    { 
      id: "experience", 
      label: "Experience", 
      icon: HiCheckCircle, 
      color: "green",
      description: "Work history"
    },
    { 
      id: "education", 
      label: "Education", 
      icon: HiAcademicCap, 
      color: "indigo",
      description: "Academic background"
    },
    { 
      id: "skills", 
      label: "Skills", 
      icon: HiLightBulb, 
      color: "amber",
      description: "Your expertise"
    },
  ];

  // Auto-scroll active tab to center on mobile
  useEffect(() => {
    if (mobileTabsRef.current && tabRefs.current[activeTab]) {
      const container = mobileTabsRef.current;
      const activeButton = tabRefs.current[activeTab];
      
      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      
      // Calculate scroll position to center the button
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInformation />;
      case "address":
        return <AddressProfileCard />;
      case "Subject Preference":
        return <PrefrenceProfile />;
      case "experience":
        return <Experience />;
      case "education":
        return <Education />;
      case "skills":
        return <Skills />;
      default:
        return <BasicInformation />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl ">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500 rounded-lg">
              <HiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Complete Your Profile
              </h1>
              <p className="text-slate-500 text-xs">
                Keep your information up to date
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
          {/* Tabs Navigation - Desktop & Mobile */}
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="lg:flex hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 relative px-4 py-3 transition-all duration-200 group ${
                      isActive
                        ? "bg-white text-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Icon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isActive ? "scale-110" : "group-hover:scale-105"
                        }`}
                      />
                      <div className="text-center">
                        <div className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                          {tab.label}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {tab.description}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Scrollable Tabs */}
            <div ref={mobileTabsRef} className="lg:hidden overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => tabRefs.current[tab.id] = el}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-6 py-3 transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-white text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isActive ? "text-teal-500" : ""}`} />
                        <div className="text-xs font-medium">{tab.label}</div>
                      </div>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            <div className="animate-fadeIn">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {/* <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-700">Profile Completion</h3>
            <span className="text-[10px] text-slate-500">Keep updating to stand out!</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Your profile is <span className="font-semibold text-teal-600">75% complete</span>. Complete all sections for better visibility!
          </p>
        </div> */}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default EditPersonalProfile;
