import React from "react";

const FilterModal = ({
  isOpen,
  onClose,
  qualifications,
  subjects,
  classCategories,
  selectedQualifications,
  setSelectedQualifications,
  selectedSubjects,
  setSelectedSubjects,
  selectedClassCategories,
  setSelectedClassCategories,
  locationFilters,
  setLocationFilters,
  locationInputs,
  setLocationInputs,
  selectedStatuses,
  setSelectedStatuses,
  selectedGenders,
  setSelectedGenders,
  experienceRange,
  setExperienceRange,
  expandedSections,
  setExpandedSections,
  handleClearFilters,
}) => {
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white shadow-lg rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text">Filters</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Location Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Location</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.location ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.location && (
              <div className="">
                <div>
                  <label className="block text-sm text-secondary mb-1">State</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationInputs.state}
                      onChange={(e) => setLocationInputs(prev => ({ ...prev, state: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Enter state"
                    />
                    <button
                      onClick={() => {
                        if (locationInputs.state.trim()) {
                          setLocationFilters(prev => ({ ...prev, state: [...prev.state, locationInputs.state.trim()] }));
                          setLocationInputs(prev => ({ ...prev, state: '' }));
                        }
                      }}
                      className="px-2 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {locationFilters.state.map((s, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center gap-1">
                        {s}
                        <button onClick={() => setLocationFilters(prev => ({ ...prev, state: prev.state.filter((_, i) => i !== idx) }))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-secondary mb-1">District</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={locationInputs.district}
                      onChange={(e) => setLocationInputs(prev => ({ ...prev, district: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Enter district"
                    />
                    <button
                      onClick={() => {
                        if (locationInputs.district.trim()) {
                          setLocationFilters(prev => ({ ...prev, district: [...prev.district, locationInputs.district.trim()] }));
                          setLocationInputs(prev => ({ ...prev, district: '' }));
                        }
                      }}
                      className="px-2 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {locationFilters.district.map((d, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center gap-1">
                        {d}
                        <button onClick={() => setLocationFilters(prev => ({ ...prev, district: prev.district.filter((_, i) => i !== idx) }))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Qualification Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('qualification')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Qualification</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.qualification ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.qualification && (
              <div className="space-y-2  max-h-48 overflow-y-auto">
                {qualifications.map((q) => (
                  <label key={q.id} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedQualifications.includes(q.name.toLowerCase())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQualifications(prev => [...prev, q.name.toLowerCase()]);
                        } else {
                          setSelectedQualifications(prev => prev.filter(s => s !== q.name.toLowerCase()));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-text">{q.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Subject Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('subject')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Subject</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.subject ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.subject && (
              <div className="space-y-2  max-h-48 overflow-y-auto">
                {subjects.map((s) => (
                  <label key={s.id} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(s.subject_name.toLowerCase())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects(prev => [...prev, s.subject_name.toLowerCase()]);
                        } else {
                          setSelectedSubjects(prev => prev.filter(sub => sub !== s.subject_name.toLowerCase()));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-text">{s.subject_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Class Category Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('classCategory')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Class Category</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.classCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.classCategory && (
              <div className="space-y-2  max-h-48 overflow-y-auto">
                {classCategories.map((c) => (
                  <label key={c.id} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedClassCategories.includes(c.name.toLowerCase())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClassCategories(prev => [...prev, c.name.toLowerCase()]);
                        } else {
                          setSelectedClassCategories(prev => prev.filter(cat => cat !== c.name.toLowerCase()));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-text">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('status')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Status</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.status ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.status && (
              <div className="space-y-2 ">
                <label className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes('active')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatuses(prev => [...prev, 'active']);
                      } else {
                        setSelectedStatuses(prev => prev.filter(s => s !== 'active'));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-text">Active</span>
                </label>
                <label className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes('inactive')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatuses(prev => [...prev, 'inactive']);
                      } else {
                        setSelectedStatuses(prev => prev.filter(s => s !== 'inactive'));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-text">Inactive</span>
                </label>
              </div>
            )}
          </div>

          {/* Gender Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('gender')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Gender</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.gender ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.gender && (
              <div className="space-y-2 ">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(gender)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenders(prev => [...prev, gender]);
                        } else {
                          setSelectedGenders(prev => prev.filter(g => g !== gender));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-text capitalize">{gender}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 px-2 -mx-2 rounded"
            >
              <h4 className="font-medium text-text">Experience (Years)</h4>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.experience ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.experience && (
              <div className="space-y-3 ">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-secondary mb-1">Min</label>
                    <input
                      type="number"
                      value={experienceRange.min}
                      onChange={(e) => setExperienceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary mb-1">Max</label>
                    <input
                      type="number"
                      value={experienceRange.max}
                      onChange={(e) => setExperienceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="50"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="border-t border-gray-200 p-4 bg-white flex gap-3">
          <button
            onClick={handleClearFilters}
            className="flex-1 px-4 py-2 border border-gray-300 text-text rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;