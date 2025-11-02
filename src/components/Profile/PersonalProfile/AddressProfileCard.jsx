import React, { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddress,
  postAddress,
  putAddress,
  resetError,
} from "../../../features/personalProfileSlice";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue";
import { toast } from "react-toastify";
import { FaLocationDot } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { FiEdit, FiMapPin, FiAlertCircle } from "react-icons/fi";
import Heading from "../../commons/Heading";

const Loader = () => (
  <div className="flex justify-center items-center py-4">
    <div className="loader border-t-[#3E98C7] border-4 w-4 h-4 rounded-full animate-spin"></div>
  </div>
);

const AddressForm = ({ type, addressData, onSubmit, onCancel }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const handleCancel = () => {
    dispatch(resetError()); // Reset Redux error state
    reset(); // Reset the form fields
    if (onCancel) onCancel(); // Call the original onCancel function
  };

  const [loadingPincode, setLoadingPincode] = useState(false);
  const [postOffice, setPostOffice] = useState([]);
  const { error } = useSelector((state) => state.personalProfile);

  useEffect(() => {
    if (addressData) reset(addressData);
  }, [addressData, reset]);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    if (/^\d{6}$/.test(pincode)) {
      setLoadingPincode(true);
      try {
        const response = await axios.get(`${getPincodeUrl()}${pincode}`);
        setPostOffice(response.data[0].PostOffice);
        if (response.data[0].Status === "Success") {
          const postOffice = response.data[0].PostOffice[0];
          setValue("state", postOffice.State);
          setValue("district", postOffice.District);
        } else {
          toast.error("Invalid Pincode");
          setValue("state", "");
          setValue("district", "");
        }
      } catch {
        toast.error("Failed to fetch Pincode details");
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-[#3E98C7]/20 shadow-md p-0">
      {/* Form Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#3E98C7]/10 to-[#67B3DA]/10 rounded-t-xl border-b border-[#3E98C7]/10">
        <FaLocationDot className="w-6 h-6 text-[#3E98C7]" />
        <h3 className="text-lg font-bold text-[#3E98C7]">
          {type === "current" ? "Edit Current Address" : "Edit Permanent Address"}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
        {/* Pincode Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-primary">
            Pincode{" "}
            <span className="text-error" aria-hidden="true">
              *
            </span>
          </label>
          <input
            {...register("pincode", { required: "Pincode is required" })}
            placeholder="Enter Pincode"
            onChange={handlePincodeChange}
            className="w-full px-3 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm font-medium transition-all"
          />
          {errors.pincode && (
            <p className="text-error text-xs mt-0.5">{errors.pincode.message}</p>
          )}
          {error && <span className="text-error text-xs">{error}</span>}
          {loadingPincode && (
            <div className="mt-2">
              <Loader />
            </div>
          )}
        </div>

        {/* State and District Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">
              State{" "}
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              {...register("state")}
              placeholder="State"
              readOnly
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg bg-gray-100 text-sm font-medium cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">
              District{" "}
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              {...register("district")}
              placeholder="District"
              readOnly
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg bg-gray-100 text-sm font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {postOffice.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-primary">
              Post Office{" "}
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </label>
            <select
              {...register("postoffice")}
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg bg-white text-sm font-medium"
            >
              <option value="">Select Post Office</option>
              {postOffice.map((office, index) => (
                <option key={index} value={office.Name}>
                  {office.Name}
                </option>
              ))}
            </select>
            {errors.post_office && (
              <p className="text-error text-xs mt-0.5">{errors.post_office.message}</p>
            )}
          </div>
        )}

        {/* Area Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-primary">
            Area{" "}
            <span className="text-error" aria-hidden="true">
              *
            </span>
          </label>
          <input
            {...register("area")}
            placeholder="Area"
            className="w-full px-3 py-2 border border-secondary/30 rounded-lg bg-white text-sm font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-secondary/20">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border border-secondary/30 text-secondary hover:bg-secondary/10 font-medium rounded-lg transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

const AddressCard = ({
  title,
  data,
  onEdit,
  onCopy,
  hasCurrentAddress,
  addressesMatch,
  variant = "active",
}) => (
  <div
    className={`p-4 border rounded-xl transition-all ${
      variant === "active"
        ? "border-gray-200 bg-white hover:border-[#3E98C7]"
        : "border-transparent bg-gray-50 opacity-75"
    }`}
  >
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center space-x-1">
        <FiMapPin className="w-6 h-6 text-[#3E98C7]" />
        <h3 className="text-lg  font-semibold text-gray-600">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {onCopy && hasCurrentAddress && !addressesMatch && (
          <button
            onClick={onCopy}
            className="flex items-center space-x-1 px-2 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
          >
            <FiMapPin className="w-4 h-4" />
            <span className="text-xs">Same as Current</span>
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-[#3E98C7]/10 text-[#3E98C7] rounded-lg hover:bg-[#3E98C7]/20 transition-all"
        >
          <FiEdit className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
    </div>
    {data.area || data.district || data.state || data.pincode ? (
      <div className="grid grid-cols-2 gap-4 text-gray-600 px-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Post Office</label>
          <p className="font-medium">
            {data.postoffice || (
              <span className="text-gray-400">Not provided</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-500">District</label>
          <p className="font-medium">
            {data.district || (
              <span className="text-gray-400">Not provided</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-500">State</label>
          <p className="font-medium">
            {data.state || <span className="text-gray-400">Not provided</span>}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Pincode</label>
          <p className="font-medium">
            {data.pincode || (
              <span className="text-gray-400">Not provided</span>
            )}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Area</label>
          <p className="font-medium">
            {data.area || <span className="text-gray-400">Not provided</span>}
          </p>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
        <FiAlertCircle className="w-8 h-8 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">
          No address details available
          <br />
          <span className="text-sm">Click edit to add address information</span>
        </p>
      </div>
    )}
  </div>
);

const AddressProfileCard = () => {
  const dispatch = useDispatch();
  const personalProfile = useSelector(
    (state) => state.personalProfile.address || {}
  );

  const hasCurrentAddressData = !!(
    personalProfile.current_address &&
    (personalProfile.current_address.area ||
      personalProfile.current_address.district ||
      personalProfile.current_address.state ||
      personalProfile.current_address.pincode)
  );

  const addressesMatch = useMemo(() => {
    if (!personalProfile.current_address || !personalProfile.permanent_address) {
      return false;
    }

    const fieldsToCompare = ["area", "district", "state", "pincode", "postoffice"];
    return fieldsToCompare.every(
      (field) =>
        personalProfile.current_address[field] ===
        personalProfile.permanent_address[field]
    );
  }, [personalProfile.current_address, personalProfile.permanent_address]);

  const [isEditingType, setIsEditingType] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(getAddress());
  }, []);

  const handleSave = async (data) => {
    const payload = { ...data, address_type: isEditingType };

    setLoading(true);
    try {
      if (personalProfile?.[`${isEditingType}_address`]) {
        await dispatch(putAddress(payload)).unwrap();
      } else {
        await dispatch(postAddress(payload)).unwrap();
      }
      toast.success("Address saved successfully");
      setIsEditingType(null);
      dispatch(getAddress());
      dispatch(resetError());
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurrentAddress = async () => {
    const currentAddress = personalProfile.current_address;
    if (!currentAddress) {
      toast.error("No current address to copy");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...currentAddress,
        address_type: "permanent",
      };

      if (personalProfile?.permanent_address) {
        await dispatch(putAddress(payload)).unwrap();
      } else {
        await dispatch(postAddress(payload)).unwrap();
      }

      toast.success("Permanent address updated successfully");
      dispatch(getAddress());
    } catch (error) {
      toast.error("Failed to copy address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditingType && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isEditingType]);

  return (
    <div className="space-y-4 mt-5 border border-[#3E98C7]/30 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 bg-gradient-to-r from-[#3E98C7]/10 to-[#67B3DA]/10 rounded-xl px-4 py-3 border border-[#3E98C7]/20 mb-2">
        <div className="flex items-center gap-3">
          <FaLocationDot className="w-6 h-6 text-[#3E98C7]" />
          <Heading level={3} className="text-xl font-bold text-[#3E98C7]">
            Address Information
          </Heading>
        </div>
        <div className="flex-1">
          <p className="flex items-start gap-2 text-xs text-gray-600">
            <FaInfoCircle className="w-4 h-4 text-[#3E98C7]" />
            <span>
              <strong>Note:</strong> Both addresses are required for verification
              purposes.
            </span>
          </p>
        </div>
      </div>

      {/* Address Cards Section */}
      <div className="space-y-3 md:space-y-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        )}

        <div
          ref={formRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Current Address */}
          <div className="md:col-span-1">
            {isEditingType === "current" ? (
              <div className="bg-white rounded-xl shadow-lg border border-[#3E98C7]/20 p-5 animate-fadeIn">
                <AddressForm
                  type="current"
                  addressData={personalProfile.current_address}
                  onSubmit={handleSave}
                  onCancel={() => setIsEditingType(null)}
                />
              </div>
            ) : (
              <AddressCard
                title="Current Address"
                data={personalProfile.current_address || {}}
                onEdit={() => setIsEditingType("current")}
                variant={isEditingType === "permanent" ? "inactive" : "active"}
              />
            )}
          </div>

          {/* Permanent Address */}
          <div className="md:col-span-1">
            {isEditingType === "permanent" ? (
              <div className="bg-white rounded-xl shadow-lg border border-[#3E98C7]/20 p-5 animate-fadeIn">
                <AddressForm
                  type="permanent"
                  addressData={personalProfile.permanent_address}
                  onSubmit={handleSave}
                  onCancel={() => setIsEditingType(null)}
                />
              </div>
            ) : (
              <AddressCard
                title="Permanent Address"
                data={personalProfile.permanent_address || {}}
                onEdit={() => setIsEditingType("permanent")}
                onCopy={handleCopyCurrentAddress}
                hasCurrentAddress={hasCurrentAddressData}
                addressesMatch={addressesMatch}
                variant={isEditingType === "current" ? "inactive" : "active"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressProfileCard;
