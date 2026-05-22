import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../services/apiService";
import { HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineStar } from "react-icons/hi";

const InterviewerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get("/teacherhire/interviewer/dashboard/");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!dashboardData?.profile) return;
    try {
      const updatedStatus = !dashboardData.profile.is_available;
      await axiosInstance.patch(`/teacherhire/interviewer/profile/${dashboardData.profile.id}/`, {
        is_available: updatedStatus
      });
      setDashboardData(prev => ({
        ...prev,
        profile: { ...prev.profile, is_available: updatedStatus }
      }));
    } catch (error) {
      console.error("Failed to update availability", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const { profile, upcoming_interviews } = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Interviewer Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your schedule and view upcoming interviews.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Availability:</span>
          <button 
            onClick={toggleAvailability}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profile?.is_available ? 'bg-teal-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile?.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-bold ${profile?.is_available ? 'text-teal-600' : 'text-slate-500'}`}>
            {profile?.is_available ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <HiOutlineCheckCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Interviews</p>
            <h3 className="text-2xl font-bold text-slate-800">{profile?.total_interviews || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <HiOutlineStar className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-800">{profile?.average_score?.toFixed(1) || '0.0'}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <HiOutlineCalendar className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Upcoming</p>
            <h3 className="text-2xl font-bold text-slate-800">{upcoming_interviews?.length || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Upcoming Interview Timeline</h3>
        </div>
        <div className="p-5">
          {upcoming_interviews && upcoming_interviews.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {upcoming_interviews.map((interview, index) => (
                <div key={interview.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-teal-100 text-teal-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <HiOutlineCalendar size={18} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800">{interview.user__Fname} {interview.user__Lname}</h4>
                      <time className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {new Date(interview.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </time>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">Subject: {interview.subject__subject_name}</p>
                    <a 
                      href={interview.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded transition-colors"
                    >
                      Join Google Meet
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <HiOutlineCalendar className="mx-auto text-4xl text-slate-300 mb-3" />
              <p className="text-slate-500">No upcoming interviews scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
