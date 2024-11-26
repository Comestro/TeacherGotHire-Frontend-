import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAddress } from '../../store/profileSlice';
import { FiEdit2 } from 'react-icons/fi';

const YourProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.yourProfile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState(profile?.address || {});

  const handleOpenModal = () => {
    setAddress(profile?.address || {});
    setIsModalOpen(true);
  };

  const handleSaveAddress = () => {
    dispatch(updateAddress(address));
    setIsModalOpen(false);
    alert('Address updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <button
          onClick={handleOpenModal}
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Edit Address
        </button>
      </div>

      <div className="border p-4 rounded-lg shadow-sm bg-gray-100">
        <h3 className="text-lg font-semibold mb-2">Address</h3>
        {Object.entries(profile?.address || {}).map(([key, value]) => (
          <p key={key}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
            {value || 'Not set'}
          </p>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Address</h3>
            <div className="space-y-3">
              {['street', 'city', 'state', 'pincode', 'country'].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={address[field] || ''}
                  onChange={(e) =>
                    setAddress({ ...address, [field]: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg focus:outline-blue-500"
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
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

export default YourProfile;
