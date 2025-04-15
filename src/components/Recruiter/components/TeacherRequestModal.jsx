import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getClassCategory } from "../../../features/jobProfileSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { createTeacherRequest } from "../../../services/profileServices";
import { IoMdClose } from "react-icons/io";
import { FaChalkboardTeacher, FaMapMarkerAlt } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const TeacherRequestModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { classCategories } = useSelector((state) => state.jobProfile);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClassCategory, setSelectedClassCategory] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [pincode, setPincode] = useState("");
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [postOffice, setPostOffice] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [pincodeDetails, setPincodeDetails] = useState({
    state: "",
    city: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(getClassCategory());
  }, [dispatch]);

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
          setPostOffice(postOffices);

          if (postOffices.length > 0) {
            setPincodeDetails({
              state: postOffices[0].State,
              city: postOffices[0].District,
            });
            toast.success("Location details found!");
          } else {
            toast.warning("No areas found for this pincode");
          }
        } else {
          toast.error("Invalid pincode entered");
        }
      } catch (error) {
        toast.error("Failed to fetch pincode details");
      } finally {
        setLoadingPincode(false);
      }
    } else {
      setPostOffice([]);
      setPincodeDetails({ state: "", city: "" });
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const validateForm = () => {
    if (currentStep === 1) {
      return selectedClassCategory && selectedSubjects.length > 0;
    }
    return pincode.length === 6 && selectedArea && pincodeDetails.state;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      pincode,
      state: pincodeDetails.state,
      city: pincodeDetails.city,
      area: selectedArea,
      subject: selectedSubjects,
      class_category: [selectedClassCategory],
    };

    try {
      await createTeacherRequest(payload);
      toast.success("Teacher request submitted successfully!");
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
      toast.error("Failed to submit request");
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedClassCategory(null);
    setSelectedSubjects([]);
    setPincode("");
    setPostOffice([]);
    setSelectedArea("");
    setPincodeDetails({ state: "", city: "" });
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60  flex items-center justify-center p-4 z-50">
      <ToastContainer />
      <div className="bg-white rounded-md p-6 w-full max-w-lg relative shadow-2xl transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <IoMdClose size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <FaChalkboardTeacher className="text-teal-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">
            Request a Teacher
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {currentStep === 1 ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Class Category
              </h3>
              <select
                value={selectedClassCategory || ""}
                onChange={(e) =>
                  setSelectedClassCategory(Number(e.target.value))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Select a category</option>
                {classCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedClassCategory && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Subjects
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {classCategories
                    .find((c) => c.id === selectedClassCategory)
                    ?.subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all
                          ${
                            selectedSubjects.includes(subject.id)
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-teal-200"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleSubjectChange(subject.id)}
                          className="form-checkbox h-4 w-4 text-teal-500 rounded"
                        />
                        <span className="text-gray-700">
                          {subject.subject_name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!validateForm()}
                className="px-5 py-2.5 bg-teal-500 text-white rounded-lg disabled:opacity-50 hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                Next
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <FaMapMarkerAlt className="text-teal-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-700">
                Location Details
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Pincode
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pincode}
                    onChange={handlePincodeChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Enter 6-digit pincode"
                    disabled={loadingPincode}
                  />
                  {loadingPincode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AiOutlineLoading3Quarters
                        className="animate-spin text-teal-500"
                        size={20}
                      />
                    </div>
                  )}
                </div>
              </div>

              {pincodeDetails.state && (
                <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">State:</span>
                      <strong className="text-teal-600">
                        {pincodeDetails.state}
                      </strong>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">City:</span>
                      <strong className="text-teal-600">
                        {pincodeDetails.city}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {postOffice.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Select Area
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select an area</option>
                    {postOffice.map((area) => (
                      <option key={area.Name} value={area.Name}>
                        {area.Name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <BsArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!validateForm()}
                className="px-5 py-2.5 bg-teal-500 text-white rounded-lg disabled:opacity-50 hover:bg-teal-600 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherRequestModal;
