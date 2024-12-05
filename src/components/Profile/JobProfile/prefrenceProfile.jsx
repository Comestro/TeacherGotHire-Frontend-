import React, { useState } from "react";

function AddSubjectDetails() {
  const [formData, setFormData] = useState({
    subject: "",
    role: "",
    expectedSalary: "",
    preferenceLocation: {
      state: "",
      district: "",
      division: "",
      subDivision: "",
      blockArea: "",
      pincode: "",
    },
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For nested location fields
    if (name in formData.preferenceLocation) {
      setFormData((prevData) => ({
        ...prevData,
        preferenceLocation: {
          ...prevData.preferenceLocation,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Add API call here to save form data
    setIsPopupOpen(false); // Close the popup after submission
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Add Subject Details</h2>

      {/* Display Data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Subject Details</h3>
        <p><strong>Subject:</strong> {formData.subject || "N/A"}</p>
        <p><strong>Role:</strong> {formData.role || "N/A"}</p>
        <p><strong>Expected Salary:</strong> {formData.expectedSalary || "N/A"}</p>
        <p><strong>Location:</strong> {`${formData.preferenceLocation.state || "N/A"}, ${formData.preferenceLocation.district || "N/A"}, ${formData.preferenceLocation.pincode || "N/A"}`}</p>

        <button
          onClick={() => setIsPopupOpen(true)}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition"
        >
          Edit Details
        </button>
      </div>

      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Subject Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-gray-700 font-semibold mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Subject"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-gray-700 font-semibold mb-1">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Role"
                />
              </div>

              {/* Expected Salary */}
              <div>
                <label htmlFor="expectedSalary" className="block text-gray-700 font-semibold mb-1">
                  Expected Salary
                </label>
                <input
                  type="number"
                  id="expectedSalary"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Expected Salary"
                />
              </div>

              {/* Preference Location */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Preferred Location</h4>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-gray-700 font-semibold mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.preferenceLocation.state}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter State"
                  />
                </div>

                {/* District */}
                <div>
                  <label htmlFor="district" className="block text-gray-700 font-semibold mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.preferenceLocation.district}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter District"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-gray-700 font-semibold mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.preferenceLocation.pincode}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddSubjectDetails;
