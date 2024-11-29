
import React from "react";
import Navbar from "../../Navbar/Navbar";
import PersonalProfileCard from "./PersonalProfileCard";
import PersonalSidebar from "./PersonalSidebar";
import ResumeUpload from "./ResumeUpload";
import Skills from "./Skills";
import Experience from "./Experience";
import Education from "./Education";


const EditPersonalProfile = () => {
  return (
    <>
      <nav className=''>
        <Navbar
          links={[
            { id: '1', label: "Contact US", to: "/contact" },
            { id: "2", label: "AboutUs", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>



     <div className="bg-gray-50">
     <div className="md:py-7  md:mx-48">
        <PersonalProfileCard />

      </div>
      <div className='flex flex-col md:flex-row mx-48 space-x-4'>
          <div className='w-full md:w-3/12'>
            <PersonalSidebar />
          </div>
          <div className='flex flex-col w-full md:w-9/12'>
           <div className="mb-3">
           <ResumeUpload />
           </div> 
           <div className="mb-3">
           <Skills />
           </div>
           <div className="mb-3">
           <Education />
           </div>
           <div className="mb-3">
           <Experience />
           </div>
          </div>
          
        </div>
     </div>
    </>
  )
};
export default EditPersonalProfile;
