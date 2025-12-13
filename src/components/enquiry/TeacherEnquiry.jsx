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
  FiSmile,
  FiMessageSquare,
  FiBriefcase,
  FiBookmark,
  FiStar,
  FiUser,
  FiEye,
} from "react-icons/fi";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showNotification } from "../../features/notificationSlice";
import { fetchTeachers } from "../../features/teacherFilterSlice";

export const TeacherEnquiry = ({ showModal, setShowModal }) => {
  const dispatch = useDispatch();
  const apiClient = axios.create({
    baseURL: getApiUrl(),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [teacherType, setTeacherType] = useState("");
  const [selectedClassCategory, setSelectedClassCategory] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const modalRef = useRef(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [pincodeDetails, setPincodeDetails] = useState({
    state: "",
    city: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState("");

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
    setSelectedClassCategory("");
    setContactNumber("");
    setPincode("");
    setEmail("");
    setAreas([]);
    setSelectedArea("");
    setPincodeDetails({ state: "", city: "" });
    setTeachers([]);
    setTeachersError("");
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

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
  const fetchTeachersData = async () => {
    setTeachersLoading(true);
    setTeachersError("");
    try {
      const classCategory = subject.find(
        (cat) => cat.id === parseInt(selectedClassCategory)
      );
      const classCategoryName = classCategory ? classCategory.name : "";
      const subjectNames = selectedSubjects
        .map((subjectId) => {
          for (const category of subject) {
            const subject = category.subjects.find(
              (subj) => subj.id === subjectId
            );
            if (subject) return subject.subject_name;
          }
          return null;
        })
        .filter((name) => name)
        .join(",");

      const filters = {
        class_category_name: classCategoryName,
        subject_names: subjectNames,
        pincode: pincode,
        area: selectedArea || undefined,
      };

      const result = await dispatch(fetchTeachers(filters)).unwrap();
      setTeachers(result);
      setTeachersLoading(false);
    } catch (error) {
      setTeachersError(error);
      toast.error(error || "Failed to fetch teachers");
      setTeachersLoading(false);
    }
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
      contact: contactNumber,
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
        setCurrentStep(5);
        dispatch(
          showNotification({
            message: "Application submitted successfully!",
            type: "success",
          })
        );
      }
    } catch (error) {
      
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
      {[0, 1, 2, 3, 4].map((step) => (
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
            <div className="sticky top-0 bg-white border-b z-20 shadow-sm">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Teacher Enquiry
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                {currentStep < 5 && <StepIndicator />}

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
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-600">
                          Select Class Category
                        </label>
                        <select
                          value={selectedClassCategory}
                          onChange={(e) =>
                            setSelectedClassCategory(e.target.value)
                          }
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select Class Category</option>
                          {subject &&
                            subject.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="mb-5 max-h-[350px] overflow-y-auto">
                        {subject &&
                          selectedClassCategory &&
                          subject
                            .filter(
                              (category) =>
                                category.id === parseInt(selectedClassCategory)
                            )
                            .map((category) => {
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
                        {selectedClassCategory &&
                          subject &&
                          subject
                            .filter(
                              (category) =>
                                category.id === parseInt(selectedClassCategory)
                            )
                            .some((category) => !category.subjects?.length) && (
                            <p className="text-gray-500 text-center py-4">
                              No subjects available for this class category
                            </p>
                          )}
                      </div>
                      <div className="flex justify-between px-2">
                        <button
                          onClick={() => {
                            setCurrentStep(0);
                            setSelectedClassCategory("");
                            setSelectedSubjects([]);
                          }}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                          disabled={
                            !selectedSubjects.length || !selectedClassCategory
                          }
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
                          onClick={() => {
                            fetchTeachersData();
                            setCurrentStep(3);
                          }}
                          disabled={
                            pincode.length !== 6 ||
                            loadingPincode ||
                            !pincodeDetails.state
                          }
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                        >
                          Search Teachers
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Display Teachers */}
                  {currentStep === 3 && (
                    <div className="animate-slide-in">
                      <h3 className="text-lg font-medium mb-6">
                        Available Teachers
                      </h3>
                      {teachersLoading && (
                        <div className="text-center py-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto"></div>
                          <p className="text-gray-600 mt-4">
                            Loading teachers...
                          </p>
                        </div>
                      )}
                      {teachersError && !teachersLoading && (
                        <div className="text-center py-8">
                          <div className="bg-red-50 border border-red-100 rounded-lg p-5 mb-4">
                            {teachersError.includes('|') ? (
                              <>
                                <div className="mb-3 text-lg font-medium text-red-700">
                                  {teachersError.split('|')[0].trim()}
                                </div>
                                <div className="text-base text-gray-700">
                                  {teachersError.split('|')[1].trim()}
                                </div>
                              </>
                            ) : (
                              <div className="text-red-600">{teachersError}</div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                              onClick={() => setCurrentStep(2)}
                              className="flex items-center justify-center bg-white border border-teal-500 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                            >
                              <FiArrowLeft className="mr-2" /> Change Location
                            </button>
                            <button
                              onClick={fetchTeachersData}
                              className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              Retry Search
                            </button>
                          </div>
                        </div>
                      )}
                      {!teachersLoading &&
                        !teachersError &&
                        teachers.length === 0 && (
                          <div className="text-center py-10">
                            <p className="text-gray-600 mb-4">
                              आपके चुने हुए विकल्पों के अनुसार यहां पर कोई शिक्षक उपलब्ध नहीं है कृपया दूसरी विकल्पों का चयन करें.
                              / According to the options you have selected, no teacher is available here. Please choose other options.
                            </p>
                            
                            <button
                              onClick={() => setCurrentStep(2)}
                              className="text-teal-500 hover:text-teal-700 flex items-center mx-auto"
                            >
                              <FiArrowLeft className="mr-2" /> Change Location
                            </button>
                          </div>
                        )}
                      {!teachersLoading &&
                        !teachersError &&
                        teachers.length > 0 && (
                          <div
                            className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                            style={{
                              overflowX: "hidden",
                              msOverflowStyle: "none",
                              scrollbarWidth: "thin",
                            }}
                          >
                            {teachers.map((teacher) => {
                              const fullName = `${teacher.Fname} ${teacher.Lname}`;
                              const address =
                                teacher.teachersaddress.find(
                                  (addr) => addr.address_type === "current"
                                ) ||
                                teacher.teachersaddress.find(
                                  (addr) => addr.address_type === "permanent"
                                );
                              const location = address
                                ? `${address.area ? address.area + ", " : ""}${
                                    address.postoffice
                                  }, ${address.district}, ${address.state}`
                                : "N/A";
                              const subjects =
                                teacher.preferences[0]?.prefered_subject
                                  ?.map((subj) => subj.subject_name)
                                  .join(", ") || "N/A";
                              const roles =
                                teacher.preferences[0]?.job_role
                                  ?.map((role) => role.jobrole_name)
                                  .join(", ") || "N/A";

                              return (
                                <div
                                  key={teacher.id}
                                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 w-full"
                                >
                                  {/* Header Section */}
                                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    {/* Profile Icon */}
                                    <div className="flex items-center sm:items-start gap-4">
                                      <div className="bg-teal-100 p-3 rounded-lg shrink-0">
                                        <FiUser className="text-2xl text-teal-600" />
                                      </div>

                                      {/* Name and Rating */}
                                      <div className="flex-1">
                                        <h3 className="text-lg font-semibold mb-1">
                                          {fullName}
                                        </h3>
                                        {teacher.total_marks > 0 && (
                                          <div className="flex items-center text-amber-600">
                                            <FiStar className="mr-1" />
                                            <span className="text-sm font-medium">
                                              Rating: {teacher.total_marks}/5
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Bookmark Icon */}
                                      <button className="text-gray-400 hover:text-teal-600 transition-colors">
                                        <FiBookmark className="text-xl" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Details Grid */}
                                  <div className="space-y-3 mb-4">
                                    {/* Subjects */}
                                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <FiBook className="text-teal-600 text-lg mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500">
                                          Subjects
                                        </p>
                                        <p className="font-medium text-gray-900 break-words">
                                          {subjects}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Roles */}
                                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <FiBriefcase className="text-teal-600 text-lg mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500">
                                          Roles
                                        </p>
                                        <p className="font-medium text-gray-900 break-words">
                                          {roles}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <FiMapPin className="text-teal-600 text-lg mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500">
                                          Location
                                        </p>
                                        <p className="font-medium text-gray-900 break-words">
                                          {location}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="border-t pt-4 mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <button className="flex items-center justify-center gap-2 bg-teal-50 text-teal-700 px-4 py-2.5 rounded-lg hover:bg-teal-100 transition-colors w-full">
                                        <FiMessageSquare className="text-lg" />
                                        <span>Message</span>
                                      </button>
                                      <button className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition-colors w-full">
                                        <FiPhone className="text-lg" />
                                        <span>Contact Now</span>
                                      </button>
                                    </div>

                                    <button className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-medium mt-3 w-full">
                                      <FiEye className="text-lg" />
                                      <span>View Full Profile</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      <div className="flex justify-between mt-5">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
                        >
                          Proceed to Contact
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Contact Information */}
                  {currentStep === 4 && (
                    <div className="animate-slide-in">
                      <h3 className="text-lg font-medium mb-6">
                        Contact Information
                      </h3>
                      <div className="space-y-6">
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              setContactNumber(value);
                              setContactError("");
                            }}
                            maxLength="10"
                            className={`w-full pl-10 pr-4 py-3 border ${
                              contactError
                                ? "border-red-500"
                                : "border-gray-200"
                            } rounded-lg focus:outline-none focus:ring-2 ${
                              contactError
                                ? "focus:ring-red-500"
                                : "focus:ring-teal-500"
                            }`}
                            placeholder="Enter 10 digit phone number"
                          />
                          {contactNumber && contactNumber.length < 10 && (
                            <p className="text-yellow-600 text-sm mt-1">
                              Please enter a 10 digit phone number
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
                          onClick={() => setCurrentStep(3)}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FiArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                        >
                          Send Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Success Screen */}
                  {currentStep === 5 && (
                    <div className="animate-fade-in">
                      <div className="text-center py-10 px-4">
                        <div className="mb-8">
                          <FiSmile className="text-yellow-400 text-5xl mx-auto animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-4">
                          🎉 Success! You're All Set!
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          Thank you for your submission! Our team will contact
                          you within 24 hours.
                        </p>
                        <button
                          onClick={() => {
                            setShowModal(false);
                            resetForm();
                          }}
                          className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center mx-auto"
                        >
                          <FiCheck className="mr-2" />
                          Close Window
                        </button>
                        <p className="mt-6 text-sm text-gray-500">
                          Check your email for confirmation details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
