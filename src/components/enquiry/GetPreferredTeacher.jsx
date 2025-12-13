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
  FiChevronRight
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
    area: ""
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
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", 
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", 
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", 
    "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", 
    "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", 
    "Supaul", "Vaishali", "West Champaran"
  ];

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
            setLocationDetails(prev => ({
              ...prev,
              district: offices[0].District,
              state: offices[0].State 
            }));
            setMessage({ text: "Location details found!", type: "success" });
          } else {
            setMessage({ text: "No post offices found for this pincode", type: "warning" });
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
      setLocationDetails(prev => ({ ...prev, city: "", area: "" }));
    }
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    
    if (selectedJobType) queryParams.append("job_type", selectedJobType);
    if (selectedClassCategory) queryParams.append("class_category", selectedClassCategory);
    if (selectedSubjects.length > 0) queryParams.append("subject", selectedSubjects.join(","));
    if (locationDetails.state) queryParams.append("state", locationDetails.state);
    if (locationDetails.district) queryParams.append("district", locationDetails.district);
    if (pincode) queryParams.append("pincode", pincode);
    if (selectedPostOffice) queryParams.append("post_office", selectedPostOffice);
    if (locationDetails.area) queryParams.append("area", locationDetails.area);
    navigate(`/recruiter?${queryParams.toString()}`);
  };

  const getSelectedCategorySubjects = () => {
    const category = classCategories.find(c => c.id === parseInt(selectedClassCategory));
    return category ? category.subjects : [];
  };

  const steps = [
    { title: 'Job Type', icon: FiBriefcase, desc: 'Select Role' },
    { title: 'Class', icon: FiBook, desc: 'Select Level' },
    { title: 'Subject', icon: FiSearch, desc: 'Choose Subjects' },
    { title: 'Location', icon: FiMapPin, desc: 'Set Location' }
  ];

  return (
    <div className="min-h-[calc(100vh-150px)] bg-white flex flex-col md:flex-row">
      
      {/* Mobile Header / Progress - Visible only on Mobile */}
      <div className="md:hidden bg-slate-900 text-white p-6 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Find Your Teacher</h1>
          <span className="text-xs font-medium bg-slate-800 px-3 py-1 rounded-full text-teal-400">
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
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          {steps[currentStep].icon({ size: 16, className: "text-teal-400" })}
          <span>{steps[currentStep].title}</span>
        </div>
      </div>

      {/* Left Sidebar / Progress Panel - Hidden on Mobile, Fixed on Desktop */}
      <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-slate-900 text-white flex-col justify-between relative overflow-hidden flex-shrink-0 md:h-[92vh] md:sticky md:top-0">
        {/* Decorative Circle */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3">Find Your Teacher</h1>
            <p className="text-slate-400 text-sm leading-relaxed">Complete the steps to find the perfect match for your requirements.</p>
          </div>

          <div className="space-y-8 flex-1">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 relative group">
                {/* Connecting Line */}
                {index !== steps.length - 1 && (
                  <div className={`absolute left-[19px] top-10 w-0.5 h-12 md:h-16 ${
                    index < currentStep ? 'bg-teal-500' : 'bg-slate-800'
                  }`}></div>
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  index === currentStep 
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-110' 
                    : index < currentStep 
                      ? 'bg-teal-500/20 text-teal-400' 
                      : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700'
                }`}>
                  {index < currentStep ? <FiCheck size={20} /> : <step.icon size={18} />}
                </div>
                
                <div className={`transition-all duration-300 pt-2 ${
                  index === currentStep ? 'opacity-100 translate-x-0' : 'opacity-50'
                }`}>
                  <h3 className={`font-semibold text-base ${
                    index === currentStep ? 'text-white' : 'text-slate-300'
                  }`}>{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-800">
            <p className="text-xs text-slate-500 italic">
              "Connecting qualified teachers with great opportunities."
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Panel - Scrollable */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="flex-1 flex flex-col justify-start px-4 py-7 max-w-5xl mx-auto w-full">
          
          <ErrorMessage 
            message={message.text} 
            type={message.type} 
            onDismiss={() => setMessage({ text: "", type: "" })} 
          />

          {/* Step 0: Job Type Selection */}
          {currentStep === 0 && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">What are you looking for?</h2>
                <p className="text-lg text-slate-500">Select the type of teaching role you need.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedJobType(type.teacher_job_name);
                      setCurrentStep(1);
                    }}
                    className={`group relative p-8 rounded-3xl border-2 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      selectedJobType === type.teacher_job_name
                        ? "border-teal-500 bg-white ring-4 ring-teal-500/10 shadow-lg shadow-teal-500/10"
                        : "border-white bg-white hover:border-teal-100 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                          selectedJobType === type.teacher_job_name 
                            ? "bg-teal-50 text-teal-600" 
                            : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500"
                        }`}>
                          <FiBriefcase size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-slate-900 group-hover:text-teal-700 transition-colors mb-1">
                            {type.teacher_job_name}
                          </h4>
                          <p className="text-sm text-slate-500 font-medium">Find teachers for {type.teacher_job_name}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                         selectedJobType === type.teacher_job_name ? "bg-teal-500 text-white" : "bg-slate-50 text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-500"
                      }`}>
                        <FiChevronRight size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Class Category Selection */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Select Class Level</h2>
                <p className="text-lg text-slate-500">Which class category should the teacher be qualified for?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {classCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedClassCategory(category.id);
                      setCurrentStep(2);
                    }}
                    className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedClassCategory === category.id
                        ? "border-teal-500 bg-white ring-4 ring-teal-500/10 shadow-md"
                        : "border-white bg-white hover:border-teal-100 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedClassCategory === category.id 
                          ? "bg-teal-50 text-teal-600" 
                          : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500"
                      }`}>
                        <FiBook size={24} />
                      </div>
                      <span className="font-bold text-lg text-slate-700 group-hover:text-teal-700 transition-colors">
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
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Choose Subjects</h2>
                <p className="text-lg text-slate-500">Select all the subjects you need assistance with.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-wrap gap-3">
                  {getSelectedCategorySubjects().map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={`px-6 py-4 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex items-center gap-3 ${
                        selectedSubjects.includes(subject.id)
                          ? "border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105"
                          : "border-slate-100 text-slate-600 hover:border-teal-200 hover:bg-slate-50"
                      }`}
                    >
                      {subject.subject_name}
                      {selectedSubjects.includes(subject.id) && (
                        <FiCheck size={18} className="text-white" />
                      )}
                    </button>
                  ))}
                  {getSelectedCategorySubjects().length === 0 && (
                    <div className="w-full text-center py-16">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiBook className="text-slate-300" size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">No subjects available for this category.</p>
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
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Location Details</h2>
                <p className="text-lg text-slate-500">Where would you like to find the teacher?</p>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* State */}
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">State</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={locationDetails.state}
                        readOnly
                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-500 font-bold cursor-not-allowed"
                      />
                      <FiMapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                  </div>

                  {/* District Selection */}
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">District <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={locationDetails.district}
                        onChange={(e) => setLocationDetails({ ...locationDetails, district: e.target.value })}
                        className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select District</option>
                        {BIHAR_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pincode <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                        className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                      />
                      {loadingPincode ? (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                      ) : (
                        <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-colors ${pincode.length === 6 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Office */}
                {postOffices.length > 0 && (
                  <div className="group">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Post Office</label>
                      <div className="relative">
                        <select
                          value={selectedPostOffice}
                          onChange={(e) => setSelectedPostOffice(e.target.value)}
                          className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select Post Office</option>
                          {postOffices.map((po, idx) => (
                            <option key={idx} value={po.Name}>{po.Name}</option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
                      </div>
                    </div>
                  </div>
                )}



                {/* Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Area / Locality</label>
                  <input
                    type="text"
                    value={locationDetails.area}
                    onChange={(e) => setLocationDetails({ ...locationDetails, area: e.target.value })}
                    placeholder="E.g., Near City Center, Main Road..."
                    className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold text-lg focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Sticky Bottom */}
        <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex justify-between items-center sticky bottom-0 z-20">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              currentStep === 0 
                ? "text-slate-300 cursor-not-allowed" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FiArrowLeft size={24} /> Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 0 && !selectedJobType) ||
                (currentStep === 1 && !selectedClassCategory) ||
                (currentStep === 2 && selectedSubjects.length === 0)
              }
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
            >
              Next Step <FiChevronRight size={24} />
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={!locationDetails.state || !locationDetails.district || !pincode}
              className="bg-teal-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-1 flex items-center gap-3"
            >
              Find Teachers <FiSearch size={24} />
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
