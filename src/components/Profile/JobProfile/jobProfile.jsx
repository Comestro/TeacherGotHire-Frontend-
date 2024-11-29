
import React, { useRef } from "react";
import QuickLinks from "../QuickLinks";
import Skills from "../skill";
import Experience from "../Experience";
import Education from "../Education";
import ResumeUpload from "../Resume";
import ProfileCard from "../ProfileCard";
import Navbar from "../Navbar/Navbar";
import ProfileButton from '../Profile_Button/Profile_Button';
import YourProfile from "../Profile/addressEdit";

const YourProfilePage = () => {
  // Create refs for each section
  // const resumeRef = useRef(null);
  // const headlineRef = useRef(null);
  // const skillsRef = useRef(null);
  // const educationRef = useRef(null);
  
  // const experienceRef = useRef(null);
  // const profileRef = useRef(null);
  // const addressRef = useRef(null);

  // Function to scroll to the specific section
  // const scrollToSection = (sectionId) => {
  //   switch (sectionId) {
  //     case "resume":
  //       resumeRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "headline":
  //       headlineRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "address":
  //       headlineRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "skills":
  //       skillsRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "education":
  //       educationRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "experience":
  //       experienceRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     case "profile":
  //       profileRef.current.scrollIntoView({ behavior: "smooth" });
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <>
    <nav className=''>
    <div className=''>
      <Navbar
          links={[
              {id:'1', label: "Contact US", to: "/contact" },
              {id:"2", label: "AboutUs", to: "/about" },
            ]}
            variant="dark"
            // notifications={notifications}
            externalComponent={ProfileButton}
          />
            </div>
          </nav>
        
    <div className="flex space-x-6 mt-32">
      {/* Sidebar */}
      {/* <div className="w-1/4">
        <QuickLinks scrollToSection={scrollToSection} />
        
      </div> */}

      {/* Main Content */}
      <div className="w-3/4 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 border border-gray-300 space-y-6">
        {/* Profile Card */}
        
        <div ref={profileRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <ProfileCard />
        </div>
        {/* <div ref={addressRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <YourProfile/>
        </div> */}
        {/* Resume Upload */}
        {/* <div ref={resumeRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <ResumeUpload />
        </div> */}

        {/* Skills */}
        {/* <div ref={skillsRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <Skills />
        </div> */}

        {/* Experience */}
        {/* <div ref={experienceRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <Experience />
        </div> */}

        {/* Education */}
        <div ref={educationRef} className="p-4 bg-gray-50 rounded-md shadow-sm">
          <Education />
        </div>
      </div>
    </div>
    </>
    
    
  );
};

export default YourProfilePage;
