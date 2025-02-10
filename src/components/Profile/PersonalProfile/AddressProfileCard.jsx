import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddress,
  postAddress,
  putAddress,
} from "../../../features/personalProfileSlice";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue";
import { toast } from "react-toastify";
import { FaLocationDot } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { FiEdit, FiMapPin, FiAlertCircle } from "react-icons/fi";

const Loader = () => (
  <div className="flex justify-center items-center py-4">
    <div className="loader border-t-[#3E98C7] border-4 w-4 h-4 rounded-full animate-spin"></div>
  </div>
);

const AddressForm = ({ type, addressData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const [loadingPincode, setLoadingPincode] = useState(false);

  useEffect(() => {
    if (addressData) reset(addressData);
  }, [addressData, reset]);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    if (pincode.length === 6) {
      setLoadingPincode(true);
      try {
        const response = await axios.get(`${getPincodeUrl()}${pincode}`);
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
    <div className="px-5 py-4 rounded-md border">
      <h3 className="text-lg font-semibold text-[#3E98C7] mb-4">
        {type === "current" ? "Edit Current Address" : "Edit Permanent Address"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Pincode Field */}
        <div className="flex flex-col gap-2">
          <label className="text-md  text-gray-400">Pincode*</label>
          <input
            {...register("pincode", { required: "Pincode is required" })}
            placeholder="Enter Pincode"
            onChange={handlePincodeChange}
            className="w-full border-b border-gray-200 px-2 pb-1 focus:outline-none"
          />
          {errors.pincode && (
            <p className="text-red-500 text-sm">{errors.pincode.message}</p>
          )}
          {loadingPincode && (
            <div className="mt-2">
              <Loader />
            </div>
          )}
        </div>

        {/* State and District Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-md text-gray-400">State*</label>
            <input
              {...register("state")}
              placeholder="State"
              readOnly
              className="w-full border-b cursor-not-allowed border-gray-200 px-2 pb-1 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-md  text-gray-400">District*</label>
            <input
              {...register("district")}
              placeholder="District"
              readOnly
              className="w-full border-b cursor-not-allowed border-gray-200 px-2 pb-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Area Field */}
        <div className="flex flex-col gap-2">
          <label className="text-md text-gray-400">Area*</label>
          <input
            {...register("area")}
            placeholder="Area"
            className="w-full border-b border-gray-200 px-2 pb-1 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-1.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-1.5 bg-[#3E98C7] text-white rounded-lg hover:bg-[#3579a0] transition-all"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

const AddressCard = ({ title, data, onEdit, variant = "active" }) => (
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
      <button
        onClick={onEdit}
        className="flex items-center space-x-2 px-4 py-2 bg-[#3E98C7]/10 text-[#3E98C7] rounded-lg hover:bg-[#3E98C7]/20 transition-all"
      >
        <FiEdit className="w-4 h-4" />
        <span>Edit</span>
      </button>
    </div>
    {data.area || data.district || data.state || data.pincode ? (
      <div className="grid grid-cols-2 gap-4 text-gray-600 px-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Area</label>
          <p className="font-medium">
            {data.area || <span className="text-gray-400">Not provided</span>}
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
  console.log("personalProfile", personalProfile);
  const [isEditingType, setIsEditingType] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(getAddress());
  }, []);

  const handleSave = async (data) => {
    console.log("archana", data);
    const payload = { ...data, address_type: isEditingType };
    console.log("arcPayload", payload);
    //console.log("adreestype",address_type)
    setLoading(true);
    try {
      if (personalProfile?.[`${isEditingType}_address`]) {
        await dispatch(putAddress(payload)).unwrap();
      } else {
        console.log("arcPayload", payload);
        await dispatch(postAddress(payload)).unwrap();
      }
      toast.success("Address saved successfully");
      setIsEditingType(null);
      dispatch(getAddress());
    } catch {
      toast.error("Failed to save address");
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
    <div className="md:p-8 space-y-4 mt-5 ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 bg-white">
        <div className="flex-1">
          <h2 className="text-2xl flex items-center gap-1  text-[#2A6F97] leading-tight">
          <FaLocationDot className="text-[#2A6F97] text-xl" /> Manage Your Addresses
          </h2>
          <div className="mt-3 p-4 bg-[#F8FAFC] rounded-lg border border-[#3E98C7]/20 flex items-start gap-3">
            <FaInfoCircle className="text-[#3E98C7] text-sm mt-1 flex-shrink-0" />
            <p className="text-gray-600 text-xs ">
              Add or update your current and permanent addresses.
              <span className="block mt-1 text-[#3E98C7]">
                Both addresses are required for verification purposes.
              </span>
            </p>
          </div>
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Current Address */}
          <div className="md:col-span-1">
            {isEditingType === "current" ? (
              <AddressForm
                type="current"
                addressData={personalProfile.current_address}
                onSubmit={handleSave}
                onCancel={() => setIsEditingType(null)}
              />
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
              <AddressForm
                type="permanent"
                addressData={personalProfile.permanent_address}
                onSubmit={handleSave}
                onCancel={() => setIsEditingType(null)}
              />
            ) : (
              <AddressCard
                title="Permanent Address"
                data={personalProfile.permanent_address || {}}
                onEdit={() => setIsEditingType("permanent")}
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
