import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getAddress,
  postAddress,
} from "../../../features/personalProfileSlice";
import { updateAddressProfile } from "../../../services/profileServices";

const AddressProfileCard = () => {
  const dispatch = useDispatch();

  // const addressData = personalProfile?.address || [];
  // console.log("add", addressData);

  const personalProfile = useSelector((state) => state.personalProfile || []);
  const addressData = personalProfile.address;
  console.log("archana", addressData[0]);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // useEffect(() => {
  //   dispatch(getAddress());
  // }, [dispatch]);

  useEffect(() => {
    dispatch(getAddress())
      .then((response) => {
        console.log("Responsedfgh:", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    if (addressData) {
      Object.entries(addressData).forEach(([key, value]) =>
        setValue(key, value)
      );
    }
  }, [addressData, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateAddressProfile(data);
      dispatch(postAddress(data));
      setIsEditingAddress(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
        Address Information
      </h2>
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Address</p>
        {!isEditingAddress ? (
          <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Address Type
                </h3>
                <p className="text-gray-700 text-md">
                  {(addressData.address_type && addressData.address_type) ||
                    "N/A"}
                </p>
              </div>
              {/* <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Address Type
                </h3>
                <p className="text-gray-700 text-md">
                   {addressData.area && addressData.area  || 'N/A'} 
                </p>
              </div> */}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="text-white bg-teal-600 hover:bg-teal-700 transition-colors px-6 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsEditingAddress(true)}
              >
                Edit Preferences
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  {...register("address_type", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="current">Current Address</option>
                  <option value="permanent">Permanent Address</option>
                </select>
                {errors.address && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  {...register("state", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter State"
                />
                {errors.state && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <input
                  type="text"
                  {...register("division")}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter Division"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  {...register("district", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter District"
                />
                {errors.district && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <input
                  type="text"
                  {...register("block")}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter Block"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  {...register("village")}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter Village"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  {...register("area")}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register("pincode", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter Pincode"
                />
                {errors.pincode && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsEditingAddress(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-teal-500 rounded hover:bg-teal-600"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
      <hr className="mb-4" />
    </div>
  );
};

export default AddressProfileCard;
