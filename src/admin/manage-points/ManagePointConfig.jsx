import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { toast } from "react-toastify";
import { FaCog } from "react-icons/fa";

const ManagePointConfig = () => {
  const [config, setConfig] = useState({ id: null, point_price_in_inr: 1.0, welcome_points: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${getApiUrl()}/api/admin/pointconfig/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.data && res.data.length > 0) {
        setConfig(res.data[0]);
      } else {
        // If no config exists, create a default one
        const createRes = await axios.post(
          `${getApiUrl()}/api/admin/pointconfig/`,
          { point_price_in_inr: 1.0, welcome_points: 0 },
          { headers: { Authorization: `Token ${token}` } }
        );
        setConfig(createRes.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load point configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (config.id) {
        await axios.put(
          `${getApiUrl()}/api/admin/pointconfig/${config.id}/`,
          config,
          { headers: { Authorization: `Token ${token}` } }
        );
        toast.success("Point configuration updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update point configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading configuration...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaCog /> Manage Point System Configuration
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Global Settings</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Point Price (in INR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2 border rounded-md"
              value={config.point_price_in_inr}
              onChange={(e) => setConfig({ ...config, point_price_in_inr: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">This determines how much a user pays when buying points. (e.g., 1 point = ₹1)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Points
            </label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 border rounded-md"
              value={config.welcome_points}
              onChange={(e) => setConfig({ ...config, welcome_points: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Number of free points granted to new users upon registration.</p>
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">Note on Advanced Rules:</p>
        <p>To configure specific deduction amounts for Teachers (by Location/Job Type) and Recruiters (by Subject), please use the native backend admin panel at <strong>/admin</strong> for advanced relational queries.</p>
      </div>
    </div>
  );
};

export default ManagePointConfig;
