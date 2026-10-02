import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";

const RecruiterHireRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
        const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${getApiUrl()}/api/self/hirerequest/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching hire requests", error);
      toast.error("Failed to load hire requests");
    } finally {
      setLoading(false);
    }
  };

  
  const handleWithdraw = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${getApiUrl()}/api/self/hirerequest/${id}/withdraw/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      
      toast.success("Request withdrawn successfully! Points refunded to your wallet.");
      fetchRequests();
      window.dispatchEvent(new Event("walletUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to withdraw request");
    }
  };

  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hire Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage hire requests you have sent to teachers.</p>
      </div>

      

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineBriefcase className="text-3xl text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No requests yet</h3>
          <p className="text-slate-500 mt-2">You haven't sent any hire requests to teachers yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    req.status === 'requested' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {req.status === 'fulfilled' ? 'Accepted' : req.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(req.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">
                  Teacher: {req.teacher_name || "Unknown"}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  You have requested this teacher for an interview.
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiOutlineBriefcase className="text-slate-400 shrink-0" />
                    <span className="truncate">Job Types: {req.teacher_job_type?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiOutlineClock className="text-slate-400 shrink-0" />
                    <span className="truncate">Subjects: {req.subject?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {req.status === 'requested' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => handleWithdraw(req.id)}
                    className="flex-1 py-2 bg-white border border-rose-200 text-rose-600 font-medium rounded-lg hover:bg-rose-50 transition-colors text-sm shadow-sm"
                  >
                    Withdraw & Refund Points
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterHireRequests;
