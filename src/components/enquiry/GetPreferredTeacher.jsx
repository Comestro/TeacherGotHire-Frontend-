import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { useState, useEffect } from "react";
import {
  FiBook,
  FiMapPin,
  FiCheck,
  FiArrowLeft,
  FiBriefcase,
  FiUser,
  FiSearch,
  FiChevronRight,
  FiCrosshair,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTeacherjobType } from "../../features/jobProfileSlice";
import EnquiryHeader from "./components/EnquiryHeader";
import ErrorMessage from "../ErrorMessage";

export const GetPreferredTeacher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiClient = axios.create({
    baseURL: getApiUrl(),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [jobTypes, setJobTypes] = useState([]);
  const [classCategories, setClassCategories] = useState([]);
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedClassCategory, setSelectedClassCategory] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [pincode, setPincode] = useState("");
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [postOffices, setPostOffices] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState("");
  const [locationDetails, setLocationDetails] = useState({
    state: "Bihar", // Default fixed to Bihar as requested
    district: "",
    city: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const { teacherjobRole } = useSelector((state) => state.jobProfile);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catResponse = await apiClient.get("/api/public/classcategory/");
        setClassCategories(catResponse.data);
        dispatch(getTeacherjobType());

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (teacherjobRole) {
      setJobTypes(teacherjobRole);
    }
  }, [teacherjobRole]);

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((s) => s !== subjectId)
        : [...prev, subjectId]
    );
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
  ];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser",
      });
      return;
    }

    setLoadingPincode(true);
    setMessage({ type: "success", text: "Detecting location..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const { postcode, state_district, county } = data.address;
            const district = state_district || county || "";
            const zip = postcode || "";

            let detectedDistrict = "";
            if (district) {
              const cleanDistrict = district.replace(/ District/i, "").trim();
              const match = BIHAR_DISTRICTS.find(
                (d) => d.toLowerCase() === cleanDistrict.toLowerCase()
              );
              if (match) detectedDistrict = match;
            }

            if (zip) {
              setPincode(zip);

              const piResponse = await axios.get(
                `https://api.postalpincode.in/pincode/${zip}`
              );
              if (piResponse.data && piResponse.data[0].Status === "Success") {
                const offices = piResponse.data[0].PostOffice;
                if (offices.length > 0) {
                  setPostOffices(offices);
                  setLocationDetails((prev) => ({
                    ...prev,
                    district: offices[0].District,
                    state: offices[0].State,
                  }));
                  setMessage({
                    text: "Location detected successfully!",
                    type: "success",
                  });
                } else {
                  // If no post offices, at least keep the district we found from Nominatim
                  if (detectedDistrict) {
                    setLocationDetails((prev) => ({
                      ...prev,
                      district: detectedDistrict,
                    }));
                  }
                  setMessage({
                    text: "Location detected (partial data).",
                    type: "success",
                  });
                }
              } else {
                // Fallback if PostOffice API fails
                if (detectedDistrict) {
                  setLocationDetails((prev) => ({
                    ...prev,
                    district: detectedDistrict,
                  }));
                }
                setMessage({
                  text: "Location detected from map.",
                  type: "success",
                });
              }
            } else {
              if (detectedDistrict) {
                setLocationDetails((prev) => ({
                  ...prev,
                  district: detectedDistrict,
                }));
                setMessage({
                  text: "District detected. Please enter pincode.",
                  type: "success",
                });
              } else {
                setMessage({
                  text: "Could not determine precise location.",
                  type: "warning",
                });
              }
            }
          }
        } catch (error) {
          console.error(error);
          setMessage({ text: "Failed to detect location.", type: "error" });
        } finally {
          setLoadingPincode(false);
        }
      },
      (error) => {
        setMessage({ text: "Unable to retrieve location.", type: "error" });
        setLoadingPincode(false);
      }
    );
  };

  const handlePincodeChange = async (e) => {
    const enteredPincode = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(enteredPincode);
    setMessage({ text: "", type: "" }); // Clear previous messages

    if (enteredPincode.length === 6) {
      setLoadingPincode(true);
      try {
        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${enteredPincode}`
        );
        if (response.data[0].Status === "Success") {
          const offices = response.data[0].PostOffice;
          if (offices.length > 0) {
            setPostOffices(offices);
            setLocationDetails((prev) => ({
              ...prev,
              district: offices[0].District,
              state: offices[0].State,
            }));
            setMessage({ text: "Location details found!", type: "success" });
          } else {
            setMessage({
              text: "No post offices found for this pincode",
              type: "warning",
            });
            setPostOffices([]);
          }
        } else {
          setMessage({ text: "Invalid pincode entered", type: "error" });
          setPostOffices([]);
        }
      } catch (error) {
        setMessage({ text: "Failed to fetch pincode details", type: "error" });
        setPostOffices([]);
      } finally {
        setLoadingPincode(false);
      }
    } else {
      setPostOffices([]);
      setLocationDetails((prev) => ({ ...prev, city: "", area: "" }));
    }
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    // Ensure singular keys as requested
    if (locationDetails.state)
      queryParams.append("state", locationDetails.state);
    if (locationDetails.district)
      queryParams.append("district", locationDetails.district);
    if (pincode) queryParams.append("pincode", pincode);
    if (selectedPostOffice)
      queryParams.append("post_office", selectedPostOffice);

    if (selectedSubjects.length > 0) {
      // Using 'subject' key instead of 'subjects'
      const subjectNames = selectedSubjects.map((id) => {
        const cat = classCategories.find(
          (c) => c.id === parseInt(selectedClassCategory)
        );
        const sub = cat?.subjects?.find((s) => s.id === id);
        return sub ? sub.subject_name : id;
      });
      queryParams.append("subject", subjectNames.join(","));
    }

    if (selectedClassCategory) {
      // Using 'class_category' key
      const cat = classCategories.find(
        (c) => c.id === parseInt(selectedClassCategory)
      );
      if (cat) queryParams.append("class_category", cat.name);
      else queryParams.append("class_category", selectedClassCategory);
    }

    // Additional parameters if needed
    if (selectedJobType) queryParams.append("job_type", selectedJobType);

    navigate(`/recruiter?${queryParams.toString()}`);
  };

  const getSelectedCategorySubjects = () => {
    const category = classCategories.find(
      (c) => c.id === parseInt(selectedClassCategory)
    );
    return category ? category.subjects : [];
  };

  const steps = [
    { title: "Job Type", icon: FiBriefcase, desc: "Select Role" },
    { title: "Class", icon: FiBook, desc: "Select Level" },
    { title: "Subject", icon: FiSearch, desc: "Choose Subjects" },
    { title: "Location", icon: FiMapPin, desc: "Set Location" },
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] bg-white flex flex-col md:flex-row">
      {/* Mobile Header / Progress - Visible only on Mobile */}
      <div className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold">Find Your Teacher</h1>
          <span className="text-[10px] font-medium bg-slate-800 px-2 py-0.5 rounded-full text-teal-400">
            Step {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Mobile Progress Bar */}
        <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Current Step Label */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
          {steps[currentStep].icon({ size: 14, className: "text-teal-400" })}
          <span>{steps[currentStep].title}</span>
        </div>
      </div>

      {/* Left Sidebar / Progress Panel - Hidden on Mobile, Fixed on Desktop */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-slate-900 text-white flex-col justify-between relative overflow-hidden flex-shrink-0 md:h-[92vh] md:sticky md:top-0">
        {/* Decorative Circle */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Find Your Teacher</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Complete the steps to find the perfect match for your
              requirements.
            </p>
          </div>

          <div className="space-y-6 flex-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 relative group"
              >
                {/* Connecting Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-8 w-0.5 h-10 md:h-12 ${
                      index < currentStep ? "bg-teal-500" : "bg-slate-800"
                    }`}
                  ></div>
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    index === currentStep
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110"
                      : index < currentStep
                      ? "bg-teal-500/20 text-teal-400"
                      : "bg-slate-800 text-slate-600 group-hover:bg-slate-700"
                  }`}
                >
                  {index < currentStep ? (
                    <FiCheck size={16} />
                  ) : (
                    <step.icon size={14} />
                  )}
                </div>

                <div
                  className={`transition-all duration-300 pt-1.5 ${
                    index === currentStep
                      ? "opacity-100 translate-x-0"
                      : "opacity-50"
                  }`}
                >
                  <h3
                    className={`font-semibold text-sm ${
                      index === currentStep ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 italic">
              "Connecting qualified teachers with great opportunities."
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Panel - Scrollable */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="flex-1 flex flex-col justify-start px-4 py-6 max-w-5xl mx-auto w-full">
          <ErrorMessage
            message={message.text}
            type={message.type}
            onDismiss={() => setMessage({ text: "", type: "" })}
          />

          {/* Step 0: Job Type Selection */}
          {currentStep === 0 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  What are you looking for?
                </h2>
                <p className="text-sm text-slate-500">
                  Select the type of teaching role you need.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedJobType(type.teacher_job_name);
                      setCurrentStep(1);
                    }}
                    className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                      selectedJobType === type.teacher_job_name
                        ? "border-teal-500 bg-white ring-2 ring-teal-500/10 shadow-md shadow-teal-500/10"
                        : "border-slate-200 bg-white hover:border-teal-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            selectedJobType === type.teacher_job_name
                              ? "bg-teal-50 text-teal-600"
                              : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500"
                          }`}
                        >
                          <FiBriefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors mb-0.5">
                            {type.teacher_job_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Find teachers for {type.teacher_job_name}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          selectedJobType === type.teacher_job_name
                            ? "bg-teal-500 text-white"
                            : "bg-slate-50 text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-500"
                        }`}
                      >
                        <FiChevronRight size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Class Category Selection */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Select Class Level
                </h2>
                <p className="text-sm text-slate-500">
                  Which class category should the teacher be qualified for?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {classCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedClassCategory(category.id);
                      setCurrentStep(2);
                    }}
                    className={`group p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md ${
                      selectedClassCategory === category.id
                        ? "border-teal-500 bg-white ring-2 ring-teal-500/10 shadow-sm"
                        : "border-slate-200 bg-white hover:border-teal-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          selectedClassCategory === category.id
                            ? "bg-teal-50 text-teal-600"
                            : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500"
                        }`}
                      >
                        <FiBook size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-700 group-hover:text-teal-700 transition-colors">
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Subject Selection */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Choose Subjects
                </h2>
                <p className="text-sm text-slate-500">
                  Select all the subjects you need assistance with.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {getSelectedCategorySubjects().map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                        selectedSubjects.includes(subject.id)
                          ? "border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/20 scale-105"
                          : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-slate-50"
                      }`}
                    >
                      {subject.subject_name}
                      {selectedSubjects.includes(subject.id) && (
                        <FiCheck size={14} className="text-white" />
                      )}
                    </button>
                  ))}
                  {getSelectedCategorySubjects().length === 0 && (
                    <div className="w-full text-center py-10">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBook className="text-slate-300" size={24} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        No subjects available for this category.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location Details */}
          {currentStep === 3 && (
            <div className="animate-fade-in space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Location Details
                </h2>
                <p className="text-sm text-slate-500">
                  Where would you like to find the teacher?
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  {/* State */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        State
                      </label>
                      <button
                        onClick={handleDetectLocation}
                        className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded transition-colors"
                        title="Auto-detect location"
                      >
                        <FiCrosshair /> Detect
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={locationDetails.state}
                        readOnly
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-semibold cursor-not-allowed"
                      />
                      <FiMapPin
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                    </div>
                  </div>

                  {/* District Selection */}
                  <div className="group mt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      District <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={locationDetails.district}
                        onChange={(e) =>
                          setLocationDetails({
                            ...locationDetails,
                            district: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select District</option>
                        {BIHAR_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                      />
                      {loadingPincode ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                      ) : (
                        <div
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-colors ${
                            pincode.length === 6
                              ? "bg-green-500"
                              : "bg-slate-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Post Office - Moved Inside Grid */}
                  {postOffices.length > 0 && (
                    <div className="group">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Post Office
                        </label>
                        <div className="relative">
                          <select
                            value={selectedPostOffice}
                            onChange={(e) =>
                              setSelectedPostOffice(e.target.value)
                            }
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Select Post Office</option>
                            {postOffices.map((po, idx) => (
                              <option key={idx} value={po.Name}>
                                {po.Name}
                              </option>
                            ))}
                          </select>
                          <FiChevronDown
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={20}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Sticky Bottom */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 flex justify-between items-center sticky bottom-0 z-20">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              currentStep === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FiArrowLeft size={18} /> Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={
                (currentStep === 0 && !selectedJobType) ||
                (currentStep === 1 && !selectedClassCategory) ||
                (currentStep === 2 && selectedSubjects.length === 0)
              }
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              Next Step <FiChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={
                !locationDetails.state || !locationDetails.district || !pincode
              }
              className="bg-teal-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Find Teachers <FiSearch size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const FiChevronDown = ({ className }) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
