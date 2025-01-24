import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilteredTeachers } from "../../features/teacherSlice";

const TeacherFilter = () => {
  const [filters, setFilters] = useState({
    district: "",
    pincode: "",
    block: "",
    village: "",
    qualification: "",
    experience: "",
    skill: "",
  });

  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    dispatch(fetchFilteredTeachers({ ...filters, [name]: value }));
  };

  const handleClear = () => {
    setFilters({
      district: "",
      pincode: "",
      block: "",
      village: "",
      qualification: "",
      experience: "",
      skill: "",
    });
    dispatch(fetchFilteredTeachers({})); // Fetch all teachers
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 rounded shadow-md mt-16">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Teacher Filtration
      </h2>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4"
        onClick={handleClear}
      >
        Clear Filter
      </button>

      <div className="space-y-4">
        {Object.keys(filters).map((field) => (
          <div key={field}>
            <label className="block text-gray-600 text-sm capitalize">
              {field}:
            </label>
            <input
              type="text"
              name={field}
              value={filters[field]}
              onChange={handleInputChange}
              placeholder={`Enter ${field}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        ))}
      </div> */}

      <div className="">
        {loading && <p>Loading...</p>}
        {error && <p className="text-white bg-red-600 p-2">{error}</p>}
        {teachers?.length > 0 ? (
          <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <li
                key={teacher.id}
                className="p-4 bg-white border border-gray-200 rounded shadow space-y-2"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      teacher.profiles?.profile_picture ||
                      "https://via.placeholder.com/150"
                    }
                    alt={teacher.Fname}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold">
                      {teacher.Fname} {teacher.Lname}
                    </h3>
                    <p className="text-gray-500">{teacher.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Qualifications:</h4>
                  {teacher.teacherqualifications.length > 0 ? (
                    teacher.teacherqualifications.map((qual) => (
                      <p key={qual.id} className="text-sm text-gray-600">
                        {qual.qualification.name} - {qual.institution} (
                        {qual.year_of_passing})
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No qualifications</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Skills:</h4>
                  {teacher.teacherskill.length > 0 ? (
                    <p className="text-sm text-gray-600">
                      {teacher.teacherskill.map((skill) => skill.name).join(", ")}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No skills listed</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Experience:</h4>
                  {teacher.teacherexperiences.length > 0 ? (
                    teacher.teacherexperiences.map((exp) => (
                      <p key={exp.id} className="text-sm text-gray-600">
                        {exp.institution} - {exp.role.jobrole_name} (
                        {exp.start_date} to {exp.end_date})
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No experiences</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">Address:</h4>
                  {teacher.teachersaddress.length > 0 ? (
                    teacher.teachersaddress.map((address) => (
                      <p key={address.id} className="text-sm text-gray-600">
                        {address.village}, {address.block}, {address.district},{" "}
                        {address.state} - {address.pincode}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No address provided</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No teachers found.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherFilter;
