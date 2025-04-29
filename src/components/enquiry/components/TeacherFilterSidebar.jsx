import React, { useEffect } from 'react';
import {
  FiSliders,
  FiX,
  FiFilter,
} from "react-icons/fi";

const TeacherFilterSidebar = ({
  showFilters,
  setShowFilters,
  isMobile,
  subject,
  filterClassCategory,
  setFilterClassCategory,
  filterSubjects,
  setFilterSubjects,
  filterPincode,
  setFilterPincode,
  applyFilters,
  resetFilters,
  onClose,
}) => {
    useEffect(() => {
        const handleResize = () => {
          if (window.innerWidth >= 768) {
            setShowFilters(true);
          } else {
            setShowFilters(false);
          }
        };
      
        window.addEventListener('resize', handleResize);
        handleResize(); // Call once on mount
      
        return () => window.removeEventListener('resize', handleResize);
      }, []);
  return (
    <div 
      className={`${
        isMobile 
          ? `fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              showFilters ? 'translate-x-0' : 'translate-x-full'
            }`
          : 'md:w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:sticky md:top-4 self-start'
      }`}
    >
      {/* Header */}
      <div className={`flex justify-between items-center p-4 border-b ${isMobile ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <FiSliders className="text-teal-600" />
          <h3 className="font-medium">Filter Options</h3>
        </div>
        {isMobile ? (
          <button onClick={onClose}>
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        ) : null}
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-6">
        {/* Class Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            Class Category
          </label>
          <select
            value={filterClassCategory}
            onChange={(e) => setFilterClassCategory(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {subject && subject.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Filter */}
        {filterClassCategory && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Subjects
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {subject && subject
                .filter(category => category.id === parseInt(filterClassCategory))
                .map(category => (
                  category.subjects && category.subjects.map(subj => (
                    <div key={subj.id} className="mb-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterSubjects.includes(subj.id)}
                          onChange={() => {
                            if (filterSubjects.includes(subj.id)) {
                              setFilterSubjects(prev => prev.filter(id => id !== subj.id));
                            } else {
                              setFilterSubjects(prev => [...prev, subj.id]);
                            }
                          }}
                          className="rounded text-teal-500 focus:ring-teal-500"
                        />
                        {subj.subject_name}
                      </label>
                    </div>
                  ))
                ))}
            </div>
          </div>
        )}

        {/* Pincode Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            Pincode
          </label>
          <input
            type="text"
            value={filterPincode}
            onChange={(e) => setFilterPincode(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter pincode"
            maxLength="6"
          />
        </div>

        {/* Filter Buttons */}
        <div className="pt-4 space-y-2">
          <button
            onClick={() => {
              applyFilters();
              if (isMobile) onClose();
            }}
            className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
          >
            <FiFilter className="mr-2" />
            Apply Filters
          </button>
          
          <button
            onClick={resetFilters}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherFilterSidebar;