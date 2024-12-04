
// import React from "react";
// import Navbar from "../../Navbar/Navbar";
// import PersonalProfileCard from "../PersonalProfile/PersonalProfileCard";
// import Education from "./Education";
// import Exprience from "./Exprience";




// const EditJobProfile = () => {
//   return (
//     <>
//       <nav className=''>
//         <Navbar
//           links={[
//             { id: '1', label: "Contact US", to: "/contact" },
//             { id: "2", label: "AboutUs", to: "/about" },
//           ]}
//           variant="dark"
//         />
//       </nav>



//      <div className="bg-gray-50">
//      <div className="md:py-7  md:mx-48">
//         <PersonalProfileCard />
//       </div>
//       <div className="md:py-7  md:mx-48">
//         <Education />
//       </div>
//       <div className="md:py-7  md:mx-48">
//         <Exprience/>
//       </div>
//      </div>
//     </>
//   )
// };
// export default EditJobProfile;

import React from "react";
import Navbar from "../../Navbar/Navbar";
import PersonalProfileCard from "../PersonalProfile/PersonalProfileCard";
import Education from "./Education";
import Exprience from "./Exprience";

const EditJobProfile = () => {
  return (
    <>
      {/* Navbar */}
      <nav>
        <Navbar
          links={[
            { id: "1", label: "Contact US", to: "/contact" },
            { id: "2", label: "About Us", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>

      {/* Main Layout */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-100 min-h-screen">
        <div className="container mx-auto px-6 md:px-20 py-10 space-y-12">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-extrabold mb-2">
              Welcome to Your Job Profile Dashboard!
            </h1>
            <p className="text-lg font-medium mb-4">
              Easily manage and update your personal profile, education, and experience to enhance your opportunities.
            </p>
            <p className="text-sm italic opacity-80">
              Tip: Ensure your profile is up-to-date to unlock the best teaching roles.
            </p>
          </div>

          {/* Personal Profile Section */}
          <section className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 opacity-20"></div>
            <div className="p-6 relative z-10">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                Personal Profile
              </h2>
              <PersonalProfileCard />
            </div>
          </section>

          {/* Education Section */}
          <section className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-50 opacity-20"></div>
            <div className="p-6 relative z-10">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">Education</h2>
              <Education />
            </div>
          </section>

          {/* Experience Section */}
          <section className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-50 opacity-20"></div>
            <div className="p-6 relative z-10">
              <h2 className="text-2xl font-bold text-orange-700 mb-4">
                Experience
              </h2>
              <Exprience />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default EditJobProfile;
