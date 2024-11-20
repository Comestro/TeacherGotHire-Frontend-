
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, uploadImage } from "../../store/profileSlice";
import Skills from "../skill";
import Experience from "../Experience";
import Education from "../Education";

const ProfilePage = () => {
  const profile = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const [basicDetails, setBasicDetails] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
  });
  const [imagePreview, setImagePreview] = useState(profile.profileImage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails({ ...basicDetails, [name]: value });
  };

  const saveBasicDetails = () => {
    dispatch(updateProfile(basicDetails));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        dispatch(uploadImage(reader.result));
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
    <div className="flex items-center gap-6 mb-8">
      {/* Profile Image Section */}
      <div className="relative w-32 h-32">
        <div className="absolute inset-0">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
          )}
        </div>
        <input
          type="file"
          onChange={handleImageChange}
          className="absolute inset-0 w-32 h-32 opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-blue-500 pointer-events-none z-0"
          style={{
            clipPath: `circle(${calculateCompletion()}% at 50% 50%)`,
          }}
        ></div>
      </div>
  
      {/* Profile Details Section */}
      <div>
        <h2 className="text-2xl font-bold">{basicDetails.name || "Your Name"}</h2>
        <p className="text-gray-600">{basicDetails.email || "Your Email"}</p>
        <p className="text-gray-600">{basicDetails.phone || "Your Phone"}</p>
        <p className="text-gray-600 mt-2">
          Profile Completion: <span className="font-semibold">{calculateCompletion()}%</span>
        </p>
      </div>
    </div>
  
    {/* Basic Details Form */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold">Edit Basic Details</h3>
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          value={basicDetails.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="email"
          name="email"
          value={basicDetails.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="tel"
          name="phone"
          value={basicDetails.phone}
          onChange={handleInputChange}
          placeholder="Phone"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          name="address"
          value={basicDetails.address}
          onChange={handleInputChange}
          placeholder="Address"
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          onClick={saveBasicDetails}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-4"
        >
          Save
        </button>
      </div>
    </div>
  
    {/* Other Sections */}
    <Skills />
    <Experience />
    <Education />
  </div>
  
  );
};

export default ProfilePage;

