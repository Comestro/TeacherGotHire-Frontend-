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
import { FiEdit, FiMapPin, FiAlertCircle, FiCopy } from "react-icons/fi";
import Heading from "../../commons/Heading";

const Loader = () => (
  <div className="flex justify-center items-center py-4">
    <div className="loader border-t-teal-600 border-4 w-5 h-5 rounded-full animate-spin"></div>
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
    dispatch(resetError());
    reset();
    if (onCancel) onCancel();
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
    <div className=" rounded-xl border border-slate-200 p-0">
      {/* Form Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <FaLocationDot className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-bold text-slate-800">
          {type === "current" ? "Edit Current Address" : "Edit Permanent Address"}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
        {/* Pincode Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            {...register("pincode", { required: "Pincode is required" })}
            placeholder="Enter Pincode"
            onChange={handlePincodeChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium transition-all"
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-0.5">{errors.pincode.message}</p>
          )}
          {error && <span className="text-red-500 text-xs">{error}</span>}
          {loadingPincode && (
            <div className="mt-2">
              <Loader />
            </div>
          )}
        </div>

        {/* State and District Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700">
              State <span className="text-red-500">*</span>
            </label>
            <input
              {...register("state")}
              placeholder="State"
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700">
              District <span className="text-red-500">*</span>
            </label>
            <input
              {...register("district")}
              placeholder="District"
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {postOffice.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700">
              Post Office <span className="text-red-500">*</span>
            </label>
            <select
              {...register("postoffice")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
            >
              <option value="">Select Post Office</option>
              {postOffice.map((office, index) => (
                <option key={index} value={office.Name}>
                  {office.Name}
                </option>
              ))}
            </select>
            {errors.post_office && (
              <p className="text-red-500 text-xs mt-0.5">{errors.post_office.message}</p>
            )}
          </div>
        )}

        {/* Area Field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-700">
            Area <span className="text-red-500">*</span>
          </label>
          <input
            {...register("area")}
            placeholder="Area"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
    className={`p-5 border rounded-xl transition-all h-full flex bg-white flex-col ${variant === "active"
        ? "border-slate-200 bg-white hover:border-teal-200"
        : "border-transparent bg-slate-50 opacity-75"
      }`}
  >
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
          <FiMapPin className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {onCopy && hasCurrentAddress && !addressesMatch && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all border border-teal-100"
            title="Copy Current Address"
          >
            <FiCopy className="w-3.5 h-3.5" />
            <span className="text-xs font-medium hidden sm:inline">Copy</span>
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200"
        >
          <FiEdit className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Edit</span>
        </button>
      </div>
    </div>

    {data.area || data.district || data.state || data.pincode ? (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm flex-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Post Office</label>
          <p className="font-medium text-slate-700 truncate">
            {data.postoffice || <span className="text-slate-400 italic">N/A</span>}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District</label>
          <p className="font-medium text-slate-700 truncate">
            {data.district || <span className="text-slate-400 italic">N/A</span>}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State</label>
          <p className="font-medium text-slate-700 truncate">
            {data.state || <span className="text-slate-400 italic">N/A</span>}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pincode</label>
          <p className="font-medium text-slate-700 truncate">
            {data.pincode || <span className="text-slate-400 italic">N/A</span>}
          </p>
        </div>
        <div className="col-span-2 space-y-1 pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Area / Street</label>
          <p className="font-medium text-slate-700 break-words">
            {data.area || <span className="text-slate-400 italic">N/A</span>}
          </p>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex-1">
        <FiAlertCircle className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm text-center">
          No address details available
        </p>
        <button onClick={onEdit} className="mt-2 text-xs text-teal-600 hover:underline font-medium">
          Add Address
        </button>
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
    <div className="w-full mx-auto mt-8">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <FaLocationDot className="w-6 h-6" />
          </span>
          Address Information
        </h2>
        <p className="text-slate-500 mt-2 ml-14 text-sm">
          Both addresses are required for verification purposes.
        </p>
      </div>

      {/* Address Cards Section */}
      <div className="space-y-6">
        {loading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}

        <div
          ref={formRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Current Address */}
          <div className="h-full">
            {isEditingType === "current" ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 animate-fadeIn">
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
          <div className="h-full">
            {isEditingType === "permanent" ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 animate-fadeIn">
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
