import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";

const TeacherHireRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
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

  const handleStatusUpdate = async (id, statusValue) => {
    try {
      const token = localStorage.getItem("access_token");
      const data = { status: statusValue };
      if (statusValue === "rejected") {
        data.reject_reason = "Rejected by teacher";
      }

      await axios.put(`${getApiUrl()}/api/self/hirerequest/${id}/`, data, {
        headers: { Authorization: `Token ${token}` },
      });
      
      toast.success(`Request ${statusValue} successfully`);
      fetchRequests();
      
      // Update global wallet balance if needed (trigger layout refresh)
      if (statusValue === "fulfilled") {
        window.dispatchEvent(new Event("walletUpdated"));
      }
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error?.includes("Insufficient points")) {
        const errorMsg = error.response.data.error;
        const required = errorMsg.match(/Required: (\d+)/)?.[1] || 0;
        const balance = errorMsg.match(/Balance: (\d+)/)?.[1] || 0;
        setRequiredPoints(parseInt(required));
        setWalletBalance(parseInt(balance));
        setShowWalletModal(true);
      } else {
        toast.error("Failed to update request status");
      }
    }
  };

  const WalletModal = () => {
    if (!showWalletModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-indigo-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40">
              <span className="text-white text-2xl font-bold font-serif">P</span>
            </div>
            <h3 className="text-xl font-bold text-white">Insufficient Points</h3>
            <p className="text-indigo-100 mt-2 text-sm">
              You need more points to accept this hiring request.
            </p>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Current Balance</span>
              <span className="font-bold text-slate-800">{walletBalance} Points</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Required Points</span>
              <span className="font-bold text-red-600">{requiredPoints} Points</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3 mt-4">
              <span className="font-medium text-slate-700">Shortfall</span>
              <span className="font-bold text-indigo-600">{requiredPoints - walletBalance} Points</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowWalletModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  navigate("/teacher/wallet");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Hire Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage requests from recruiters.</p>
      </div>

      <WalletModal />

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
          <p className="text-slate-500 mt-2">You don't have any hiring requests from recruiters at the moment.</p>
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
                  Recruiter: {req.recruiter_name || "Unknown"}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  A recruiter is interested in your profile.
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiOutlineBriefcase className="text-slate-400 shrink-0" />
                    <span className="truncate" title={req.job_type_names?.join(", ") || "None"}>
                      Job Types: {req.job_type_names?.length > 0 ? req.job_type_names.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiOutlineClock className="text-slate-400 shrink-0" />
                    <span className="truncate" title={req.subject_names?.join(", ") || "None"}>
                      Subjects: {req.subject_names?.length > 0 ? req.subject_names.join(", ") : "None"}
                    </span>
                  </div>
                </div>
              </div>
              
              {req.status === 'requested' && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(req.id, "rejected")}
                    className="flex-1 py-2 bg-white border border-rose-200 text-rose-600 font-medium rounded-lg hover:bg-rose-50 transition-colors text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req.id, "fulfilled")}
                    className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                  >
                    Accept
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

export default TeacherHireRequests;
