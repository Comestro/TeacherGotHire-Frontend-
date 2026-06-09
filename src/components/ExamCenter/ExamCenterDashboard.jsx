import React, { useState, useEffect } from "react";
import { getAllCenterUser, approveCenterUser } from "../../features/examQuesSlice";
import { useDispatch, useSelector } from "react-redux";

const ExamCenterDashboard = () => { 
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllCenterUser());
  }, [dispatch]);
  
  const { centerUser, error } = useSelector((state) => state.examQues);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    if (centerUser) {
      setUsers(centerUser);
    }
  }, [centerUser]);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      statusFilter === "" || user.status === statusFilter;
    const matchesDate =
      (!startDate || new Date(user.created_at) >= new Date(startDate)) &&
      (!endDate || new Date(user.created_at) <= new Date(endDate));
    return matchesStatus && matchesDate;
  });
  
  const handleApprove = async (userId) => {
    try {
      dispatch(approveCenterUser(userId));
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user?.id === userId.user_id && user.exam?.id === userId.exam_id ? { ...user, status: 'fulfilled' } : user
        )
      );
      alert("Request approved successfully!");
    } catch (error) {
      alert("Failed to approve the request. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Center Passkey Requests</h1>

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
              <option value="">All Requests</option>
              <option value="requested">Pending (Requested)</option>
              <option value="fulfilled">Approved (Fulfilled)</option>
              <option value="isused">Already Used</option>
              <option value="rejected">Rejected</option>
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
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Passkey Requests</h2>
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 font-bold bg-red-50 p-4 rounded-lg inline-block border border-red-200">
              {typeof error === 'string' ? error : "An error occurred fetching requests."}
            </p>
          </div>
        ) : filteredUsers?.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 min-w-max">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-300 px-4 py-2">Teacher Name</th>
                <th className="border border-gray-300 px-4 py-2">Teacher Code</th>
                <th className="border border-gray-300 px-4 py-2">Exam</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Passcode</th>
                <th className="border border-gray-300 px-4 py-2">Requested At</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Action / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <span className="font-medium text-gray-800">{user.user?.Fname} {user.user?.Lname}</span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                      {user.user?.user_code || `T-${user.user?.id}`}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{user.exam?.name}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {user.status === 'fulfilled' || user.status === 'isused' ? (
                      <span className="bg-green-100 text-green-800 font-mono font-bold px-3 py-1 rounded text-lg border border-green-200">
                        {user.code}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        {user.status === 'rejected' ? 'Rejected' : 'Hidden (Pending)'}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {user.status === 'requested' ? (
                      <button
                        onClick={() => handleApprove({user_id:user.user.id,exam_id:user.exam.id})}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Approve Request
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg border ${
                        user.status === 'fulfilled' || user.status === 'isused' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'
                      }`}>
                        {user.status === 'fulfilled' || user.status === 'isused' ? (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {user.status === 'isused' ? 'Used' : 'Approved'}
                          </>
                        ) : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No passkey requests match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCenterDashboard;