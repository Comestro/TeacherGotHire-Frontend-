import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddress,
  postAddress,
  putAddress,
} from "../../../features/personalProfileSlice";
import {
  updateAddressProfile,
  addAddressProfile,
} from "../../../services/profileServices";
import axios from "axios";
import { getPincodeUrl } from "../../../store/configue";
import { toast } from "react-toastify";

const AddressForm = ({ type, addressData, onSubmit, onCancel }) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (addressData) reset(addressData);
  }, [addressData, reset]);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    if (pincode.length === 6) {
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
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register("pincode", { required: "Pincode is required" })}
        placeholder="Pincode"
        onChange={handlePincodeChange}
        className="w-full border rounded px-3 py-2"
      />
      {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode.message}</p>}
      <input
        {...register("state")}
        placeholder="State"
        readOnly
        className="w-full border rounded px-3 py-2 bg-gray-100"
      />
      <input
        {...register("district")}
        placeholder="District"
        readOnly
        className="w-full border rounded px-3 py-2 bg-gray-100"
      />
      <input
        {...register("area")}
        placeholder="Area"
        className="w-full border rounded px-3 py-2"
      />
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#3E98C7] text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
};

const AddressCard = ({ title, data, onEdit }) => (
  <div className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-[#3E98C7]">{title}</h3>
      <button
        onClick={onEdit}
        className="px-4 py-1 bg-[#3E98C7] text-white rounded"
      >
        Edit
      </button>
    </div>
    <div className="space-y-2">
      <p>
        <span className="font-semibold text-gray-600">Pincode:</span>{" "}
        {data.pincode || "Not Provided"}
      </p>
      <p>
        <span className="font-semibold text-gray-600">State:</span>{" "}
        {data.state || "Not Provided"}
      </p>
      <p>
        <span className="font-semibold text-gray-600">District:</span>{" "}
        {data.district || "Not Provided"}
      </p>
      <p>
        <span className="font-semibold text-gray-600">Area:</span>{" "}
        {data.area || "Not Provided"}
      </p>
    </div>
  </div>
);

const AddressProfileCard = () => {
  const dispatch = useDispatch();
  const personalProfile = useSelector(
    (state) => state.personalProfile.address || {}
  );
  const [isEditingType, setIsEditingType] = useState(null);

  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  const handleSave = async (data) => {
    const payload = { ...data, address_type: isEditingType };
    try {
      if (personalProfile?.[`${isEditingType}_address`]) {
        await updateAddressProfile(payload);
        dispatch(putAddress(payload));
      } else {
        await addAddressProfile(payload);
        dispatch(postAddress(payload));
      }
      toast.success("Address saved successfully");
      setIsEditingType(null);
      dispatch(getAddress());
    } catch {
      toast.error("Failed to save address");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-700 mt-2">
        Address Information
      </h2>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
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
          />
        )}
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
          />
        )}
      </div>
    </div>
  );
};

export default AddressProfileCard;
