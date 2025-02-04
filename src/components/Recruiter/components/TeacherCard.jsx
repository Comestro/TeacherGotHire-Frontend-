import React from "react";

const TeacherCard = ({ teacher }) => {
  const {
    Fname,
    Lname,
    email,
    teachersaddress,
    teacherexperiences,
    teacherqualifications,
  } = teacher;

  // Get current address if exists
  const currentAddress =
    teachersaddress?.find((addr) => addr.address_type === "current") || {};

  return (
    <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b border-white pb-4">
        <div className="flex-grow">
          <h2 className="text-2xl font-extrabold">
            {Fname} {Lname}
          </h2>
          <p className="text-sm">Email: {email}</p>
        </div>
      </div>

      {/* Address Section */}
      {currentAddress && (
        <div className="mt-4 bg-white bg-opacity-20 p-4 rounded-md">
          <h3 className="text-sm font-semibold">Address:</h3>
          <p className="text-sm mt-1">
            {currentAddress.village}, {currentAddress.block}, {currentAddress.district}, {currentAddress.state} - {currentAddress.pincode}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {teacherexperiences?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Experience:</h3>
          <ul className="mt-2 space-y-4">
            {teacherexperiences.map((exp, index) => (
              <li key={index} className="bg-white bg-opacity-20 p-4 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Institution:</span> {exp.institution}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Role:</span> {exp.role.jobrole_name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Achievements:</span> {exp.achievements}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Qualification Section */}
      {teacherqualifications?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Qualifications:</h3>
          <ul className="mt-2 space-y-4">
            {teacherqualifications.map((qual, index) => (
              <li key={index} className="bg-white bg-opacity-20 p-4 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Qualification:</span> {qual.qualification.name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Institution:</span> {qual.institution}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Year of Passing:</span> {qual.year_of_passing}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Grade:</span> {qual.grade_or_percentage}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherCard;
// import React from "react";

// const TeacherCard = ({ teacher }) => {
//   const {
//     Fname,
//     Lname,
//     email,
//     teachersaddress,
//     teacherexperiences,
//     teacherqualifications,
//     teacherskill,
//   } = teacher;

//   // Get current address if exists
//   const currentAddress =
//     teachersaddress?.find((addr) => addr.address_type === "current") || null;

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
//       {/* Header Section */}
//       <div className="flex items-center gap-4">
//         <img
//           src={
//             teacher.profiles?.profile_picture ||
//             "https://via.placeholder.com/150"
//           }
//           alt={`${Fname} ${Lname}`}
//           className="w-16 h-16 rounded-full object-cover"
//         />
//         <div className="flex-grow">
//           <h2 className="text-xl font-bold text-gray-800">
//             {Fname} {Lname}
//           </h2>
//           <p className="text-sm text-gray-500">Email: {email}</p>
//         </div>
//       </div>

//       {/* Address Section */}
//       {currentAddress && (
//         <div className="mt-4">
//           <h3 className="text-sm font-semibold text-gray-700">Address:</h3>
//           <p className="text-sm text-gray-600 mt-1">
//             {currentAddress.village}, {currentAddress.block},{" "}
//             {currentAddress.district}, {currentAddress.state} -{" "}
//             {currentAddress.pincode}
//           </p>
//         </div>
//       )}

//       {/* Skills Section */}
//       {teacherskill?.length > 0 && (
//         <div className="mt-4">
//           <h3 className="text-sm font-semibold text-gray-700">Skills:</h3>
//           <p className="text-sm text-gray-600 mt-1">
//             {teacherskill.map((skill) => skill.name).join(", ")}
//           </p>
//         </div>
//       )}

//       {/* Experience Section */}
//       {teacherexperiences?.length > 0 && (
//         <div className="mt-6">
//           <h3 className="text-sm font-semibold text-gray-700">Experience:</h3>
//           <ul className="mt-2 space-y-4">
//             {teacherexperiences.map((exp, index) => (
//               <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
//                 <p className="text-sm">
//                   <span className="font-medium text-gray-800">
//                     Institution:
//                   </span>{" "}
//                   {exp.institution}
//                 </p>
//                 <p className="text-sm mt-1">
//                   <span className="font-medium text-gray-800">Role:</span>{" "}
//                   {exp.role.jobrole_name}
//                 </p>
//                 <p className="text-sm mt-1">
//                   <span className="font-medium text-gray-800">
//                     Achievements:
//                   </span>{" "}
//                   {exp.achievements}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Qualification Section */}
//       {teacherqualifications?.length > 0 && (
//         <div className="mt-6">
//           <h3 className="text-sm font-semibold text-gray-700">
//             Qualifications:
//           </h3>
//           <ul className="mt-2 space-y-4">
//             {teacherqualifications.map((qual, index) => (
//               <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
//                 <p className="text-sm">
//                   <span className="font-medium text-gray-800">
//                     Qualification:
//                   </span>{" "}
//                   {qual.qualification.name}
//                 </p>
//                 <p className="text-sm mt-1">
//                   <span className="font-medium text-gray-800">
//                     Institution:
//                   </span>{" "}
//                   {qual.institution}
//                 </p>
//                 <p className="text-sm mt-1">
//                   <span className="font-medium text-gray-800">
//                     Year of Passing:
//                   </span>{" "}
//                   {qual.year_of_passing}
//                 </p>
//                 <p className="text-sm mt-1">
//                   <span className="font-medium text-gray-800">Grade:</span>{" "}
//                   {qual.grade_or_percentage}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeacherCard;