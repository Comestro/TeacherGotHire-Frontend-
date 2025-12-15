import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiCrosshair,
} from "react-icons/fi";
import {
  MdSchool,
  MdWork,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdMale,
} from "react-icons/md";
import {
  getAllSkills,
  getQualification,
  getClassCategory,
  getTeacherjobType,
} from "../../../features/jobProfileSlice";
import { fetchTeachers } from "../../../features/teacherFilterSlice";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icon in React (if needed, though we use Circle)
import L from "leaflet";
// Map updater component to recenter map when coords change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};
const BIHAR_DISTRICTS = [
  "Araria",
  "Arwal",
  "Aurangabad",
  "Banka",
  "Begusarai",
  "Bhagalpur",
  "Bhojpur",
  "Buxar",
  "Darbhanga",
  "East Champaran",
  "Gaya",
  "Gopalganj",
  "Jamui",
  "Jehanabad",
  "Kaimur",
  "Katihar",
  "Khagaria",
  "Kishanganj",
  "Lakhisarai",
  "Madhepura",
  "Madhubani",
  "Munger",
  "Muzaffarpur",
  "Nalanda",
  "Nawada",
  "Patna",
  "Purnia",
  "Rohtas",
  "Saharsa",
  "Samastipur",
  "Saran",
  "Sheikhpura",
  "Sheohar",
  "Sitamarhi",
  "Siwan",
  "Supaul",
  "Vaishali",
  "West Champaran",
].sort();
const FilterSection = React.memo(
  ({ title, icon: Icon, section, isExpanded, onToggle, children }) => {
    return (
      <div className="border-b border-slate-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 bg-teal-600/30 hover:bg-teal-600/40 transition-colors group"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} filters`}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-teal-800" aria-hidden="true" />
            <span className="font-semibold text-teal-800 text-sm uppercase tracking-wide">
              {title}
            </span>
          </div>
          {isExpanded ? (
            <FiChevronUp className="w-4 h-4 text-teal-800" aria-hidden="true" />
          ) : (
            <FiChevronDown
              className="w-4 h-4 text-teal-800"
              aria-hidden="true"
            />
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
              <div className="px-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FilterSection.displayName = "FilterSection";
const CheckboxItem = React.memo(
  ({ checked, onChange, label, disabled = false }) => (
    <label className="flex items-center gap-1 py-1 cursor-pointer group hover:bg-slate-50  rounded transition-colors">
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
          <MdCheckBoxOutlineBlank
            className="w-5 h-5 text-slate-400 group-hover:text-teal-500"
            aria-hidden="true"
          />
        )}
      </div>
      <span
        className={`text-sm ${
          checked ? "text-teal-700 font-medium" : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </label>
  )
);

CheckboxItem.displayName = "CheckboxItem";

const RecruiterSidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { qualification, allSkill, classCategories, teacherjobRole } =
    useSelector((state) => state.jobProfile);
  const [filters, setFilters] = useState({
    city: [],
    pincode: [],
    block: [],
    village: [],
    state: ["Bihar"],
    qualification: [],
    class_category: [],
    subject: [],
    gender: [],
    job_type: [],
  });
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    location: false,
    education: false,
    classSubject: true,
    other: false,
  });
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [postOffices, setPostOffices] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState("");
  const [mapCoordinates, setMapCoordinates] = useState(null); // { lat, lng }

  const [loadingPostOffices, setLoadingPostOffices] = useState(false);

  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [selectedClassCategories, setSelectedClassCategories] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    dispatch(getAllSkills());
    dispatch(getQualification());
    dispatch(getClassCategory());
    dispatch(getTeacherjobType());
  }, [dispatch]);
  const pendingAutoSelectPORef = useRef(null);

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      setLoadingPostOffices(true);
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]?.Status === "Success") {
            const offices = data[0].PostOffice || [];
            setPostOffices(offices);

            // Auto-select PO if pending match exists
            if (pendingAutoSelectPORef.current) {
              const target = pendingAutoSelectPORef.current.toLowerCase();
              const match = offices.find(
                (po) =>
                  po.Name.toLowerCase().includes(target) ||
                  target.includes(po.Name.toLowerCase())
              );
              if (match) {
                setSelectedPostOffice(match.Name);
              }
              pendingAutoSelectPORef.current = null; // Clear after attempt
            }
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

  // Effect to geocode manual district selection
  useEffect(() => {
    if (selectedDistrict && !detectingLocation) {
      // Only fetch if we don't have precise coords or if checking district center
      // Actually, let's just fetch center of district for visualization if not auto-detected recently
      // Debounce or just fetch
      const fetchDistrictCoords = async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${selectedDistrict},Bihar&format=json&limit=1`
          );
          const data = await res.json();
          if (data && data.length > 0) {
            setMapCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        } catch (e) {
          console.error("Failed to geocode district", e);
        }
      };
      // Only if mapCoordinates is null (don't overwrite precise GPS) or if we want to follow selection?
      // Let's overwrite so map follows content. But User might have GPS'd then changed district.
      // If user explicitly changes district, map should probably move.
      // I'll add a check or just let it update.
      fetchDistrictCoords();
    }
  }, [selectedDistrict]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);
  const hasLoadedUrlParams = useRef(false);
  useEffect(() => {
    if (hasLoadedUrlParams.current) return;
    const newFilters = {
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
    };

    const getList = (key) => {
      const val = searchParams.get(key);
      return val ? val.split(",").filter(Boolean) : [];
    };
    [
      "city",
      "pincode",
      "block",
      "village",
      "state",
      "qualification",
      "gender",
      "job_type",
    ].forEach((key) => {
      if (searchParams.has(key)) newFilters[key] = getList(key);
    });
    if (searchParams.has("district"))
      setSelectedDistrict(searchParams.get("district"));
    if (searchParams.has("pincode")) setPincode(searchParams.get("pincode"));
    if (searchParams.has("post_office"))
      setSelectedPostOffice(searchParams.get("post_office"));
    if (classCategories && classCategories.length > 0) {
      const urlCategories = getList("class_category");
      let initialSelectedCategories = [];

      if (urlCategories.length > 0) {
        initialSelectedCategories = urlCategories
          .map((val) => {
            if (!isNaN(val)) {
              const cat = classCategories.find(
                (c) => c.id?.toString() === val.toString()
              );
              return cat ? cat.name : null;
            }
            const catByName = classCategories.find(
              (c) => c.name.toLowerCase() === val.toLowerCase()
            );
            return catByName ? catByName.name : val;
          })
          .filter(Boolean); // Remove nulls
        initialSelectedCategories = [...new Set(initialSelectedCategories)];

        setSelectedClassCategories(initialSelectedCategories);
        newFilters.class_category = initialSelectedCategories;
        setExpandedSections((prev) => ({ ...prev, classSubject: false }));
      }
      const urlSubjects =
        getList("subject").length > 0 ? getList("subject") : getList("subject");

      if (urlSubjects.length > 0) {
        const newSelectedSubjects = {};
        const normalize = (str) => str.toString().toLowerCase().trim();

        urlSubjects.forEach((val) => {
          const isSubId = !isNaN(val);
          const categoriesToSearch =
            initialSelectedCategories.length > 0
              ? classCategories.filter((c) =>
                  initialSelectedCategories.includes(c.name)
                )
              : classCategories;

          for (const cat of categoriesToSearch) {
            if (!cat.subjects) continue;

            const foundSub = cat.subjects.find((s) =>
              isSubId
                ? s.id?.toString() === val.toString()
                : normalize(s.subject_name) === normalize(val)
            );

            if (foundSub) {
              if (!newSelectedSubjects[cat.name]) {
                newSelectedSubjects[cat.name] = [];
              }
              if (
                !newSelectedSubjects[cat.name].includes(foundSub.subject_name)
              ) {
                newSelectedSubjects[cat.name].push(foundSub.subject_name);
              }
              if (!initialSelectedCategories.includes(cat.name)) {
                initialSelectedCategories.push(cat.name);
                setSelectedClassCategories((prev) => {
                  if (!prev.includes(cat.name)) return [...prev, cat.name];
                  return prev;
                });
                newFilters.class_category = initialSelectedCategories;
              }
              setExpandedCategories((prev) => ({ ...prev, [cat.name]: true }));
            }
          }
        });
        setSelectedSubjects(newSelectedSubjects);
        newFilters.subject = urlSubjects;
      }
      hasLoadedUrlParams.current = true;
    } else if (
      !searchParams.has("class_category") &&
      !searchParams.has("subject") &&
      !searchParams.has("subject")
    ) {
      hasLoadedUrlParams.current = true;
    }

    setFilters(newFilters);
  }, [searchParams, classCategories]);
  const syncFiltersToURL = () => {
    const params = new URLSearchParams();
    params.set("state", "Bihar"); // Always Bihar
    if (selectedDistrict) params.set("district", selectedDistrict);
    if (pincode) params.set("pincode", pincode);
    if (selectedPostOffice) params.set("post_office", selectedPostOffice);

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length === 0) return;
      if (!value) return;

      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else if (typeof value === "object" && (value.min || value.max)) {
        if (value.min) params.set(`${key}_min`, value.min);
        if (value.max) params.set(`${key}_max`, value.max);
      }
    });

    setSearchParams(params);
    dispatch(fetchTeachers(filters)); // Pass object, not string
  };
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (selectedDistrict && errors.district) {
      setErrors((prev) => ({ ...prev, district: false }));
    }
    if (pincode && errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: false }));
    }
    if (selectedClassCategories.length > 0 && errors.classCategories) {
      setErrors((prev) => ({ ...prev, classCategories: false }));
    }
    if (filters.job_type.length > 0 && errors.jobType) {
      setErrors((prev) => ({ ...prev, jobType: false }));
    }
  }, [
    selectedDistrict,
    pincode,
    selectedClassCategories,
    filters.job_type,
    errors,
  ]);

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = (isAuto = false) => {
    if (!navigator.geolocation) {
      if (!isAuto) toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setMapCoordinates({ lat: latitude, lng: longitude });

          // Using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`
          );
          const data = await response.json();

          if (data && data.address) {
            const { postcode, state_district, county, state } = data.address;

            // Prioritize state_district, fall back to county
            const district = state_district || county || "";
            const zip = postcode || "";

            if (state === "Bihar" || state?.toLowerCase() === "bihar") {
              // Valid state logic if needed
            }

            if (district) {
              let cleanDistrict = district.replace(/ District/i, "").trim();
              console.log(
                "Detected District Raw:",
                district,
                "Clean:",
                cleanDistrict
              );

              // Handle common Nominatim vs Bihar Districts naming differences
              const aliases = {
                "Purba Champaran": "East Champaran",
                "Pashchim Champaran": "West Champaran",
                "Kaimur (Bhabua)": "Kaimur",
              };
              cleanDistrict = aliases[cleanDistrict] || cleanDistrict;

              const match = BIHAR_DISTRICTS.find(
                (d) => d.toLowerCase() === cleanDistrict.toLowerCase()
              );
              if (match) {
                setSelectedDistrict(match);
              } else {
                // Try partial match if no exact match
                const partialMatch = BIHAR_DISTRICTS.find(
                  (d) =>
                    cleanDistrict.toLowerCase().includes(d.toLowerCase()) ||
                    d.toLowerCase().includes(cleanDistrict.toLowerCase())
                );
                if (partialMatch) setSelectedDistrict(partialMatch);
                else {
                  console.log(
                    "No matching district found in list for:",
                    cleanDistrict
                  );
                }
              }
            }

            if (zip) {
              setPincode(zip);
            }

            if (!isAuto) {
              toast.success("Location detected successfully!");
            }
          } else {
            if (!isAuto) toast.error("Could not fetch address details.");
          }
        } catch (error) {
          console.error("Location detection error:", error);
          if (!isAuto) toast.error("Failed to detect location.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetectingLocation(false);
        if (!isAuto) {
          let msg = "Unable to retrieve your location.";
          if (error.code === 1) msg = "User denied geolocation permission.";
          toast.error(msg);
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const hasAutoDetectedRef = useRef(false);
  useEffect(() => {
    if (
      !hasAutoDetectedRef.current &&
      !selectedDistrict &&
      !pincode &&
      !searchParams.has("pincode")
    ) {
      hasAutoDetectedRef.current = true;
      handleDetectLocation(true);
    }
  }, []);

  const handleApplyFilters = () => {
    const newErrors = {};
    if (!selectedDistrict) newErrors.district = true;
    if (!pincode) newErrors.pincode = true;
    if (selectedClassCategories.length === 0) newErrors.classCategories = true;
    if (filters.job_type.length === 0) newErrors.jobType = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setExpandedSections((prev) => ({
        ...prev,
        jobType: true,
        location: true,
        classSubject: true,
      }));
      return;
    }
    const allSelectedSubjects = Object.values(selectedSubjects).flat();
    const updatedFilters = {
      ...filters,
      qualification: selectedQualifications,
      class_category: selectedClassCategories,
      subject: allSelectedSubjects,
    };
    setFilters(updatedFilters);
    const filterObject = {};
    filterObject.state = "Bihar"; // Always Bihar
    if (selectedDistrict) filterObject.district = selectedDistrict;
    if (pincode) filterObject.pincode = pincode;
    if (selectedPostOffice) filterObject.post_office = selectedPostOffice;
    if (allSelectedSubjects.length > 0) {
      filterObject.subject = allSelectedSubjects;
    }
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (key === "subject") return;

      if (Array.isArray(value) && value.length > 0) {
        filterObject[key] = value;
      } else if (typeof value === "object" && (value.min || value.max)) {
        if (value.min) filterObject[`${key}_min`] = value.min;
        if (value.max) filterObject[`${key}_max`] = value.max;
      }
    });
    const params = new URLSearchParams();
    Object.entries(filterObject).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
    dispatch(fetchTeachers(filterObject));

    if (isMobile) setIsOpen(false);
  };
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
    setExpandedSections((prev) => ({ ...prev, classSubject: true }));
    setSearchParams(new URLSearchParams());
    dispatch(fetchTeachers({ state: "Bihar" }));
  };
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) count += value.length;
      else if (typeof value === "object" && (value.min || value.max))
        count += 1;
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
          fixed md:sticky top-0 md:top-16 h-screen md:h-[calc(100vh-4rem)] bg-white z-[60] md:z-30 flex flex-col
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
              <span
                className="ml-2 px-2 py-0.5 bg-teal-600 text-white text-xs font-semibold rounded-full"
                aria-label={`${activeCount} active filters`}
              >
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
          {/* Job Type Filter (Required, Top) */}
          <FilterSection
            title="Job Type"
            icon={MdWork}
            section="jobType"
            isExpanded={expandedSections.jobType}
            onToggle={() => toggleSection("jobType")}
          >
            <div className="space-y-2">
              {teacherjobRole && teacherjobRole.length > 0 ? (
                teacherjobRole.map((role) => (
                  <CheckboxItem
                    key={role.id}
                    checked={filters.job_type.includes(role.id.toString())}
                    onChange={() => {
                      const strId = role.id.toString();
                      const isSelected = filters.job_type.includes(strId);
                      // Single Selection Logic:
                      // If selected, deselect it (empty array).
                      // If not selected, select ONLY this one (replace array).
                      const newJobTypes = isSelected ? [] : [strId];

                      setFilters((prev) => ({
                        ...prev,
                        job_type: newJobTypes,
                      }));
                      if (newJobTypes.length > 0) {
                        setErrors((prev) => ({ ...prev, jobType: false }));
                      }
                    }}
                    label={role.teacher_job_name}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No job types available
                </p>
              )}
              {errors.jobType && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs mt-2">
                  Please select at least one job type
                </div>
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
            <div className="space-y-0">
              {classCategories && classCategories.length > 0 ? (
                classCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`transition-all duration-200 border-b py-2 ${
                      selectedClassCategories.includes(category.name)
                        ? "border-teal-200 bg-teal-50/30"
                        : "border-slate-200 hover:border-teal-100"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => {
                        if (category.subjects && category.subjects.length > 0) {
                          setExpandedCategories((prev) => ({
                            ...prev,
                            [category.name]: !prev[category.name],
                          }));
                        }
                      }}
                    >
                      <span
                        className={`font-medium text-sm transition-colors ${
                          selectedClassCategories.includes(category.name)
                            ? "text-teal-700"
                            : "text-slate-700 group-hover:text-teal-600"
                        }`}
                      >
                        {category.name}
                      </span>

                      {category.subjects && category.subjects.length > 0 && (
                        <div
                          className={`rounded-full transition-all ${
                            expandedCategories[category.name]
                              ? "bg-teal-100 text-teal-700 rotate-180"
                              : "group-hover:bg-slate-100 text-slate-400 group-hover:text-teal-600"
                          }`}
                        >
                          <FiChevronDown className="w-5 h-5 transition-transform duration-200" />
                        </div>
                      )}
                    </div>

                    {/* Collapsible Subjects Area */}
                    <AnimatePresence>
                      {expandedCategories[category.name] &&
                        category.subjects &&
                        category.subjects.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-slate-100/80">
                              {category.subjects.map((subject) => (
                                <div key={subject.id} className="">
                                  <CheckboxItem
                                    checked={(
                                      selectedSubjects[category.name] || []
                                    ).includes(subject.subject_name)}
                                    onChange={() => {
                                      // Single Selection Logic for Subject & Class Category
                                      const currentCategorySubjects =
                                        selectedSubjects[category.name] || [];
                                      const isSubjectSelected =
                                        currentCategorySubjects.includes(
                                          subject.subject_name
                                        );

                                      if (isSubjectSelected) {
                                        // Deselecting: Clear everything explicitly to be safe, or just this one
                                        // User request: "only one" implies if I uncheck, I have nothing.
                                        setSelectedSubjects({});
                                        setSelectedClassCategories([]);
                                      } else {
                                        // Selecting NEW subject:
                                        // 1. Replace all subjects with ONLY this one
                                        setSelectedSubjects({
                                          [category.name]: [
                                            subject.subject_name,
                                          ],
                                        });
                                        // 2. Replace all class categories with ONLY this one
                                        setSelectedClassCategories([
                                          category.name,
                                        ]);

                                        // Auto-expand next section
                                        if (!expandedSections.location) {
                                          setTimeout(() => {
                                            setExpandedSections((prev) => ({
                                              ...prev,
                                              classSubject: false,
                                              location: true,
                                            }));
                                          }, 800);
                                        }
                                      }
                                    }}
                                    label={subject.subject_name}
                                  />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No class categories available
                </p>
              )}
              {errors.classCategories && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs mt-2">
                  Please select at least one class category
                </div>
              )}
            </div>
          </FilterSection>

          {/* Location Filter */}
          <FilterSection
            title="Location"
            icon={FiMapPin}
            section="location"
            isExpanded={expandedSections.location}
            onToggle={() => toggleSection("location")}
          >
            <div className="space-y-2 py-2">
              {/* State - Dropdown with only Bihar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-600">
                    State
                  </label>
                  <button
                    onClick={() => handleDetectLocation(false)}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-semibold bg-teal-100 mb-1 hover:bg-teal-200 px-3 py-2 rounded transition-colors disabled:opacity-50"
                    title="Auto-detect location from browser"
                  >
                    {detectingLocation ? (
                      <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCrosshair className="w-3 h-3" />
                    )}
                    {detectingLocation ? "Detecting..." : "Detect Location"}
                  </button>
                </div>
                <select
                  value="Bihar"
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-not-allowed"
                  aria-label="Select state"
                >
                  <option value="Bihar">Bihar</option>
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.district
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  }`}
                  aria-label="Select district"
                >
                  <option value="">Select District</option>
                  {BIHAR_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1">
                    District is required
                  </p>
                )}
              </div>

              {/* Pincode Input */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit pincode"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.pincode
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  }`}
                  aria-label="Enter pincode"
                  maxLength="6"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-1">
                    Pincode is required
                  </p>
                )}
                {loadingPostOffices && (
                  <p className="text-xs text-slate-500 mt-1">
                    Fetching post offices...
                  </p>
                )}
              </div>

              {/* Post Office Dropdown (fetched from API) */}
              {postOffices.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Near Area
                  </label>
                  <select
                    value={selectedPostOffice}
                    onChange={(e) => setSelectedPostOffice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    aria-label="Select area"
                  >
                    <option value="">Select Area</option>
                    {postOffices.map((po, idx) => (
                      <option key={idx} value={po.Name}>
                        {po.Name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Map Preview */}
              {mapCoordinates && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                  <MapContainer
                    center={mapCoordinates}
                    zoom={13}
                    style={{ height: "200px", width: "100%" }}
                    className="z-0"
                  >
                    <MapUpdater center={mapCoordinates} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Circle
                      center={mapCoordinates}
                      pathOptions={{ fillColor: "blue", color: "blue" }}
                      radius={1500}
                    />
                  </MapContainer>
                </div>
              )}
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
                <p className="text-sm text-slate-400 italic">
                  No qualifications available
                </p>
              )}
            </div>
          </FilterSection>

          {/* Other Filters (Gender, Job Type) */}
          <FilterSection
            title="Gender"
            icon={MdMale}
            section="other"
            isExpanded={expandedSections.other}
            onToggle={() => toggleSection("other")}
          >
            <div className="space-y-2 mt-2">
              {/* Gender */}
              <div className="">
                {["Male", "Female", "Other"].map((gender) => (
                  <CheckboxItem
                    key={gender}
                    checked={filters.gender.includes(gender.toLowerCase())}
                    onChange={() => {
                      setFilters((prev) => ({
                        ...prev,
                        gender: prev.gender.includes(gender.toLowerCase())
                          ? prev.gender.filter(
                              (g) => g !== gender.toLowerCase()
                            )
                          : [...prev.gender, gender.toLowerCase()],
                      }));
                    }}
                    label={gender}
                  />
                ))}
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer - Sticky Buttons */}
        <div className="border-t gap-4 flex flex-row-reverse border-slate-200 p-2 bg-white">
          <button
            onClick={handleApplyFilters}
            className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all shadow-lg "
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            disabled={activeCount === 0}
            className="w-full px-4 py-2 bg-slate-400 text-slate-100 font-medium rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </aside>
    </>
  );
};

export default RecruiterSidebar;
