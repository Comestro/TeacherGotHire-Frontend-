import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiBook,
  FiMapPin,
  FiCheck,
  FiArrowLeft,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const TeacherEnquiry = ({ showModal, setShowModal, sendToster }) => {
  const apiClient = axios.create({
    baseURL: getApiUrl(), // Use the API URL from config service
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  console.log("subject in home page", subject);

  const [currentStep, setCurrentStep] = useState(0);
  const [teacherType, setTeacherType] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/api/public/classcategory/");
        setSubject(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // for pincode
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [pincodeDetails, setPincodeDetails] = useState({
    state: "",
    city: "",
  });

  const handlePincodeChange = async (e) => {
    const enteredPincode = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(enteredPincode);

    if (enteredPincode.length === 6) {
      setLoadingPincode(true);
      try {
        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${enteredPincode}`
        );
        if (response.data[0].Status === "Success") {
          const postOffices = response.data[0].PostOffice;
          if (postOffices.length > 0) {
            setPincodeDetails({
              state: postOffices[0].State,
              city: postOffices[0].District,
            });
            setAreas(postOffices.map((po) => po.Name));
            toast.success("Location details found!");
          } else {
            toast.warning("No areas found for this pincode");
            setAreas([]);
          }
        } else {
          toast.error("Invalid pincode entered");
          setAreas([]);
        }
      } catch (error) {
        toast.error("Failed to fetch pincode details");
        setAreas([]);
      } finally {
        setLoadingPincode(false);
      }
    } else {
      setAreas([]);
      setPincodeDetails({ state: "", city: "" });
    }
  };

  const teacherTypes = [
    {
      type: "school",
      title: "School Teacher",
      description: "Teaching in a school environment",
    },
    {
      type: "coaching",
      title: "Coaching Teacher",
      description: "Teaching in a coaching institute",
    },
    {
      type: "personal",
      title: "Personal(Home) Tutor",
      description: "Private one-on-one tutoring",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        resetForm();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setCurrentStep(0);
    setTeacherType("");
    setSelectedSubjects([]);
    setContactNumber("");
    setPincode("");
    setEmail("");
    setAreas([]);
    setSelectedArea("");
    setPincodeDetails({ state: "", city: "" });
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!contactNumber) {
      toast.error("Please enter a valid contact number");
      return;
    }

    const formData = {
      email: email,
      contact: contactNumber, // Add contact number to the form data
      subject: selectedSubjects,
      teachertype: teacherType,
      pincode: pincode,
      state: pincodeDetails.state,
      city: pincodeDetails.city,
      area: selectedArea,
      name: "Rahul",
    };

    try {
      const response = await axios.post(
        "https://api.ptpinstitute.com/api/self/recruiterenquiryform/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Application submitted successfully!");
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (
        error.response?.data?.contact?.includes("This field must be unique.")
      ) {
        const errorMsg = "This contact number is already registered";
        setContactError(errorMsg);
        toast.error(errorMsg);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Submission failed. Please try again."
        );
      }
    }
  };
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-4">
      {[0, 1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full mx-1 transition-colors ${
            step === currentStep ? "bg-teal-500" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <ToastContainer />
          <div ref={modalRef} className="bg-white w-full h-full flex flex-col">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white border-b z-20 shadow-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Teacher Enquiry
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <StepIndicator />

                {/* Step Content Container */}
                <div className="relative min-h-[400px] mt-10 md:mt-5">
                  {/* Step 0: Teacher Type Selection */}
                  {currentStep === 0 && (
                    <div className="animate-fade-in">
                      <h3 className="text-lg font-medium mb-6">
                        Select Your Teaching Type
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {teacherTypes.map((type) => (
                          <button
                            key={type.type}
                            onClick={() => {
                              setTeacherType(type.type);
                              setCurrentStep(1);
                            }}
                            className={`p-4 rounded-lg border-2 text-left cursor-pointer transition-all ${
                              teacherType === type.type
                                ? "border-teal-500 bg-teal-50"
                                : "border-gray-200 hover:border-teal-300"
                            }`}
                          >
                            <FiBook className="text-teal-500 mb-2" size={24} />
                            <h4 className="font-medium mb-1">{type.title}</h4>
                            <p className="text-sm text-gray-600">
                              {type.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Subject Selection */}
                  {currentStep === 1 && (
                    <div className="animate-slide-in">
                      <h3 className="text-lg font-medium mb-4">
                        Select Subjects
                      </h3>
                      <div className="mb-5 max-h-[350px] overflow-y-auto">
                        {subject &&
                          subject.map((category) => {
                            if (
                              !category.subjects ||
                              category.subjects.length === 0
                            )
                              return null;

                            return (
                              <div key={category.id} className="mb-6">
                                <h4 className="text-sm font-medium mb-3 text-gray-600">
                                  {category.name}
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {category.subjects.map((subject) => (
                                    <button
                                      key={subject.id}
                                      onClick={() =>
                                        handleSubjectToggle(subject.id)
                                      }
                                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                        selectedSubjects.includes(subject.id)
                                          ? "border-teal-500 bg-teal-50"
                                          : "border-gray-200 hover:border-teal-300"
                                      }`}
                                    >
                                      <span className="text-sm">
                                        {subject.subject_name}
                                      </span>
                                      {selectedSubjects.includes(
                                        subject.id
                                      ) && (
                                        <FiCheck className="text-teal-500" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="flex justify-between px-2">
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                          disabled={!selectedSubjects.length}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location Input */}
                  {currentStep === 2 && (
                    <div className="animate-slide-in">
                      <h3 className="text-lg font-medium mb-6">
                        Enter Your Location
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Enter 6-digit pincode
                          </label>
                          <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              value={pincode}
                              onChange={handlePincodeChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="Enter pincode"
                              maxLength="6"
                            />
                            {loadingPincode && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {pincodeDetails.state && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">State</p>
                                <p className="font-medium">
                                  {pincodeDetails.state}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  District
                                </p>
                                <p className="font-medium">
                                  {pincodeDetails.city}
                                </p>
                              </div>
                            </div>

                            {areas.length > 0 && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                  Select your area (optional)
                                </label>
                                <select
                                  value={selectedArea}
                                  onChange={(e) =>
                                    setSelectedArea(e.target.value)
                                  }
                                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                  <option value="">Select area</option>
                                  {areas.map((area, index) => (
                                    <option key={index} value={area}>
                                      {area}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between px-4 mb-2 mt-5">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          disabled={
                            pincode.length !== 6 ||
                            loadingPincode ||
                            !pincodeDetails.state
                          }
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact Information */}
                  {currentStep === 3 && (
                    <div className="animate-slide-in">
                      <h3 className="text-lg font-medium mb-6">
                        Contact Information
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Contact Number
                          </label>
                          <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              value={contactNumber}
                              onChange={(e) => {
                                setContactNumber(e.target.value);
                                setContactError(""); // Clear error when user types
                              }}
                              className={`w-full pl-10 pr-4 py-3 border ${
                                contactError
                                  ? "border-red-500"
                                  : "border-gray-200"
                              } rounded-lg focus:outline-none focus:ring-2 ${
                                contactError
                                  ? "focus:ring-red-500"
                                  : "focus:ring-teal-500"
                              }`}
                              placeholder="Enter phone number"
                            />
                          </div>
                          {contactError && (
                            <p className="text-red-500 text-sm mt-1">
                              {contactError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-600">
                            Email Address
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="Enter email address"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-5">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={() => {
                            if (!isValidEmail(email)) {
                              toast.error("Please enter a valid email address");
                              return;
                            }
                            if (!contactNumber) {
                              toast.error(
                                "Please enter a valid contact number"
                              );
                              return;
                            }
                            handleSubmit();
                          }}
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                        >
                          Send Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add these styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .btn-primary {
          @apply bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center;
        }

        .btn-secondary {
          @apply text-gray-600 hover:text-gray-800 transition-colors flex items-center;
        }
      `}</style>
    </div>
  );
};
