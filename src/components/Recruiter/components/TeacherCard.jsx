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
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-gray-800">
            {Fname} {Lname}
          </h2>
          <p className="text-sm text-gray-500">Email: {email}</p>
        </div>
      </div>

      {/* Address Section */}
      {currentAddress && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700">Address:</h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentAddress.village}, {currentAddress.block},{" "}
            {currentAddress.district}, {currentAddress.state} -{" "}
            {currentAddress.pincode}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {teacherexperiences?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700">Experience:</h3>
          <ul className="mt-2 space-y-4">
            {teacherexperiences.map((exp, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
                <p className="text-sm">
                  <span className="font-medium text-gray-800">
                    Institution:
                  </span>{" "}
                  {exp.institution}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium text-gray-800">Role:</span>{" "}
                  {exp.role.jobrole_name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium text-gray-800">
                    Achievements:
                  </span>{" "}
                  {exp.achievements}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Qualification Section */}
      {teacherqualifications?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700">
            Qualifications:
          </h3>
          <ul className="mt-2 space-y-4">
            {teacherqualifications.map((qual, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
                <p className="text-sm">
                  <span className="font-medium text-gray-800">
                    Qualification:
                  </span>{" "}
                  {qual.qualification.name}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium text-gray-800">
                    Institution:
                  </span>{" "}
                  {qual.institution}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium text-gray-800">
                    Year of Passing:
                  </span>{" "}
                  {qual.year_of_passing}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium text-gray-800">Grade:</span>{" "}
                  {qual.grade_or_percentage}
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
