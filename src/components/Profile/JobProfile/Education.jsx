

// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { addEducation, updateEducation, removeEducation } from "../store/jobProfileSlice";
// import { FiEdit2 } from "react-icons/fi";

// const Education = () => {
//   const education = useSelector((state) => state); // Redux education state
//   const dispatch = useDispatch();

//   const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "" ,});
//   const [editingIndex, setEditingIndex] = useState(null); // Track index being edited
//   const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility

//   // Open modal and set data for editing (or reset for new entry)
//   const handleOpenModal = (index = null) => {
//     if (index !== null) {
//       setNewEducation(education[index]);
//       setEditingIndex(index);
//     } else {
      
//       setNewEducation({ degree: "", institution: "", year: "" });
//       setEditingIndex(null);
//     }
//     setIsModalOpen(true);
//   };

//   // Save education details
//   const handleSaveEducation = () => {
//     if (editingIndex !== null) {
//       dispatch(updateEducation({ index: editingIndex, data: newEducation }));
//     } else {
//       dispatch(addEducation(newEducation));
//     }
//     setIsModalOpen(false); // Close modal
//   };

//   // Remove an education entry
//   const handleRemoveEducation = (index) => {
//     dispatch(removeEducation(index));
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
//       {/* Header Section */}
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-semibold">Education</h3>
//         <button
//           onClick={() => handleOpenModal()} // Open modal for adding new education
//           className="text-blue-500 hover:underline text-sm flex items-center gap-1"
//         >
//           <FiEdit2 />
//           Add Education
//         </button>
//       </div>

//       {/* Education Cards */}
//       <div className="space-y-4">
//         {education.length > 0 ? (
//           education.map((edu, index) => (
//             <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
//               <p>
//                 <strong>Degree:</strong> {edu.degree}
//               </p>
//               <p>
//                 <strong>Institution:</strong> {edu.institution}
//               </p>
//               <p>
//                 <strong>Year:</strong> {edu.year}
//               </p>
//               <div className="mt-2 space-x-4">
//                 <button
//                   onClick={() => handleOpenModal(index)} // Open modal for editing
//                   className="text-blue-500 hover:underline"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleRemoveEducation(index)} // Remove education
//                   className="text-red-500 hover:underline"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500">No education added yet.</p>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
//             <h3 className="text-lg font-semibold mb-4">
//               {editingIndex !== null ? "Edit Education" : "Add Education"}
//             </h3>

//             {/* Input Fields */}
//             <div className="space-y-3">
//               <input
//                 type="text"
//                 value={newEducation.degree}
//                 onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
//                 placeholder="Degree"
//                 className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
//               />
//               <input
//                 type="text"
//                 value={newEducation.institution}
//                 onChange={(e) =>
//                   setNewEducation({ ...newEducation, institution: e.target.value })
//                 }
//                 placeholder="Institution"
//                 className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
//               />
//               <input
//                 type="text"
//                 value={newEducation.year}
//                 onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
//                 placeholder="Year of Completion"
//                 className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
//               />
//             </div>

//             {/* Modal Buttons */}
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={() => setIsModalOpen(false)} // Close modal
//                 className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveEducation} // Save or update education
//                 className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Education;


import React, { useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import Input from "../../Input";
import { updateEducationProfile } from "../../../services/jobProfileService";
import { fetchEducationProfile } from "../../../services/jobProfileService";
import { FiEdit2 } from "react-icons/fi"

const Education = () => {
    const education = useSelector((state) => state); // Redux education state
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
    
      dispatch((fetchEducationProfile));
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await updateEducationProfile(data);
      console.log(response)
      dispatch(postAddress(data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

    return (
    <div className="p-6">

      {/* header section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Education</h3>
        <button
          onClick={() => setIsModalOpen(true)} // Open modal for adding new education
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Add Education
        </button>
      </div>
      {/* Profile Section */}
      <div className="space-y-4">
        {education.length > 0 ? (
          education.map((add, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>Qualification:</strong> {add.city}
              </p>
              <p>
                <strong>Institution:</strong> {add.state}
              </p>
              <p>
                <strong>Year of passing:</strong> {add.state}
              </p>
              <p>
                <strong>Grade or percentage:</strong> {add.state}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)} // Open modal for editing
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                {/* <button
                  onClick={() => handleRemoveEducation(index)} // Remove education
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No Education added yet.</p>
        )}
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg h-[90%] p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold">Edit Education</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 mt-4">
              <Input label="Qualification" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Qualification" type="text" {...register("user_id", { required: true })} />
              <Input label="Institution" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Institution" type="text" {...register("address_type", { required: true })} />
              <Input label="Year of passinge" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Year of passing" type="text" {...register("state", { required: true })} />
              <Input label="Grade or percentage"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Grade or percentage" type="text" {...register("division")} />
              
              <div className="flex justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    );
  
};

export default Education;