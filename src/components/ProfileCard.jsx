
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/jobProfileSlice";
import { FiEdit2 } from "react-icons/fi";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  //const [editDetails, setEditDetails] = useState(profile);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState(profile.profileImage);

    //setEditDetails(profile); // Sync with Redux state

  //   const initializeUser =()=>{
  //     const storeUser = localStorage.getItem({profile.username,profile.email})
  
  //   }
  //   useEffect(() => {
  //     initializeUser (dispatch);

  // }, [dispatch]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setEditDetails({ ...editDetails, [name]: value });
  // };

  const saveBasicDetails = () => {
    if (!editDetails.name || !editDetails.email || !editDetails.phone || !editDetails.address) {
      alert("Please fill in all fields.");
      return;
    }
    dispatch(updateProfile(editDetails)); // Update Redux state
    setEditModalOpen(false); // Close modal
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        dispatch(updateProfile({ ...editDetails, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateCompletion = () => {
    const totalFields = 5 + profile.skills.length + profile.experience.length + profile.education.length;
    const filledFields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.address,
      profile.profileImage,
      ...profile.skills,
      ...profile.experience,
      ...profile.education,
    ].filter(Boolean).length;

    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="relative w-24 h-24">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-green-500 pointer-events-none z-0"
              style={{ clipPath: `circle(${calculateCompletion()}% at 50% 50%)` }}
            ></div>
          </div>
          {/* Basic Details */}
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <button
                onClick={() => setEditModalOpen(true)}
                className="ml-4 text-blue-500 hover:underline flex items-center gap-1 text-sm"
              >
                <FiEdit2 /> Edit
              </button>
            </div>
            <p className="text-sm text-gray-500">{profile.address}</p>
            <p className="text-sm text-gray-500 mt-2">
              Profile Completion:{" "}
              <span className="font-semibold text-green-600">
                {calculateCompletion()}%
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <p>Name:{username|| YourName}</p>
                <p>Name:{email|| email}</p>
              </div>
              {["phone", "address"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={editDetails[field]}
                  onChange={handleInputChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              ))}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBasicDetails}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;

