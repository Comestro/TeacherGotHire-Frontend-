import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { toast } from "react-toastify";
import { 
  FaCog, 
  FaPercent, 
  FaCoins, 
  FaGift, 
  FaRupeeSign, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaCalculator 
} from "react-icons/fa";
import Layout from "../Admin/Layout";

const ManagePointConfig = () => {
  const [config, setConfig] = useState({ 
    id: null, 
    point_price_in_inr: 1.0, 
    welcome_points: 0, 
    hire_fee_percentage: 10.0, 
    min_wallet_recharge: 100 
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Test Calculator helper
  const [testSalary, setTestSalary] = useState(25000);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Token ${token}` };

      const confRes = await axios.get(`${getApiUrl()}/api/admin/pointconfig/`, { headers });
      const confData = confRes.data?.results || confRes.data || [];
      if (confData.length > 0) {
        setConfig(confData[0]);
      } else {
        const createRes = await axios.post(
          `${getApiUrl()}/api/admin/pointconfig/`, 
          { point_price_in_inr: 1.0, welcome_points: 0, hire_fee_percentage: 10.0, min_wallet_recharge: 100 }, 
          { headers }
        );
        setConfig(createRes.data);
      }
    } catch (e) {
      console.error("Config fetch error", e);
      toast.error("Failed to load point configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Token ${token}` };
      if (config.id) {
        await axios.put(`${getApiUrl()}/api/admin/pointconfig/${config.id}/`, config, { headers });
        toast.success("Point configuration updated successfully!");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const calculatedPoints = Math.round(Number(testSalary || 0) * (Number(config.hire_fee_percentage || 0) / 100));

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-500 font-medium">
          Loading configuration...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <FaCog className="text-teal-600" /> Points & Salary-Based Deduction Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure wallet pricing, recharge limits, and percentage-based point deduction on expected salary.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3 text-sm text-teal-900">
          <FaInfoCircle className="text-teal-600 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Salary Expectation-Based Model Active:</span>
            <p className="mt-0.5 text-teal-800 text-xs leading-relaxed">
              Points are now deducted dynamically as a percentage of the teacher's expected salary entered during job application.
              Fixed category/subject rules are deprecated in favor of this single, fair percentage-based system.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Main Configurations Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FaCoins className="text-amber-500" /> Core Wallet & Deduction Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Fee Percentage */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <FaPercent className="text-indigo-600 text-xs" />
                  Hire & Job Apply Fee Percentage (%)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  % of teacher's expected salary debited as points during job application & recruiter hire requests.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    value={config.hire_fee_percentage}
                    onChange={(e) => setConfig({ ...config, hire_fee_percentage: e.target.value })}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>

              {/* Point Price in INR */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <FaRupeeSign className="text-emerald-600 text-xs" />
                  Point Price (in INR)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Cost of 1 Point when teachers or recruiters purchase points via online payment.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    value={config.point_price_in_inr}
                    onChange={(e) => setConfig({ ...config, point_price_in_inr: e.target.value })}
                  />
                </div>
              </div>

              {/* Minimum Wallet Recharge */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <FaRupeeSign className="text-teal-600 text-xs" />
                  Minimum Wallet Recharge (INR)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Minimum payment amount required when topping up points (e.g. ₹100).
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    value={config.min_wallet_recharge}
                    onChange={(e) => setConfig({ ...config, min_wallet_recharge: e.target.value })}
                  />
                </div>
              </div>

              {/* Welcome Points */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <FaGift className="text-rose-500 text-xs" />
                  Welcome Points (Free on Signup)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Complimentary free points credited to newly registered teachers & recruiters.
                </p>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={config.welcome_points}
                  onChange={(e) => setConfig({ ...config, welcome_points: e.target.value })}
                />
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaCheckCircle /> {saving ? "Saving Changes..." : "Save Point Settings"}
              </button>
            </div>
          </div>
        </form>

        {/* Live Calculation Preview Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-xl border border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <FaCalculator className="text-indigo-600" /> Live Deduction Simulator
            </h4>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-100/60 px-2.5 py-1 rounded-full">
              Preview Mode
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Check how points will be debited for any expected salary using the current <strong>{config.hire_fee_percentage}%</strong> rate:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample Teacher Expected Salary (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={testSalary}
                  onChange={(e) => setTestSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-indigo-100 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-slate-500 block">Deduction at {config.hire_fee_percentage}%:</span>
                <span className="text-lg font-bold text-indigo-600">{calculatedPoints.toLocaleString()} Points</span>
              </div>
              <div className="text-right text-xs text-slate-400">
                Value: ₹{(calculatedPoints * Number(config.point_price_in_inr || 1)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ManagePointConfig;
