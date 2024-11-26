import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, updateAddress } from "./store/p";

const PersonalProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.personalProfile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    Object.keys(formData).forEach((field) => {
      if (field === "address") {
        Object.keys(formData.address).forEach((key) => {
          dispatch(updateAddress({ field: key, value: formData.address[key] }));
        });
      } else {
        dispatch(updateUserProfile({ field, value: formData[field] }));
      }
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <div className="flex items-center mb-4">
        <img
          src={profile.image || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="ml-4">
          <h2 className="text-xl font-bold">{profile.FullName || "Full Name"}</h2>
          <p className="text-gray-500">{profile.email || "Email not set"}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
      <div className="space-y-2">
        <p>
          <strong>Gender:</strong> {profile.gender || "Not set"}
        </p>
        <p>
          <strong>Religion:</strong> {profile.religion || "Not set"}
        </p>
        <p>
          <strong>Nationality:</strong> {profile.nationality || "Not set"}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone || "Not set"}
        </p>
        <p>
          <strong>Address:</strong> {profile.address.city || "City not set"}, {profile.address.state || "State not set"}
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <input
              type="text"
              name="FullName"
              placeholder="Full Name"
              value={formData.FullName}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.address.city}
              onChange={handleAddressChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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

export default PersonalProfile;
