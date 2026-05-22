import React, { useState, useEffect } from "react";
import { axiosInstance } from "../services/apiService";

const InterviewerAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00"
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axiosInstance.get("/teacherhire/interviewer/availability/");
      setSlots(response.data);
    } catch (error) {
      console.error("Failed to fetch availability slots", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/teacherhire/interviewer/availability/", formData);
      fetchSlots(); // Refresh list
    } catch (error) {
      console.error("Failed to add slot", error);
    }
  };

  const deleteSlot = async (id) => {
    try {
      await axiosInstance.delete(`/teacherhire/interviewer/availability/${id}/`);
      fetchSlots(); // Refresh list
    } catch (error) {
      console.error("Failed to delete slot", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-5 rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">My Availability</h2>
        <p className="text-slate-500 text-sm mt-1">Set the days and times you are available to take interviews.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Add Availability Slot</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
            <select 
              value={formData.day_of_week}
              onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors"
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input 
              type="time" 
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
            <input 
              type="time" 
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 transition-colors"
              required
            />
          </div>
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2 rounded-lg transition-colors h-[42px]">
            Add Slot
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Day</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Time</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {slots.length > 0 ? slots.map((slot) => (
              <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{daysOfWeek[slot.day_of_week]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.start_time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{slot.end_time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => deleteSlot(slot.id)} className="text-red-500 hover:text-red-700 transition-colors">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500 text-sm">
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
