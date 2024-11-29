
import React from "react";
import Navbar from "../../Navbar/Navbar";
import PersonalProfileCard from "./PersonalProfileCard";


const EditPersonalProfile = () => {
  return (
    <>
    <nav className=''>
      <Navbar
            links={[
                {id:'1', label: "Contact US", to: "/contact" },
                {id:"2", label: "AboutUs", to: "/about" },
              ]}
              variant="dark"
      />
    </nav>
        
    <div className="flex space-x-6 mt-32">
      <div className="w-3/4 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 border border-gray-300 space-y-6">
        <div  className="p-4 bg-gray-50 rounded-md shadow-sm">
          <PersonalProfileCard />
        </div>
      </div>
    </div>
</>
)};
export default EditPersonalProfile;
