import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { toast } from "react-toastify";
import { FaCog, FaTrash, FaPlus } from "react-icons/fa";
import Layout from "../Admin/Layout";

const ManagePointConfig = () => {
  const [config, setConfig] = useState({ id: null, point_price_in_inr: 1.0, welcome_points: 0 });
  
  const [teacherRules, setTeacherRules] = useState([]);
  const [recruiterRules, setRecruiterRules] = useState([]);
  
  // Dropdown data
  const [jobTypes, setJobTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Rule Forms
  const [newTeacherRule, setNewTeacherRule] = useState({ job_type: "", state: "", district: "", points_required: 0 });
  const [newRecruiterRule, setNewRecruiterRule] = useState({ class_category: "", subject: "", points_required: 0 });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Token ${token}` };

      const [confRes, trRes, rrRes, jtRes, catRes, subRes] = await Promise.all([
        axios.get(`${getApiUrl()}/api/admin/pointconfig/`, { headers }),
        axios.get(`${getApiUrl()}/api/admin/teacherpointrule/`, { headers }),
        axios.get(`${getApiUrl()}/api/admin/recruiterpointrule/`, { headers }),
        axios.get(`${getApiUrl()}/api/admin/teacherjobtype/`, { headers }),
        axios.get(`${getApiUrl()}/api/admin/classcategory/`, { headers }),
        axios.get(`${getApiUrl()}/api/admin/subject/`, { headers }),
      ]);

      if (confRes.data && confRes.data.length > 0) {
        setConfig(confRes.data[0]);
      } else {
        const createRes = await axios.post(`${getApiUrl()}/api/admin/pointconfig/`, { point_price_in_inr: 1.0, welcome_points: 0 }, { headers });
        setConfig(createRes.data);
      }
      
      setTeacherRules(trRes.data.results || trRes.data || []);
      setRecruiterRules(rrRes.data.results || rrRes.data || []);
      setJobTypes(jtRes.data.results || jtRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
      setSubjects(subRes.data.results || subRes.data || []);
    } catch (error) {
      console.error(error);
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
      if (config.id) {
        await axios.put(`${getApiUrl()}/api/admin/pointconfig/${config.id}/`, config, { headers: { Authorization: `Token ${token}` } });
        toast.success("Global point configuration updated!");
      }
    } catch (error) {
      toast.error("Failed to update global configuration");
    } finally {
      setSaving(false);
    }
  };
  const handleAddTeacherRule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const payload = { ...newTeacherRule };
      if (!payload.state) payload.state = null;
      if (!payload.district) payload.district = null;
      
      await axios.post(`${getApiUrl()}/api/admin/teacherpointrule/`, payload, { headers: { Authorization: `Token ${token}` } });
      toast.success("Teacher Rule Added!");
      setNewTeacherRule({ job_type: "", state: "", district: "", points_required: 0 });
      fetchData();
    } catch (error) {
      toast.error("Failed to add Teacher Rule");
    }
  };

  const handleAddRecruiterRule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      const payload = { ...newRecruiterRule };
      if (!payload.class_category) payload.class_category = null;
      if (!payload.subject) payload.subject = null;
      
      await axios.post(`${getApiUrl()}/api/admin/recruiterpointrule/`, payload, { headers: { Authorization: `Token ${token}` } });
      toast.success("Recruiter Rule Added!");
      setNewRecruiterRule({ class_category: "", subject: "", points_required: 0 });
      fetchData();
    } catch (error) {
      toast.error("Failed to add Recruiter Rule");
    }
  };

  const handleDeleteTeacherRule = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${getApiUrl()}/api/admin/teacherpointrule/${id}/`, { headers: { Authorization: `Token ${token}` } });
      toast.success("Rule Deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete rule");
    }
  };
  
  const handleDeleteRecruiterRule = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${getApiUrl()}/api/admin/recruiterpointrule/${id}/`, { headers: { Authorization: `Token ${token}` } });
      toast.success("Rule Deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete rule");
    }
  };

  if (loading) return (
    <Layout>
      <div className="p-8">Loading configuration...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaCog /> Manage Point System Configurations
        </h2>
        
        {/* Global Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Global Settings (Purchasing & Defaults)</h3>
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Point Price (in INR)</label>
              <input type="number" step="0.01" required className="w-full px-4 py-2 border rounded-md" value={config.point_price_in_inr} onChange={(e) => setConfig({ ...config, point_price_in_inr: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Points (Free)</label>
              <input type="number" required className="w-full px-4 py-2 border rounded-md" value={config.welcome_points} onChange={(e) => setConfig({ ...config, welcome_points: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                {saving ? "Saving..." : "Save Global Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Teacher Point Rules */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-blue-700">Teacher Rules (Point Deductions for Job Application)</h3>
          
          <form onSubmit={handleAddTeacherRule} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-md border border-gray-200 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Type (Required)</label>
              <select required className="w-full px-2 py-2 border rounded text-sm bg-white" value={newTeacherRule.job_type} onChange={e=>setNewTeacherRule({...newTeacherRule, job_type: e.target.value})}>
                <option value="">Select Job Type</option>
                {jobTypes.map(jt => <option key={jt.id} value={jt.id}>{jt.jobrole_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State (Optional)</label>
              <input type="text" placeholder="Any State" className="w-full px-2 py-2 border rounded text-sm bg-white" value={newTeacherRule.state} onChange={e=>setNewTeacherRule({...newTeacherRule, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">District (Optional)</label>
              <input type="text" placeholder="Any District" className="w-full px-2 py-2 border rounded text-sm bg-white" value={newTeacherRule.district} onChange={e=>setNewTeacherRule({...newTeacherRule, district: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Points Deducted</label>
              <input type="number" required className="w-full px-2 py-2 border rounded text-sm bg-white" value={newTeacherRule.points_required} onChange={e=>setNewTeacherRule({...newTeacherRule, points_required: e.target.value})} />
            </div>
            <div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                <FaPlus /> Add Rule
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Job Type</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Points Deducted</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {teacherRules.map(rule => {
                  const jt = jobTypes.find(j => j.id === rule.job_type);
                  return (
                    <tr key={rule.id} className="border-b">
                      <td className="px-4 py-2 font-medium">{jt ? jt.jobrole_name : rule.job_type}</td>
                      <td className="px-4 py-2">{rule.district || "Any"}, {rule.state || "Any State"}</td>
                      <td className="px-4 py-2 text-red-600 font-bold">-{rule.points_required}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleDeleteTeacherRule(rule.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recruiter Point Rules */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-purple-700">Recruiter Rules (Point Deductions for Hiring Request)</h3>
          
          <form onSubmit={handleAddRecruiterRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-md border border-gray-200 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Class Category (Optional)</label>
              <select className="w-full px-2 py-2 border rounded text-sm bg-white" value={newRecruiterRule.class_category} onChange={e=>setNewRecruiterRule({...newRecruiterRule, class_category: e.target.value})}>
                <option value="">Any Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject (Optional)</label>
              <select className="w-full px-2 py-2 border rounded text-sm bg-white" value={newRecruiterRule.subject} onChange={e=>setNewRecruiterRule({...newRecruiterRule, subject: e.target.value})}>
                <option value="">Any Subject</option>
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.subject_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Points Deducted</label>
              <input type="number" required className="w-full px-2 py-2 border rounded text-sm bg-white" value={newRecruiterRule.points_required} onChange={e=>setNewRecruiterRule({...newRecruiterRule, points_required: e.target.value})} />
            </div>
            <div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                <FaPlus /> Add Rule
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Points Deducted</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {recruiterRules.map(rule => {
                  const cat = categories.find(c => c.id === rule.class_category);
                  const sub = subjects.find(s => s.id === rule.subject);
                  return (
                    <tr key={rule.id} className="border-b">
                      <td className="px-4 py-2 font-medium">{cat ? cat.name : "Any Category"}</td>
                      <td className="px-4 py-2">{sub ? sub.subject_name : "Any Subject"}</td>
                      <td className="px-4 py-2 text-red-600 font-bold">-{rule.points_required}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleDeleteRecruiterRule(rule.id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ManagePointConfig;

