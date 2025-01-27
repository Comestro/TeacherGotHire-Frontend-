

import React, { useState, useEffect } from "react";
import { getAllCenterUser } from "../../features/examQuesSlice";
import { useDispatch, useSelector } from "react-redux";

const ExamCenterDashboard = () => { 
   
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(getAllCenterUser());
  },[]);
  
  const {centerUser} = useSelector((state)=> state?.examQues);

  console.log("centerUser",centerUser);
  
  const [users, setUsers] = useState(
  // { id: 1, code: "U123", status: true, created_at: "2025-01-20", exam_id: 101, center_id: "C001" },
  // { id: 2, code: "U124", status: false, created_at: "2025-01-22", exam_id: 102, center_id: "C002" },
  // { id: 3, code: "U125", status: true, created_at: "2025-01-23", exam_id: 103, center_id: "C003" },
  // { id: 4, code: "U126", status: false, created_at: "2025-01-24", exam_id: 104, center_id: "C004" },
  // { id: 5, code: "U127", status: true, created_at: "2025-01-25", exam_id: 105, center_id: "C005" },
  centerUser
);
console.log("users",users);

// Filters
const [statusFilter, setStatusFilter] = useState(""); // "true", "false", or ""
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// Popup state
const [selectedUser, setSelectedUser] = useState(null);

// Filtered user list
const filteredUsers = users.filter((user) => {
  const matchesStatus = statusFilter === "" || user.status.toString() === statusFilter;
  const matchesDate =
    (!startDate || new Date(user.created_at) >= new Date(startDate)) &&
    (!endDate || new Date(user.created_at) <= new Date(endDate));
  return matchesStatus && matchesDate;
});

// Handle user click
const handleUserClick = (user) => {
  setSelectedUser(user);
};

// Handle status change
const handleStatusChange = (event) => {
  if (selectedUser) {
    setSelectedUser({ ...selectedUser, status: event.target.value === "true" });
  }
};

// Save changes and close popup
const saveChanges = () => {
  setUsers((prevUsers) =>
    prevUsers.map((user) =>
      user.id === selectedUser.id ? { ...user, status: selectedUser.status } : user
    )
  );
  setSelectedUser(null); // Close popup
};

return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">User List</h1>

    {/* Filters */}
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-600">
            Filter by Status:
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-600">
            Start Date:
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-600">
            End Date:
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    {/* User List */}
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-700 mb-4">User Details</h2>
      {filteredUsers.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Code</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2">Exam ID</th>
              <th className="border border-gray-300 px-4 py-2">Center ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleUserClick(user)}
              >
                <td className="border border-gray-300 px-4 py-2">{user.code}</td>
                <td className="border border-gray-300 px-4 py-2">{user.status ? "True" : "False"}</td>
                <td className="border border-gray-300 px-4 py-2">{user.created_at}</td>
                <td className="border border-gray-300 px-4 py-2">{user.exam}</td>
                <td className="border border-gray-300 px-4 py-2">{user.center}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center">No users match the selected filters.</p>
      )}
    </div>

    {/* Popup Card */}
    {selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 className="text-lg font-bold mb-4">Edit User Status</h3>
          <p className="mb-4">
            Code: <span className="font-medium">{selectedUser.code}</span>
          </p>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">
              Status:
            </label>
            <select
              id="status"
              value={selectedUser.status.toString()}
              onChange={handleStatusChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};


export default ExamCenterDashboard;
