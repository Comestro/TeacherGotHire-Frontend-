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

  const handleSaveExperience = () => {
    if (editingIndex !== null) {
      dispatch(updateExperience({ index: editingIndex, data: newExperience }));
    } else {
      dispatch(addExperience(newExperience));
    }
    setNewExperience({ title: "", company: "", duration: "" });
    setEditingIndex(null);
  };

  const handleEditExperience = (index) => {
    setEditingIndex(index);
    setNewExperience(experiences[index]);
  };

  const handleRemoveExperience = (index) => {
    dispatch(removeExperience(index));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Experience</h3>
      <div className="space-y-4">
        {experiences.length > 0 ? (
          experiences.map((exp, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <p><strong>Title:</strong> {exp.title}</p>
              <p><strong>Company:</strong> {exp.company}</p>
              <p><strong>Duration:</strong> {exp.duration}</p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleEditExperience(index)}
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
          <p>No experiences added yet.</p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <input
          type="text"
          value={newExperience.title}
          onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
          placeholder="Job Title"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          value={newExperience.company}
          onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
          placeholder="Company"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          value={newExperience.duration}
          onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
          placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          onClick={handleSaveExperience}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-2"
        >
          {editingIndex !== null ? "Update" : "Add"} Experience
        </button>
      </div>
    </div>
  );
};

export default Experience;

