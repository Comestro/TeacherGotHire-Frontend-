
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { CiCalendar, CiLocationOn, CiMail, CiPhone } from "react-icons/ci";
// import { FaLocationDot, FaMobileScreenButton } from "react-icons/fa6";
// import { GoPencil } from "react-icons/go";
// import { LuShoppingBag } from "react-icons/lu";
// import { getProfile } from "../../../features/personalProfileSlice";
// import { updatePersonalProfile } from "../../../services/profileServices";
// import Input from "../../Input";

// const PersonalProfileCard = () => {
//   const dispatch = useDispatch();
//   const profile = useSelector((state) => state.personalProfile.profileData);
//   const { register, handleSubmit, setValue, formState: { errors } } = useForm();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     dispatch(getProfile());
//   }, [dispatch]);

//   const onSubmit = async (data) => {
//     try {
//       await updatePersonalProfile(data);
//       dispatch(getProfile()); // Refresh profile data after updating
//       setIsModalOpen(false);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg shadow-md">
//       {/* Profile Card */}
//       {profile.map((item) => (
//         <div
//           key={item.id}
//           className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-6 gap-6"
//         >
//           {/* Profile Image */}
//           <div className="flex items-center justify-center">
//             <img
//               src={item.image || "https://via.placeholder.com/150"}
//               alt="Profile"
//               className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-gray-300 shadow"
//             />
//           </div>

//           {/* Profile Info */}
//           <div className="flex-1">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {item.fullname || "Full Name"}
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <GoPencil className="w-6 h-6" />
//               </button>
//             </div>
//             <p className="text-sm text-gray-400">
//               Last updated: <span className="text-gray-600">09 Nov 2024</span>
//             </p>

//             <hr className="my-4 border-t-2 border-gray-200" />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <CiLocationOn className="w-5 h-5" />
//                   {item.address?.city || "City not set"}
//                 </p>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <LuShoppingBag className="w-5 h-5" />
//                   New Joining
//                 </p>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <CiCalendar className="w-5 h-5" />
//                   Available in 15 days
//                 </p>
//               </div>
//               <div>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <CiPhone className="w-5 h-5" />
//                   {item.phone || "Not set"}
//                 </p>
//                 <p className="flex items-center gap-2 text-sm text-gray-500">
//                   <CiMail className="w-5 h-5" />
//                   {item.email || "Email not set"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Action Section */}
//           <div className="bg-teal-50 rounded-lg p-4 flex flex-col gap-3">
//             <button className="flex items-center gap-2 text-teal-700 font-medium">
//               <FaMobileScreenButton className="w-5 h-5" />
//               Verify Mobile
//             </button>
//             <button className="flex items-center gap-2 text-teal-700 font-medium">
//               <FaLocationDot className="w-5 h-5" />
//               Add Location
//             </button>
//             <button className="mt-auto bg-teal-600 text-white py-2 px-4 rounded-full shadow">
//               Add Missing Details
//             </button>
//           </div>
//         </div>
//       ))}

//       {/* Modal for Editing */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-bold">Edit Profile</h3>
//               <button onClick={() => setIsModalOpen(false)}>&times;</button>
//             </div>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <Input
//                 label="Full Name"
//                 placeholder="Enter your full name"
//                 type="text"
//                 {...register("fullname", { required: "Full name is required" })}
//               />
//               <Input
//                 label="Email"
//                 placeholder="Enter your email"
//                 type="email"
//                 {...register("email", { required: "Email is required" })}
//               />
//               <Input
//                 label="Phone"
//                 placeholder="Enter your phone number"
//                 type="tel"
//                 {...register("phone", { required: "Phone is required" })}
//               />
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               >
//                 Save
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PersonalProfileCard;


