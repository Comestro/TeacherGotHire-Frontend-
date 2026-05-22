import React, { useState, useEffect } from "react";
import { axiosInstance } from "../services/apiService";

const InterviewerAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAllDay, setIsAllDay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    day_of_week: "all",
    start_time: "09:00",
    end_time: "17:00"
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axiosInstance.get("/api/interviewer/availability/");
      // Sort slots by day of week then by start time
      const sorted = (response.data || []).sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      });
      setSlots(sorted);
    } catch (error) {
      console.error("Failed to fetch availability slots", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllDayChange = (e) => {
    const checked = e.target.checked;
    setIsAllDay(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        start_time: "00:00",
        end_time: "23:59"
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        start_time: "09:00",
        end_time: "17:00"
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      if (formData.day_of_week === "all") {
        // Send a request for each day of the week
        const promises = [0, 1, 2, 3, 4, 5, 6].map((day) => 
          axiosInstance.post("/api/interviewer/availability/", {
            ...formData,
            day_of_week: day
          })
        );
        
        const results = await Promise.allSettled(promises);
        const succeededCount = results.filter(r => r.status === "fulfilled").length;
        const failedCount = results.filter(r => r.status === "rejected").length;
        
        if (succeededCount > 0) {
          setSuccessMsg(`Successfully added availability slots for ${succeededCount} day(s).`);
        }
        if (failedCount > 0) {
          // If all failed, show error, otherwise show informational message
          if (succeededCount === 0) {
            setErrorMsg("Failed to add slots. They might already exist.");
          } else {
            setErrorMsg(`Some days (${failedCount}) were skipped as they already had this exact slot configured.`);
          }
        }
      } else {
        await axiosInstance.post("/api/interviewer/availability/", formData);
        setSuccessMsg("Availability slot added successfully.");
      }
      fetchSlots(); // Refresh list
    } catch (error) {
      console.error("Failed to add slot", error);
      if (error.response && error.response.data) {
        if (Array.isArray(error.response.data)) {
          setErrorMsg(error.response.data[0]);
        } else if (typeof error.response.data === "object") {
          const firstKey = Object.keys(error.response.data)[0];
          const val = error.response.data[firstKey];
          setErrorMsg(Array.isArray(val) ? val[0] : JSON.stringify(val));
        } else if (typeof error.response.data === "string") {
          setErrorMsg(error.response.data);
        } else {
          setErrorMsg("Failed to add slot. It might already exist.");
        }
      } else {
        setErrorMsg("Failed to add slot. It might already exist.");
      }
    }
  };

  const deleteSlot = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axiosInstance.delete(`/api/interviewer/availability/${id}/`);
      setSuccessMsg("Availability slot removed successfully.");
      fetchSlots(); // Refresh list
    } catch (error) {
      console.error("Failed to delete slot", error);
      setErrorMsg("Failed to delete the availability slot.");
    }
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0]);
    const minutes = parts[1] || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    return `${hoursStr}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">My Availability</h2>
        <p className="text-slate-500 text-sm mt-1">Set the days and times you are available to take interviews.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-md text-sm flex justify-between items-center transition-all duration-300">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-md text-sm flex justify-between items-center transition-all duration-300">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-rose-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Add Availability Slot</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
            <select 
              value={formData.day_of_week}
              onChange={(e) => setFormData({...formData, day_of_week: e.target.value === "all" ? "all" : parseInt(e.target.value)})}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-teal-500 transition-colors cursor-pointer text-slate-800 font-medium"
            >
              <option value="all">All Days (Monday - Sunday)</option>
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          
          <div className="w-44">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input 
              type="time" 
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              disabled={isAllDay}
              className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors text-slate-800 font-medium h-[46px] ${isAllDay ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
              required
            />
          </div>
          
          <div className="w-44">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input 
              type="time" 
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              disabled={isAllDay}
              className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors text-slate-800 font-medium h-[46px] ${isAllDay ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
              required
            />
          </div>

          <div className="flex items-center h-[46px]">
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors h-full">
              <input 
                type="checkbox"
                checked={isAllDay}
                onChange={handleAllDayChange}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700 select-none">All Day (24h)</span>
            </label>
          </div>

          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors h-[46px] shadow-sm ml-auto">
            Add Slot
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Time</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">End Time</th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {slots.length > 0 ? slots.map((slot) => (
              <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{daysOfWeek[slot.day_of_week]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{formatTime12h(slot.start_time)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{formatTime12h(slot.end_time)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                  <button onClick={() => deleteSlot(slot.id)} className="text-rose-600 hover:text-rose-900 transition-colors">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm">
                  No availability slots configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewerAvailability;
