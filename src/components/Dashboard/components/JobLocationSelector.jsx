import React, { useState } from "react";
import { HiOutlineMapPin, HiPlus, HiXMark } from "react-icons/hi2";
import LocationModal from "../../Recruiter/components/LocationModal";

const JobLocationSelector = ({ jobType, locations = [], onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddLocation = (newLocation) => {
    // Check limit
    if (locations.length >= 5) return;

    // Check duplicate (simple check based on Pincode or District)
    const isDuplicate = locations.some(
      (loc) => loc.pincode === newLocation.pincode && loc.district === newLocation.district
    );

    if (isDuplicate) {
      // You might want to show a toast here, but for now we just return
      return;
    }

    onChange([...locations, newLocation]);
  };

  const handleRemoveLocation = (index) => {
    const newLocations = locations.filter((_, i) => i !== index);
    onChange(newLocations);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-gray-700">
          Preferred Locations (Max 5)
        </label>
        <span className="text-xs text-gray-500">
          {locations.length}/5 Selected
        </span>
      </div>

      <div className="space-y-2">
        {locations.map((loc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg text-sm group hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-700">
              <HiOutlineMapPin className="text-blue-500" />
              <span>
                {loc.district}
                {loc.area ? `, ${loc.area}` : ""}
                <span className="text-gray-400 text-xs ml-1">({loc.pincode})</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveLocation(index)}
              className="p-1 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          </div>
        ))}

        {locations.length < 5 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
          >
            <HiPlus className="h-4 w-4" />
            Add Location Preference
          </button>
        )}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleAddLocation}
      />
    </div>
  );
};

export default JobLocationSelector;
