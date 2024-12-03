
import React from "react";
import Navbar from "../../Navbar/Navbar";
import PersonalProfileCard from "../PersonalProfile/PersonalProfileCard";
import Education from "./Education";
import Exprience from "./Exprience";




const EditJobProfile = () => {
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
      <div className="md:py-7  md:mx-48">
        <Education />
      </div>
      <div className="md:py-7  md:mx-48">
        <Exprience/>
      </div>
     </div>
    </>
  )
};
export default EditJobProfile;
