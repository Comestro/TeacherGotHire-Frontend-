import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiSearch,
  FiCheck,
} from "react-icons/fi";
import {
  MdSchool,
  MdWork,
  MdCode,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdPeople,
} from "react-icons/md";
import {
  getAllSkills,
  getQualification,
  getClassCategory,
  getTeacherjobType,
} from "../../../features/jobProfileSlice";
import { fetchTeachers } from "../../../features/teacherFilterSlice";

// Bihar districts list
const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
  "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
  "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
  "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
  "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
  "Vaishali", "West Champaran"
].sort();

// Filter Section Component (memoized to prevent re-renders)
const FilterSection = React.memo(({ title, icon: Icon, section, isExpanded, onToggle, children }) => {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} filters`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <FiChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
        ) : (
          <FiChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

// Checkbox Item Component (memoized to prevent re-renders)
const CheckboxItem = React.memo(({ checked, onChange, label, disabled = false }) => (
  <label className="flex items-center gap-2 py-2 cursor-pointer group hover:bg-slate-50 px-2 rounded transition-colors">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
      {checked ? (
        <MdCheckBox className="w-5 h-5 text-teal-600" aria-hidden="true" />
      ) : (
        <MdCheckBoxOutlineBlank className="w-5 h-5 text-slate-400 group-hover:text-teal-500" aria-hidden="true" />
      )}
    </div>
    <span className={`text-sm ${checked ? "text-teal-700 font-medium" : "text-slate-600"}`}>
      {label}
    </span>
  </label>
));

CheckboxItem.displayName = 'CheckboxItem';

const RecruiterSidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux data
  const { qualification, allSkill, classCategories, teacherjobRole } = useSelector(
    (state) => state.jobProfile
  );

  // Main filter state
  const [filters, setFilters] = useState({
    city: [],
    pincode: [],
    block: [],
    village: [],
    state: [],
    qualification: [],
    class_category: [],
    subject: [],
    gender: [],
    job_type: [],
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    education: false,
    classSubject: false,
    other: false,
  });

  // Local state for inputs
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [postOffices, setPostOffices] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState("");
  const [area, setArea] = useState("");
  const [loadingPostOffices, setLoadingPostOffices] = useState(false);

  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Initialize data
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getQualification());
    dispatch(getClassCategory());
    dispatch(getTeacherjobType());
  }, [dispatch]);

  // Fetch post offices when pincode changes
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setLoadingPostOffices(true);
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]?.Status === "Success") {
            setPostOffices(data[0].PostOffice || []);
          } else {
            setPostOffices([]);
          }
        })
        .catch(() => setPostOffices([]))
        .finally(() => setLoadingPostOffices(false));
    } else {
      setPostOffices([]);
      setSelectedPostOffice("");
    }
  }, [pincode]);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // Track if URL params have been loaded
  const hasLoadedUrlParams = useRef(false);

  // Load filters from URL (only once on mount)
  useEffect(() => {
    if (hasLoadedUrlParams.current) return;
    
    const newFilters = {};
    const getList = (key) => {
      const val = searchParams.get(key);
      return val ? val.split(",").filter(Boolean) : [];
    };

    // Initialize with empty arrays/objects
    newFilters.city = [];
    newFilters.pincode = [];
    newFilters.block = [];
    newFilters.village = [];
    newFilters.state = [];
    newFilters.qualification = [];
    newFilters.class_category = [];
    newFilters.subject = [];
    newFilters.gender = [];
    newFilters.job_type = [];

    // Load all filter types from URL
    ["city", "pincode", "block", "village", "state", "qualification", "gender", "job_type"].forEach(
      (key) => {
        if (searchParams.has(key)) newFilters[key] = getList(key);
      }
    );



    setFilters(newFilters);
    
    // Load location-specific params
    if (searchParams.has("district")) setSelectedDistrict(searchParams.get("district"));
    if (searchParams.has("pincode")) setPincode(searchParams.get("pincode"));
    if (searchParams.has("post_office")) setSelectedPostOffice(searchParams.get("post_office"));
    if (searchParams.has("area")) setArea(searchParams.get("area"));
    
    hasLoadedUrlParams.current = true;
  }, [searchParams]);

  // Sync filters to URL
  const syncFiltersToURL = () => {
    const params = new URLSearchParams();

    // Add location-specific params
    params.set("state", "Bihar"); // Always Bihar
    if (selectedDistrict) params.set("district", selectedDistrict);
    if (pincode) params.set("pincode", pincode);
    if (selectedPostOffice) params.set("post_office", selectedPostOffice);
    if (area) params.set("area", area);

    // Add other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (typeof value === "object" && (value.min || value.max)) {
        if (value.min) params.set(`${key}_min`, value.min);
        if (value.max) params.set(`${key}_max`, value.max);
      }
    });

    setSearchParams(params);
    dispatch(fetchTeachers(params.toString()));
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Flatten selectedSubjects object into an array
    const allSelectedSubjects = Object.values(selectedSubjects).flat();
    
    // Create updated filters object
    const updatedFilters = {
      ...filters,
      qualification: selectedQualifications,
      class_category: selectedClassCategories,
      subject: allSelectedSubjects,
    };
    
    // Update state
    setFilters(updatedFilters);
    
    // Build filter object for API (not query string!)
    const filterObject = {};
    
    // Add location-specific params
    filterObject.state = "Bihar"; // Always Bihar
    if (selectedDistrict) filterObject.district = selectedDistrict;
    if (pincode) filterObject.pincode = pincode;
    if (selectedPostOffice) filterObject.post_office = selectedPostOffice;
    if (area) filterObject.area = area;

    // Add subjects
    if (allSelectedSubjects.length > 0) {
      filterObject.subject = allSelectedSubjects;
    }

    // Add other filters
    Object.entries(updatedFilters).forEach(([key, value]) => {
      // Skip subject since we already added it
      if (key === 'subject') return;
      
      if (Array.isArray(value) && value.length > 0) {
        filterObject[key] = value;
      } else if (typeof value === "object" && (value.min || value.max)) {
        if (value.min) filterObject[`${key}_min`] = value.min;
        if (value.max) filterObject[`${key}_max`] = value.max;
      }
    });

    // Build URL params for browser URL
    const params = new URLSearchParams();
    Object.entries(filterObject).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
    
    // Pass object to fetchTeachers, not string!
    dispatch(fetchTeachers(filterObject));
    
    if (isMobile) setIsOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      city: [],
      pincode: [],
      block: [],
      village: [],
      state: [],
      qualification: [],
      class_category: [],
      subject: [],
      gender: [],
      job_type: [],
    });
    setSelectedQualifications([]);
    setSelectedClassCategories([]);
    setSelectedSubjects({});
    setSelectedDistrict("");
    setPincode("");
    setPostOffices([]);
    setSelectedPostOffice("");
    setArea("");
    setSearchParams(new URLSearchParams());
    dispatch(fetchTeachers(""));
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };


  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) count += value.length;
      else if (typeof value === "object" && (value.min || value.max)) count += 1;
    });
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:sticky top-0 h-[92vh] bg-white z-50 flex flex-col
          ${isMobile ? "w-80 shadow-2xl" : "w-72 border-r border-slate-200"}
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
          transition-transform duration-300 ease-in-out
        `}
        aria-label="Teacher filters sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-800">Filters</h2>
            {activeCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full" aria-label={`${activeCount} active filters`}>
                {activeCount}
              </span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
              aria-label="Close filters"
            >
              <FiX className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Sections - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Location Filter */}
          <FilterSection 
            title="Location" 
            icon={FiMapPin} 
            section="location"
            isExpanded={expandedSections.location}
            onToggle={() => toggleSection("location")}
          >
            <div className="space-y-4">
              {/* State - Dropdown with only Bihar */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                <select
                  value="Bihar"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-not-allowed"
                  aria-label="Select state"
                >
                  <option value="Bihar">Bihar</option>
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="Select district"
                >
                  <option value="">Select District</option>
                  {BIHAR_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pincode Input */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit pincode"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="Enter pincode"
                  maxLength="6"
                />
                {loadingPostOffices && (
                  <p className="text-xs text-slate-500 mt-1">Fetching post offices...</p>
                )}
              </div>

              {/* Post Office Dropdown (fetched from API) */}
              {postOffices.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Post Office</label>
                  <select
                    value={selectedPostOffice}
                    onChange={(e) => setSelectedPostOffice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    aria-label="Select post office"
                  >
                    <option value="">Select Post Office</option>
                    {postOffices.map((po, idx) => (
                      <option key={idx} value={po.Name}>
                        {po.Name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Area Input */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Enter area/locality"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  aria-label="Enter area"
                />
              </div>
            </div>
          </FilterSection>

          {/* Education Filter */}
          <FilterSection 
            title="Education" 
            icon={MdSchool} 
            section="education"
            isExpanded={expandedSections.education}
            onToggle={() => toggleSection("education")}
          >
            <div className="space-y-2">
              {qualification && qualification.length > 0 ? (
                qualification.map((qual) => (
                  <CheckboxItem
                    key={qual.id}
                    checked={selectedQualifications.includes(qual.name)}
                    onChange={() => {
                      setSelectedQualifications((prev) =>
                        prev.includes(qual.name)
                          ? prev.filter((q) => q !== qual.name)
                          : [...prev, qual.name]
                      );
                    }}
                    label={qual.name}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No qualifications available</p>
              )}
            </div>
          </FilterSection>

          {/* Class & Subject Filter */}
          <FilterSection 
            title="Class & Subjects" 
            icon={MdSchool} 
            section="classSubject"
            isExpanded={expandedSections.classSubject}
            onToggle={() => toggleSection("classSubject")}
          >
            <div className="space-y-3">
              {classCategories && classCategories.length > 0 ? (
                classCategories.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg p-3">
                    <CheckboxItem
                      checked={selectedClassCategories.includes(category.name)}
                      onChange={() => {
                        setSelectedClassCategories((prev) =>
                          prev.includes(category.name)
                            ? prev.filter((c) => c !== category.name)
                            : [...prev, category.name]
                        );
                      }}
                      label={category.name}
                    />
                    {category.subjects && category.subjects.length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
                        {category.subjects.map((subject) => (
                          <CheckboxItem
                            key={subject.id}
                            checked={
                              selectedSubjects[category.name]?.includes(subject.subject_name) || false
                            }
                            onChange={() => {
                              setSelectedSubjects((prev) => {
                                const categorySubjects = prev[category.name] || [];
                                return {
                                  ...prev,
                                  [category.name]: categorySubjects.includes(subject.subject_name)
                                    ? categorySubjects.filter((s) => s !== subject.subject_name)
                                    : [...categorySubjects, subject.subject_name],
                                };
                              });
                            }}
                            label={subject.subject_name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No class categories available</p>
              )}
            </div>
          </FilterSection>


          {/* Other Filters (Gender, Job Type) */}
          <FilterSection 
            title="Other" 
            icon={MdPeople} 
            section="other"
            isExpanded={expandedSections.other}
            onToggle={() => toggleSection("other")}
          >
            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Gender</label>
                <div className="space-y-2">
                  {["Male", "Female", "Other"].map((gender) => (
                    <CheckboxItem
                      key={gender}
                      checked={filters.gender.includes(gender.toLowerCase())}
                      onChange={() => {
                        setFilters((prev) => ({
                          ...prev,
                          gender: prev.gender.includes(gender.toLowerCase())
                            ? prev.gender.filter((g) => g !== gender.toLowerCase())
                            : [...prev.gender, gender.toLowerCase()],
                        }));
                      }}
                      label={gender}
                    />
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Job Type</label>
                <div className="space-y-2">
                  {teacherjobRole && teacherjobRole.length > 0 ? (
                    teacherjobRole.map((job) => (
                      <CheckboxItem
                        key={job.id}
                        checked={filters.job_type.includes(job.teacher_job_name)}
                        onChange={() => {
                          setFilters((prev) => ({
                            ...prev,
                            job_type: prev.job_type.includes(job.teacher_job_name)
                              ? prev.job_type.filter((j) => j !== job.teacher_job_name)
                              : [...prev.job_type, job.teacher_job_name],
                          }));
                        }}
                        label={job.teacher_job_name}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No job types available</p>
                  )}
                </div>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer - Sticky Buttons */}
        <div className="border-t border-slate-200 p-4 space-y-2 bg-white">
          <button
            onClick={handleApplyFilters}
            className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 hover:shadow-teal-300"
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            disabled={activeCount === 0}
            className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset all filters"
          >
            Reset All
          </button>
        </div>
      </aside>
    </>
  );
};

export default RecruiterSidebar;