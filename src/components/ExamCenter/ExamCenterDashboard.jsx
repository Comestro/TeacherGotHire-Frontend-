import React, { useState, useEffect } from "react";
import { getAllCenterUser, approveCenterUser } from "../../features/examQuesSlice";
import { useDispatch, useSelector } from "react-redux";

const ExamCenterDashboard = () => { 
  const dispatch = useDispatch();

  // Fetch the data when the component mounts
  useEffect(() => {
    dispatch(getAllCenterUser());
  }, [dispatch]);
  
  // Get centerUser from Redux state
  const { centerUser } = useSelector((state) => state.examQues);

  // Local state for users
  const [users, setUsers] = useState([]);

  // Update users state when centerUser changes
  useEffect(() => {
    if (centerUser) {
      setUsers(centerUser);
    }
  }, [centerUser]);

  // Filters
  const [statusFilter, setStatusFilter] = useState(""); // "true", "false", or ""
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered user list
  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      statusFilter === "" || user.status.toString() === statusFilter;
    const matchesDate =
      (!startDate || new Date(user.created_at) >= new Date(startDate)) &&
      (!endDate || new Date(user.created_at) <= new Date(endDate));
    return matchesStatus && matchesDate;
  });

  // Handle approve button click
  const handleApprove = async (userId) => {
    try {
      // Dispatch action to approve the user
      dispatch(approveCenterUser(userId));

      // Update local users state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: true } : user
        )
      );

      // Optionally, show a success message
      alert("User approved successfully!");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve the user. Please try again.");
    }
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
              <option value="true">Aprroved</option>
              <option value="false">Not Aprroved</option>
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
                <th className="border border-gray-300 px-4 py-2">Created At</th>
                <th className="border border-gray-300 px-4 py-2">Exam ID</th>
                <th className="border border-gray-300 px-4 py-2">Approve</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{user.code}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.created_at}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.exam.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {!user.status ? (
                      <button
                        onClick={() => handleApprove({user_id:user.user.id,exam_id:user.exam.id})}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-green-600 font-bold">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No users match the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default ExamCenterDashboard;