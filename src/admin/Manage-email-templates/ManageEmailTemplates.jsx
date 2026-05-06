import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HiOutlinePencilAlt, HiOutlinePlus } from "react-icons/hi";

const ManageEmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: "", subject: "", body_html: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axiosPrivate.get("/teacherhire/admin/emailtemplates/");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({ name: template.name, subject: template.subject, body_html: template.body_html });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: "", subject: "", body_html: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await axiosPrivate.put(`/teacherhire/admin/emailtemplates/${editingTemplate.id}/`, formData);
      } else {
        await axiosPrivate.post("/teacherhire/admin/emailtemplates/", formData);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please check your inputs.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Email Templates</h1>
          <p className="text-slate-500">Manage and customize automated email notifications.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Template
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-semibold">Name (Key)</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">Loading...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">No templates found.</td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-800">{template.name}</td>
                    <td className="p-4 text-slate-600 truncate max-w-xs">{template.subject}</td>
                    <td className="p-4 text-slate-500">{new Date(template.updated_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-teal-600 hover:text-teal-800 p-2 rounded-lg hover:bg-teal-50 transition"
                      >
                        <HiOutlinePencilAlt className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name (Key)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="e.g., otp_verification"
                  disabled={!!editingTemplate}
                />
                <p className="text-xs text-slate-500 mt-1">Used by the system to identify this template. Cannot be changed after creation.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HTML Body</label>
                <textarea
                  required
                  rows="12"
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm"
                  placeholder="<div>Hello {{ user_name }}</div>"
                ></textarea>
                <p className="text-xs text-slate-500 mt-1">You can use standard HTML and Django template variables (e.g., {"{{ score }}"}).</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmailTemplates;
