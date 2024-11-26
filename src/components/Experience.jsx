// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { addExperience, updateExperience } from "../store/profileSlice";

// const Experience = () => {
//   const experiences = useSelector((state) => state.profile.experience);
//   const dispatch = useDispatch();
//   const [newExperience, setNewExperience] = useState({ title: "", company: "", duration: "" });
//   const [editingIndex, setEditingIndex] = useState(null);

//   const handleSaveExperience = () => {
//     if (editingIndex !== null) {
//       dispatch(updateExperience({ index: editingIndex, data: newExperience }));
//     } else {
//       dispatch(addExperience(newExperience));
//     }
//     setNewExperience({ title: "", company: "", duration: "" });
//     setEditingIndex(null);
//   };

//   const handleEditExperience = (index) => {
//     setEditingIndex(index);
//     setNewExperience(experiences[index]);
//   };

//   return (
//     <div className="mb-6">
//       <h3 className="text-lg font-semibold mb-4">Experience</h3>
//       <div className="space-y-4">
//         {experiences.length > 0 ? (
//           experiences.map((exp, index) => (
//             <div key={index} className="border p-4 rounded-lg">
//               <p><strong>Title:</strong> {exp.title}</p>
//               <p><strong>Company:</strong> {exp.company}</p>
//               <p><strong>Duration:</strong> {exp.duration}</p>
//               <button
//                 onClick={() => handleEditExperience(index)}
//                 className="text-blue-500 hover:underline mt-2"
//               >
//                 Edit
//               </button>
//             </div>
//           ))
//         ) : (
//           <p>No experiences added yet.</p>
//         )}
//       </div>
//       <div className="mt-4 space-y-2">
//         <input
//           type="text"
//           value={newExperience.title}
//           onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
//           placeholder="Job Title"
//           className="w-full border px-3 py-2 rounded-lg"
//         />
//         <input
//           type="text"
//           value={newExperience.company}
//           onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
//           placeholder="Company"
//           className="w-full border px-3 py-2 rounded-lg"
//         />
//         <input
//           type="text"
//           value={newExperience.duration}
//           onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
//           placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
//           className="w-full border px-3 py-2 rounded-lg"
//         />
//         <button
//           onClick={handleSaveExperience}
//           className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-2"
//         >
//           {editingIndex !== null ? "Update" : "Add"} Experience
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Experience;

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addExperience, updateExperience, removeExperience } from "../store/profileSlice";

const Experience = () => {
  const experiences = useSelector((state) => state.profile.experience);
  const dispatch = useDispatch();

  const [newExperience, setNewExperience] = useState({ title: "", company: "", duration: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setNewExperience(experiences[index]);
      setEditingIndex(index);
    } else {
      setNewExperience({ title: "", company: "", duration: "" });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleSaveExperience = () => {
    if (editingIndex !== null) {
      dispatch(updateExperience({ index: editingIndex, data: newExperience }));
    } else {
      dispatch(addExperience(newExperience));
    }
    setNewExperience({ title: "", company: "", duration: "" });
    setEditingIndex(null);
    setIsModalOpen(false);
  };

  const handleRemoveExperience = (index) => {
    dispatch(removeExperience(index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Experience</h3>
        <button
          onClick={() => handleOpenModal()}
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          Add Experience
        </button>
      </div>

      {/* Experience Cards */}
      <div className="space-y-4">
        {experiences.length > 0 ? (
          experiences.map((exp, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>Title:</strong> {exp.title}
              </p>
              <p>
                <strong>Company:</strong> {exp.company}
              </p>
              <p>
                <strong>Duration:</strong> {exp.duration}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No experiences added yet.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? "Edit Experience" : "Add Experience"}
            </h3>

            {/* Input Fields */}
            <div className="space-y-3">
              <input
                type="text"
                value={newExperience.title}
                onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                placeholder="Job Title"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, company: e.target.value })
                }
                placeholder="Company"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
              <input
                type="text"
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExperience} // Save or update experience
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;
