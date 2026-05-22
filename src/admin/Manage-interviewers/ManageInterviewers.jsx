import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../services/apiService";
import { HiOutlineSearch, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi";

const ManageInterviewers = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const response = await axiosInstance.get("/teacherhire/interviewer/profile/");
      setInterviewers(response.data);
    } catch (error) {
      console.error("Failed to fetch interviewers", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviewers = interviewers.filter((inv) =>
    inv.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Interviewers</h2>
          <p className="text-slate-500 text-sm mt-1">Assign subjects, categories, and view performance metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
          <HiOutlinePlus />
          Add Interviewer Role
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search interviewers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Interviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Interviews / Score</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </td>
                </tr>
              ) : filteredInterviewers.length > 0 ? (
                filteredInterviewers.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{inv.username}</div>
                      <div className="text-xs text-slate-500">ID: {inv.user}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {inv.class_category_names?.map((cat, i) => (
                          <span key={i} className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {inv.subject_names?.map((sub, i) => (
                          <span key={i} className="inline-block bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.is_available ? 'Available' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-slate-800 font-medium">{inv.total_interviews}</div>
                      <div className="text-xs text-slate-500">Avg: {inv.average_score?.toFixed(1) || '0.0'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1">
                        <HiOutlinePencil /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-sm">
                    No interviewers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInterviewers;
