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
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSubject } from "../../features/jobProfileSlice";

export const TeacherEnquiry = ({ showModal, setShowModal }) => {


  const apiClient = axios.create({
    baseURL: getApiUrl(), // Use the API URL from config service
    headers: {
      "Content-Type": "application/json",
    }, 
  });
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("subject in home page", subject);

  const [currentStep, setCurrentStep] = useState(0);
  const [teacherType, setTeacherType] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const modalRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(
          "/api/public/classcategory/"
        );
        setSubject(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

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
    const enteredPincode = e.target.value.replace(/\D/g, "");
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
      title: "Personal Tutor",
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

    const formData = {
      email: email,
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

      console.log("form submit ho gya bhai", response.data);
      if (response.status === 200 || response.status === 201) {
        toast.success("Application submitted successfully!");
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.response?.data?.message || "Submission failed. Please try again."
      );
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <div
            ref={modalRef}
            className="bg-white rounded-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Teacher Enquiry</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="">
              <div className="mt-4">
                <StepIndicator />
              </div>
              <div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                {/* Step 0: Teacher Type Selection */}
                <div className="min-w-full px-5 pb-4">
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

                {/* Step 1: Subject Selection */}
                <div className="min-w-full px-5 pb-5">
                  <h3 className="text-lg font-medium mb-6">
                    Select Subjects You Teach
                  </h3>
                  <div className="mb-8 px-2 max-h-72 overflow-y-auto">
                    {subject && subject.map((category) => {
                      if (!category.subjects || category.subjects.length === 0)
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
                                onClick={() => handleSubjectToggle(subject.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                  selectedSubjects.includes(subject.id)
                                    ? "border-teal-500 bg-teal-50"
                                    : "border-gray-200 hover:border-teal-300"
                                }`}
                              >
                                <span className="text-sm">
                                  {subject.subject_name}
                                </span>
                                {selectedSubjects.includes(subject.id) && (
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

                {/* Step 2: Pincode Input */}
                <div className="min-w-full px-5 pb-4">
                  <h3 className="text-lg font-medium mb-6">
                    Enter Your Location
                  </h3>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-4 text-gray-600">
                      Please enter your area pincode for better matching with
                      students
                    </label>
                    <div className="relative mb-4">
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={pincode}
                        onChange={handlePincodeChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="6-digit pincode"
                        maxLength="6"
                      />
                      {loadingPincode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                        </div>
                      )}
                    </div>

                    {pincodeDetails.state && (
                      <div className="grid grid-cols-2 gap-4 mb-4 px-4">
                        <div>
                          <p className="text-sm text-gray-600">State</p>
                          <p className="font-medium">{pincodeDetails.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">City/District</p>
                          <p className="font-medium">{pincodeDetails.city}</p>
                        </div>
                      </div>
                    )}

                    {areas.length > 0 && (
                      <div className="relative px-4">
                        <label className="block text-sm font-medium mb-2 text-gray-600">
                          Select your preferred area
                        </label>
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="">Select an area</option>
                          {areas.map((area, index) => (
                            <option key={index} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between px-4 mb-2">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      <FiArrowLeft className="mr-2" /> Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                      //   disabled={!pincode || !selectedArea}
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Step 3: Email Input */}
                <div className="min-w-full px-5 pb-4">
                  <h3 className="text-lg font-medium mb-6">
                    Contact Information
                  </h3>
                  <div className="mb-8">
                    <label className="block text-sm font-medium mb-4 text-gray-600">
                      Please enter your email address for communication
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="example@domain.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
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
                        handleSubmit();
                      }}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                      // disabled={!isValidEmail(email)}
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
