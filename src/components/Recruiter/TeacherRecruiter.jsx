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
      <div className="">
        {error && <p className="text-white bg-red-600 p-2">{error}</p>}
        {teachers?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
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
                      {teacher.teacherskill
                        .map((skill) => skill.name)
                        .join(", ")}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No skills listed</p>
                  )}
                </div>
                {/* <div>
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
                </div> */}
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
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>No teachers found.</p>
        )}
      </div>
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