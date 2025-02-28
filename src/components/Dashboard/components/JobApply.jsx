
// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { attemptsExam, postJobApply } from "../../../features/examQuesSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const JobApply = () => {
//   const dispatch = useDispatch();
//   const [notifiedSubjects, setNotifiedSubjects] = useState({}); // Tracks applied state per subject


  
//   useEffect(() => {
//     dispatch(attemptsExam());
//   }, [dispatch]);

//   const { attempts, jobApply} = useSelector((state) => state.examQues);

//   const passedOfflineAttempt = attempts?.filter(
//     (attempt) =>
//       attempt.isqualified &&
//       attempt.exam?.level_name === "2nd Level Offline" &&
//       attempt.exam?.level_id === 3
//   );
//   console.log("passedOfflineAttempt",passedOfflineAttempt)

//   const convertToArray = (value) => (Array.isArray(value) ? value : [value]);

//   const handleNotify = (subjectId, classCategoryId) => {
//     const subject = convertToArray(subjectId);
//     const class_category = convertToArray(classCategoryId);

//    const response =  dispatch(postJobApply({ subject, class_category }));

//     setNotifiedSubjects((prev) => ({
//       ...prev,
//       [`${subjectId}-${classCategoryId}`]: response.status,
//     }));
   
//     toast.success("You will be notify");
//   };

//   const handleCancel = (subjectId,classCategoryId) => {

//     const subject = convertToArray(subjectId);
//     const class_category = convertToArray(classCategoryId);

//    const response = dispatch(postJobApply({ subject, class_category }));
//     setNotifiedSubjects((prev) => ({
//       ...prev,
//       [`${subjectId}-${classCategoryId}`]: response.status,
//     }));
//     toast("You will not notify");
//   };

//   return (
//     <div className="p-6">
//       {passedOfflineAttempt && passedOfflineAttempt.length > 0 ? (
//         <>
//           <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
//             🎉 Congratulations! You are eligible for the Teacher Job Role.
//             Below are the subjects and their respective class categories.
//             Click on "Notify" to be visible to recruiters or "Cancel" if you do not want to notify.
//           </div>
//           <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="py-3 px-6 text-left font-semibold text-gray-700">Subject Name</th>
//                 <th className="py-3 px-6 text-left font-semibold text-gray-700">Class Category Name</th>
//                 <th className="py-3 px-6 text-left font-semibold text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {passedOfflineAttempt.map((attempt, index) => (
//                 <tr
//                   key={index}
//                   className={`${
//                     index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                   } hover:bg-gray-100 transition-colors`}
//                 >
//                   <td className="py-4 px-6 border-b border-gray-200">{attempt.exam.subjet_name}</td>
//                   <td className="py-4 px-6 border-b border-gray-200">
//                     {attempt.exam.class_category_name}
//                   </td>
//                   <td className="py-4 px-6 border-b border-gray-200">
//                     {notifiedSubjects[attempt.exam.subject_id] ? (
//                       <button
//                         className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//                         onClick={() => handleCancel(attempt.exam.subject_id,attempt.exam.class_category_id)}
//                       >
//                         Cancel
//                       </button>
//                     ) : (
//                       <button
//                         className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//                         onClick={() =>
//                           handleNotify(
//                             attempt.exam.subject_id,
//                             attempt.exam.class_category_id
//                           )
//                         }
//                       >
//                         Notify
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       ) : (
//         <div className="p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
//           ❌ Sorry, you are not eligible for the Teacher Job Role.
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobApply;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam, postJobApply } from "../../../features/examQuesSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobApply = () => {
  const dispatch = useDispatch();
  const { attempts } = useSelector((state) => state.examQues);
  const [appliedJobs, setAppliedJobs] = useState([]); // Tracks applied jobs as an array

  useEffect(() => {
    dispatch(attemptsExam());
  }, [dispatch]);

  const passedOfflineAttempt = attempts?.filter(
    (attempt) =>
      attempt.isqualified &&
      attempt.exam?.level_name === "2nd Level Offline" &&
      attempt.exam?.level_id === 3
  );

  const convertToArray = (value) => (Array.isArray(value) ? value : [value]);

  // Handle Notify Button Click
  const handleNotify = async (subjectId, classCategoryId) => {
    try {
      const subject = convertToArray(subjectId);
      const class_category = convertToArray(classCategoryId);

      const response = await dispatch(postJobApply({ subject, class_category })).unwrap();

      if (response.status) {
        setAppliedJobs((prev) => [...prev, { subjectId, classCategoryId }]); // Add to applied list
        toast.success("You will be notified.");
      }
    } catch (error) {
      console.error("Error notifying:", error);
    }
  };

  // Handle Cancel Button Click
  const handleCancel = async (subjectId, classCategoryId) => {
    try {
      const subject = convertToArray(subjectId);
      const class_category = convertToArray(classCategoryId);

      const response = await dispatch(postJobApply({ subject, class_category })).unwrap();

      if (!response.status) {
        setAppliedJobs((prev) =>
          prev.filter((job) => job.subjectId !== subjectId || job.classCategoryId !== classCategoryId)
        ); // Remove from applied list
        toast.info("You will not be notified.");
      }
    } catch (error) {
      console.error("Error canceling:", error);
    }
  };

  return (
    <div className="p-6">
      {passedOfflineAttempt && passedOfflineAttempt.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">
            🎉 <strong>Congratulations!</strong> You are eligible for the Teacher Job Role.
            Below are the subjects and their respective class categories.
            Click <strong>"Notify"</strong> to be visible to recruiters or <strong>"Cancel"</strong> if you do not want to notify.
          </div>
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Subject Name</th>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Class Category Name</th>
                <th className="py-3 px-6 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passedOfflineAttempt.map((attempt, index) => {
                const subjectId = attempt.exam.subject_id;
                const classCategoryId = attempt.exam.class_category_id;

                const isApplied = appliedJobs.some((job) => job.subjectId === subjectId && job.classCategoryId === classCategoryId);

                return (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-6 border-b border-gray-200">{attempt.exam.subjet_name}</td>
                    <td className="py-4 px-6 border-b border-gray-200">{attempt.exam.class_category_name}</td>
                    <td className="py-4 px-6 border-b border-gray-200">
                      {isApplied ? (
                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          onClick={() => handleCancel(subjectId, classCategoryId)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          onClick={() => handleNotify(subjectId, classCategoryId)}
                        >
                          Notify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">
          ❌ <strong>Sorry!</strong> You are not eligible for the Teacher Job Role.
        </div>
      )}
    </div>
  );
};

export default JobApply;
