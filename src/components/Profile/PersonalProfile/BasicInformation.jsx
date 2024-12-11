import React, { useState } from "react";

const AccountSettings = () => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [name, setName] = useState("ROYAL GAMERS");
  const [tempName, setTempName] = useState(name);

  const [email, setEmail] = useState("rahul@gmail.com");
  const [tempEmail, setTempEmail] = useState(email);

  const [contact, setContact] = useState("123-456-7890");
  const [tempContact, setTempContact] = useState(contact);

  const [address, setAddress] = useState("Current Address");
  const [tempAddress, setTempAddress] = useState(address);

  return (
    <div className="max-w-3xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700">
        Basic Information
      </h2>

      {/* Profile Photo Section */}
      <h1 className="text-md font-semibold text-gray-700 mb-2">
        Profile Photo
      </h1>
      <div className="flex items-center justify-between mb-4 pl-2">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img
            src="https://via.placeholder.com/64"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4">
          <button className="text-blue-700 text-md mr-3">Remove photo</button>
          <button className="text-gray-800 px-4 py-2 border border-1 border-gray-300 rounded-md text-sm">
            Change photo
          </button>
        </div>
      </div>
      <hr className="mb-4" />

      {/* Name Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Name</p>
        {!isEditingName ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{name}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingName(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setTempName(name);
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setName(tempName);
                setIsEditingName(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Email Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Email Address</p>
        {!isEditingEmail ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{email}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingEmail(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setTempEmail(email);
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setEmail(tempEmail);
                setIsEditingEmail(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Contact Number Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Contact Number</p>
        {!isEditingContact ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{contact}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingContact(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={tempContact}
              onChange={(e) => setTempContact(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                setTempContact(contact);
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setContact(tempContact);
                setIsEditingContact(false);
              }}
              className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />

      {/* Address Section */}
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Address</p>
        {!isEditingAddress ? (
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">{address}</p>
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingAddress(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <select
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Current Address">Current Address</option>
              <option value="Permanent Address">Permanent Address</option>
            </select>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setTempAddress(address);
                  setIsEditingAddress(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAddress(tempAddress);
                  setIsEditingAddress(false);
                }}
                className="px-4 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
