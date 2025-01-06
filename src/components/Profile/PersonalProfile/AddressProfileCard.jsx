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

const Loader = () => (
  <div className="flex justify-center items-center py-4">
    <div className="loader border-t-[#3E98C7] border-4 w-8 h-8 rounded-full animate-spin"></div>
  </div>
);

const AddressForm = ({ type, addressData,onSubmit, onCancel }) => {
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
      }
      finally {
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

const AddressCard = ({ title, data, onEdit }) => (
  <div className="px-5 py-3 border rounded-md  transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-[#3E98C7]">{title}</h3>
      <button
        onClick={onEdit}
        className="px-4 py-1 bg-[#3E98C7] text-white rounded-lg hover:bg-[#3579a0] transition-all"
      >
        Edit
      </button>
    </div>
    <p>
      {data.area || data.district || data.state || data.pincode ? (
        <>
          {data.area || "Not Provided"}
          {", "}
          {data.district || "Not Provided"}
          {", "}
          {data.state || "Not Provided"} ({data.pincode || "Not Provided"})
        </>
      ) : (
        "No address details provided"
      )}
    </p>
  </div>
);

const AddressProfileCard = () => {
  const dispatch = useDispatch();
  const personalProfile = useSelector(
    (state) => state.personalProfile || {}
  );
  console.log("personalProfile",)
  const [isEditingType, setIsEditingType] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  const handleSave = async (data) => {
    console.log("archana",data)
    const payload = { ...data, address_type: isEditingType };
    console.log("arcPayload",payload);
    //console.log("adreestype",address_type)
    setLoading(true);
    try {
      if (personalProfile?.[`${isEditingType}_address`]) {
        await dispatch(putAddress(payload)).unwrap();
      } else {
        console.log("arcPayload",payload);
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
    <div className="md:p-5 space-y-4 mt-4">
      <h2 className="text-xl font-bold text-gray-700 mb-3">
        Address Information
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {loading && <Loader />}
        {isEditingType === "current" ? (
          <div ref={formRef}>
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
          />
        )}
        {isEditingType === "permanent" ? (
          <div ref={formRef}>
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
          />
        )}
      </div>
    </div>
  );
};

export default AddressProfileCard;
