import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX, FiMapPin, FiCheck } from "react-icons/fi";
import { MdLocationCity, MdLocalPostOffice } from "react-icons/md";

// Bihar districts list (Same as in RecruiterSidebar)
const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
  "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
  "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
  "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
  "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
  "Vaishali", "West Champaran"
].sort();

const DEFAULT_INITIAL_DATA = {};

const LocationModal = ({ isOpen, onClose, onApply, initialData = DEFAULT_INITIAL_DATA }) => {
  const [formData, setFormData] = useState({
    state: "Bihar",
    district: "",
    pincode: "",
    post_office: "",
    area: ""
  });

  const [postOffices, setPostOffices] = useState([]);
  const [loadingPostOffices, setLoadingPostOffices] = useState(false);
  const [error, setError] = useState("");

  // Initialize with data if provided
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        district: initialData.district || "",
        pincode: initialData.pincode || "",
        post_office: initialData.post_office || "",
        area: initialData.area || ""
      }));
    }
  }, [isOpen, initialData]);

  // Fetch post offices when pincode changes
  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      setLoadingPostOffices(true);
      fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]?.Status === "Success") {
            setPostOffices(data[0].PostOffice || []);
            setError("");
          } else {
            setPostOffices([]);
            setError("Invalid Pincode");
          }
        })
        .catch(() => {
          setPostOffices([]);
          setError("Failed to fetch location data");
        })
        .finally(() => setLoadingPostOffices(false));
    } else {
      setPostOffices([]);
    }
  }, [formData.pincode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!formData.district) {
      setError("Please select a district");
      return;
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }
    if (!formData.post_office) {
      setError("Please select a post office");
      return;
    }

    onApply(formData);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FiMapPin className="text-primary" />
            Location Details
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* State (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input
              type="text"
              value="Bihar"
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">District <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">Select District</option>
                {BIHAR_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <MdLocationCity />
              </div>
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handlePincodeChange}
              placeholder="Enter 6-digit pincode"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {loadingPostOffices && (
              <p className="text-xs text-primary mt-1.5 font-medium animate-pulse">Fetching post offices...</p>
            )}
          </div>

          {/* Post Office */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Post Office <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                name="post_office"
                value={formData.post_office}
                onChange={handleChange}
                disabled={postOffices.length === 0}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Select Post Office</option>
                {postOffices.map((po, idx) => (
                  <option key={idx} value={po.Name}>{po.Name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <MdLocalPostOffice />
              </div>
            </div>
          </div>

          {/* Area (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Locality <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. Gandhi Maidan"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              <FiCheck />
              Apply Location
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationModal;
