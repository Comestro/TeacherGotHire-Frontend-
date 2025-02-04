import React, { useEffect, useState } from "react";
import { fetchTeachers } from "../../services/teacherFilterService";
import Loader from "./components/Loader";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchTeachers({});

        setTimeout(() => {
          setTeachers(data);
          setLoading(false);
        }, 2000);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // if (teachers.length > 0) {
  //   console.log("Teachers data ", teachers);
  // }

  if (loading)
    return (
      <div className="w-full h-full flex justify-center items-center mt-16 ">
        <div className="h-fit mt-20">
          <Loader />
        </div>
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 rounded shadow-md">
      {error && <p className="text-white bg-red-600 p-2">{error}</p>}
      {teachers?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Teacher Profile Section */}
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={
                    teacher.profiles?.profile_picture ||
                    "https://via.placeholder.com/150"
                  }
                  alt={teacher.Fname}
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {teacher.Fname} {teacher.Lname}
                  </h3>
                  <p className="text-gray-500 text-sm">{teacher.email}</p>
                </div>
              </div>

              {/* Qualifications Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Qualifications:
                </h4>
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

              {/* Skills Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Skills:</h4>
                {teacher.teacherskill.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teacher.teacherskill.map((skill) => (
                      <span
                        key={skill.skill.id}
                        className="bg-teal-100 text-teal-800 text-sm px-2 py-1 rounded-full"
                      >
                        {skill.skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No skills listed</p>
                )}
              </div>

              {/* Experience Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Experience:
                </h4>
                {teacher.teacherexperiences.length > 0 ? (
                  teacher.teacherexperiences.map((exp, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{exp.achievements}</span>{" "}
                        ({exp.start_date} to {exp.end_date})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No experiences</p>
                )}
              </div>

              {/* Address Section */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Address:</h4>
                {teacher.teachersaddress.length > 0 ? (
                  teacher.teachersaddress.map((address) => (
                    <p key={address.id} className="text-sm text-gray-600">
                      {address.area}, {address.district}, {address.state} -{" "}
                      {address.pincode}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No address provided</p>
                )}
              </div>

              {/* Preferences Section */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Preferences:
                </h4>
                {teacher.preferences.length > 0 ? (
                  teacher.preferences.map((pref, index) => (
                    <div key={index} className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium text-gray-600">
                          Job Roles:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {pref.job_role.map((role) => (
                            <span
                              key={role.id}
                              className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full"
                            >
                              {role.jobrole_name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-600">
                          Class Categories:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {pref.class_category.map((category) => (
                            <span
                              key={category.id}
                              className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-600">
                          Preferred Subjects:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {pref.prefered_subject.map((subject) => (
                            <span
                              key={subject.id}
                              className="bg-pink-100 text-pink-800 text-sm px-2 py-1 rounded-full"
                            >
                              {subject.subject_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No preferences</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-gray-600">No teachers found.</p>
      )}
    </div>
  );
};

export default TeacherFilter;
// import React, { useEffect, useState } from "react";
// import { fetchTeachers } from "../../services/teacherFilterService";
// import Loader from "./components/Loader";

// const TeacherFilter = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1); // Current page
//   const [totalPages, setTotalPages] = useState(1); // Total pages returned from API
//   const [filters, setFilters] = useState({}); // Filters received from Sidebar

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchTeachers(filters, page, 10); // Fetch teachers with pagination
//         setTeachers(data.teachers); // Assuming API returns { teachers: [], totalPages: N }
//         setTotalPages(data.totalPages);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [filters, page]);

//   const handlePageChange = (newPage) => {
//     setPage(newPage);
//   };

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//     setPage(1); // Reset to first page on filter change
//   };

//   if (loading)
//     return (
//       <div className="w-full h-full flex justify-center items-center mt-16 ">
//         <div className="h-fit mt-20">
//           <Loader />
//         </div>
//       </div>
//     );
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="w-full min-h-screen bg-gray-100 p-4 rounded shadow-md">
//       <div className="">
//         {error && <p className="text-white bg-red-600 p-2">{error}</p>}
//         {teachers?.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {teachers.map((teacher) => (
//                 <TeacherCard key={teacher.id} teacher={teacher} />
//               ))}
//             </div>
//             {/* Pagination Controls */}
//             <div className="flex justify-center mt-6">
//               <button
//                 onClick={() => handlePageChange(page - 1)}
//                 disabled={page <= 1}
//                 className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <span className="px-4 py-2 mx-1">
//                 Page {page} of {totalPages}
//               </span>
//               <button
//                 onClick={() => handlePageChange(page + 1)}
//                 disabled={page >= totalPages}
//                 className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </>
//         ) : (
//           !loading && <p>No teachers found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherFilter;