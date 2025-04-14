import React, { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
// import {
//   FiClock,
//   FiInfo,
//   FiCalendar,
//   FiCheckCircle,
//   FiBook,
//   FiUserCheck,
//   FiVideo,
//   FiMapPin,
// } from "react-icons/fi";
import { getInterview, postInterview } from "../../../features/examQuesSlice";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

const InterviewCard = () => {
  // Format date function

  const dispatch = useDispatch();
  const { interview, attempts } = useSelector((state) => state.examQues);

  const filteredExams = attempts.filter(
    (item) => item.exam.level_code === 2 && item.isqualified === true
  );
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  console.log("f", filteredExams);
  console.log("selectedExam", selectedExam);
  // To extract just the exam names:
  const qualifiedExamNames = filteredExams?.map((item) => item.exam.name);
  console.log("qualifiedExamNames", qualifiedExamNames);
  useEffect(() => {
    dispatch(getInterview());
    // dispatch(postInterview());
  }, [dispatch]);
  console.log("interview", interview);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedExamData = filteredExams?.find(item => 
        item.exam.name === selectedExam && 
        item.isqualified
      );
      console.log("selectedExamData",selectedExamData)
      if (!selectedExamData) {
        throw new Error("Selected exam data not found");
      }
  
      const payload = {
        subject: selectedExamData.exam.subject_id,
        class_category: selectedExamData.exam.class_category_id,
        level: selectedExamData.exam.level_code,
        time: selectedDateTime,
        exam_id: selectedExamData.exam.id // optional
      };
  
      const result = await dispatch(postInterview(payload)).unwrap();
      console.log("Interview scheduled:", result);
    } catch (error) {
      console.error("Failed to schedule interview:", error);

      // Handle specific error cases
      if (error.message.includes("time slot")) {
        alert(
          "This time slot is no longer available. Please choose another time."
        );
      } else if (error.message.includes("conflict")) {
        alert("You already have an interview scheduled at this time.");
      } else {
        alert("Failed to schedule interview. Please try again.");
      }
    }
  };
  const formatDate = (dateString) => {
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    // <motion.div
    //   initial={{ opacity: 0, y: 10 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.4, delay: 0.1 }}
    //   className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    // >
    //   {qualifiedExamNames && (
    //     <form onSubmit={handleSubmit} className="p-6">
    //       <div className="flex items-center justify-between mb-6">
    //       <div className="text-center mb-6">
    //     <h2 className="text-2xl font-bold text-gray-800">Congratulations! 🎉</h2>
    //     <p className="text-gray-600 mt-2">
    //       You've qualified in these subjects and are eligible for interview.
    //     </p>
    //   </div>

    //   <div className="space-y-4">
    //     {qualifiedExamNames.map((exam, index) => (
    //       <div 
    //         key={index}
    //         className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
    //           selectedExam === exam 
    //             ? 'border-blue-500 bg-blue-50' 
    //             : 'border-gray-200 hover:border-blue-300'
    //         }`}
    //         onClick={() => setSelectedExam(exam)}
    //       >
    //         <div className="flex items-center">
    //           <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
    //             selectedExam === exam 
    //               ? 'bg-blue-500 border-blue-500' 
    //               : 'border-gray-300'
    //           }`}>
    //             {selectedExam === exam && (
    //               <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    //                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    //               </svg>
    //             )}
    //           </div>
    //           <span className="font-medium text-gray-800">{exam}</span>
    //         </div>
    //       </div>
    //     ))}
    //   </div>

    //   <button
    //     disabled={!selectedExam}
    //     className={`mt-6 w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
    //       selectedExam 
    //         ? 'bg-blue-600 hover:bg-blue-700' 
    //         : 'bg-gray-400 cursor-not-allowed'
    //     }`}
    //     onClick={() => alert(`Initiating interview for: ${selectedExam}`)}
    //   >
    //     {selectedExam ? 'Start Interview' : 'Please select a subject'}
    //   </button>
    //         <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="h-4 w-4 mr-2"
    //             viewBox="0 0 20 20"
    //             fill="currentColor"
    //           >
    //             <path
    //               fillRule="evenodd"
    //               d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //           Schedule Interview
    //         </span>
    //         <span className="text-sm text-gray-500">Select Date & Time</span>
    //       </div>

    //       <h4 className="text-xl font-semibold text-gray-800 mb-5">
    //         Choose a Date and Time for Your Interview{" "}
    //         {/* {interviewEligible?.interview?.level?.name} */}
    //       </h4>

    //       <div className="space-y-5">
    //         <div>
    //           <label
    //             htmlFor="datetime"
    //             className="block text-sm font-medium text-gray-700 mb-2"
    //           >
    //             Date and Time
    //           </label>
    //           <div className="relative">
    //             <Flatpickr
    //               options={{
    //                 enableTime: true,
    //                 dateFormat: "Y-m-d H:i:S",
    //                 time_24hr: true,
    //                 minDate: "today",
    //               }}
    //               value={selectedDateTime}
    //               onChange={([date]) => {
    //                 const formatted = date
    //                   .toISOString()
    //                   .replace("T", " ")
    //                   .replace(/\.\d+Z/, "");
    //                 setSelectedDateTime(formatted);
    //               }}
    //               className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    //             />
    //             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
    //               <svg
    //                 className="h-5 w-5 text-gray-400"
    //                 fill="currentColor"
    //                 viewBox="0 0 20 20"
    //               >
    //                 <path
    //                   fillRule="evenodd"
    //                   d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
    //                   clipRule="evenodd"
    //                 />
    //               </svg>
    //             </div>
    //           </div>
    //         </div>

    //         <button
    //           type="submit"
    //           className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //         >
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="h-5 w-5 mr-2"
    //             viewBox="0 0 20 20"
    //             fill="currentColor"
    //           >
    //             <path
    //               fillRule="evenodd"
    //               d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //           Submit Request
    //         </button>
    //       </div>
    //     </form>
    //   )}
    //   <div className="p-6">
    //     {interview?.map((item) => (
    //       <div key={item.id} className="space-y-4">
    //         {item.status === "requested" ? (
    //           // Pending Request Card
    //           <motion.div
    //             initial={{ opacity: 0, x: -5 }}
    //             animate={{ opacity: 1, x: 0 }}
    //             className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100"
    //           >
    //             {/* Status Badge */}
    //             <div className="absolute top-0 right-0">
    //               <div className="bg-amber-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
    //                 PENDING
    //               </div>
    //             </div>

    //             <div className="p-5 pt-6">
    //               <div className="flex items-start gap-4">
    //                 <div className="bg-amber-100 p-3 rounded-full text-amber-600">
    //                   <FiClock size={24} />
    //                 </div>
    //                 <div className="flex-1">
    //                   <h4 className="text-base font-semibold text-gray-800 mb-1">
    //                     Interview Request Submitted
    //                   </h4>
    //                   <p className="text-sm text-gray-600 mb-3">
    //                     Your interview request is currently awaiting
    //                     administrator approval.
    //                   </p>

    //                   <div className="space-y-2">
    //                     <div className="flex items-center text-sm">
    //                       <FiCalendar className="mr-2 text-amber-500 flex-shrink-0" />
    //                       <span className="text-gray-700">
    //                         Requested for{" "}
    //                         <span className="font-medium">
    //                           {formatDate(item.time)}
    //                         </span>
    //                       </span>
    //                     </div>

    //                     {item.subject && (
    //                       <div className="flex items-center text-sm">
    //                         <FiBook className="mr-2 text-amber-500 flex-shrink-0" />
    //                         <span className="text-gray-700">
    //                           Subject:{" "}
    //                           <span className="font-medium">
    //                             {item.subject.subject_name || "N/A"}
    //                           </span>
    //                         </span>
    //                       </div>
    //                     )}

    //                     {item.class_category && (
    //                       <div className="flex items-center text-sm">
    //                         <FiUserCheck className="mr-2 text-amber-500 flex-shrink-0" />
    //                         <span className="text-gray-700">
    //                           Class Category:{" "}
    //                           <span className="font-medium">
    //                             {item.class_category.name || "N/A"}
    //                           </span>
    //                         </span>
    //                       </div>
    //                     )}
    //                   </div>

    //                   <div className="mt-4 bg-white/50 p-3 rounded-lg border border-amber-200">
    //                     <div className="flex items-start">
    //                       <FiInfo className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
    //                       <p className="text-xs text-amber-700">
    //                         You will receive a notification once your interview
    //                         request is approved by the administrator.
    //                       </p>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </motion.div>
    //         ) : (
    //           // Approved Interview Card
    //           <motion.div
    //             initial={{ opacity: 0, x: -5 }}
    //             animate={{ opacity: 1, x: 0 }}
    //             className="relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100"
    //           >
    //             {/* Status Badge */}
    //             <div className="absolute top-0 right-0">
    //               <div className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
    //                 APPROVED
    //               </div>
    //             </div>

    //             <div className="p-5 pt-6">
    //               <div className="flex items-start gap-4">
    //                 <div className="bg-green-100 p-3 rounded-full text-green-600">
    //                   <FiCheckCircle size={24} />
    //                 </div>
    //                 <div className="flex-1">
    //                   <h4 className="text-base font-semibold text-gray-800 mb-1">
    //                     Interview Scheduled
    //                   </h4>
    //                   <p className="text-sm text-gray-600 mb-3">
    //                     Your interview has been approved and scheduled.
    //                   </p>

    //                   <div className="space-y-2">
    //                     <div className="flex items-center text-sm">
    //                       <FiCalendar className="mr-2 text-green-500 flex-shrink-0" />
    //                       <span className="text-gray-700">
    //                         Scheduled for{" "}
    //                         <span className="font-medium">
    //                           {formatDate(item.time)}
    //                         </span>
    //                       </span>
    //                     </div>

    //                     {item.subject && (
    //                       <div className="flex items-center text-sm">
    //                         <FiBook className="mr-2 text-green-500 flex-shrink-0" />
    //                         <span className="text-gray-700">
    //                           Subject:{" "}
    //                           <span className="font-medium">
    //                             {item.subject.subject_name || "N/A"}
    //                           </span>
    //                         </span>
    //                       </div>
    //                     )}

    //                     {item.class_category && (
    //                       <div className="flex items-center text-sm">
    //                         <FiUserCheck className="mr-2 text-green-500 flex-shrink-0" />
    //                         <span className="text-gray-700">
    //                           Class Category:{" "}
    //                           <span className="font-medium">
    //                             {item.class_category.name || "N/A"}
    //                           </span>
    //                         </span>
    //                       </div>
    //                     )}

    //                     {item.location && (
    //                       <div className="flex items-center text-sm">
    //                         <FiMapPin className="mr-2 text-green-500 flex-shrink-0" />
    //                         <span className="text-gray-700">
    //                           Location:{" "}
    //                           <span className="font-medium">
    //                             {item.location}
    //                           </span>
    //                         </span>
    //                       </div>
    //                     )}
    //                   </div>

    //                   {item.link && (
    //                     <a
    //                       href={item.link}
    //                       target="_blank"
    //                       rel="noopener noreferrer"
    //                       className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
    //                     >
    //                       <FiVideo className="mr-2" />
    //                       Join Interview Now
    //                     </a>
    //                   )}

    //                   {!item.link && (
    //                     <div className="mt-4 bg-white/50 p-3 rounded-lg border border-green-200">
    //                       <div className="flex items-start">
    //                         <FiInfo className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
    //                         <p className="text-xs text-green-700">
    //                           The interview link will be available 15 minutes
    //                           before the scheduled time.
    //                         </p>
    //                       </div>
    //                     </div>
    //                   )}
    //                 </div>
    //               </div>
    //             </div>
    //           </motion.div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
    // </motion.div>
    <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
>
  {qualifiedExamNames.length>0 && (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations! 🎉</h2>
        <p className="text-gray-600">
          You've qualified for interviews in these subjects:
        </p>
      </div>

      {/* Subject Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Select a Subject</h3>
        <div className="grid gap-3">
          {qualifiedExamNames.map((exam, index) => (
            <div 
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedExam === exam 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedExam(exam)}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border mr-3 flex-shrink-0 flex items-center justify-center ${
                  selectedExam === exam 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedExam === exam && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-800">{exam}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Section */}
      {selectedExam && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Schedule Your Interview</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-700">
                  Please select a date and time for your <span className="font-medium">{selectedExam.split(',')[1].trim()}</span> interview.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date & Time
                </label>
                <div className="relative">
                  <Flatpickr
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i:S",
                      time_24hr: true,
                      minDate: "today",
                    }}
                    value={selectedDateTime}
                    onChange={([date]) => {
                      const formatted = date
                        .toISOString()
                        .replace("T", " ")
                        .replace(/\.\d+Z/, "");
                      setSelectedDateTime(formatted);
                    }}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Schedule Interview
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Interview Status Cards */}
      <div className="mt-8 space-y-4">
        {interview?.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 border ${
              item.status === "requested"
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-4 ${
                item.status === "requested"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-green-100 text-green-600"
              }`}>
                {item.status === "requested" ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800">
                    {item.status === "requested" ? "Pending Approval" : "Interview Scheduled"}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "requested"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {item.status === "requested" ? "PENDING" : "APPROVED"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {item.status === "requested"
                    ? "Your interview request is awaiting approval"
                    : "Your interview has been scheduled"}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(item.time)}</span>
                  </div>
                  {item.subject && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{item.subject.subject_name}</span>
                    </div>
                  )}
                </div>

                {item.status !== "requested" && item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Interview
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )}
</motion.div>
  );
};

export default InterviewCard;
