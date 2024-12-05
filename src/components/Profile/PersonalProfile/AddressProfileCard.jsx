import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getAddress, postAddress } from "../../../features/personalProfileSlice";
import { updateAddressProfile } from "../../../services/profileServices";
import { FiEdit2 } from "react-icons/fi";
import Input from "../../Input";

const AddressProfileCard = () => {
  const dispatch = useDispatch();
  const addressData = useSelector((state) => state.personalProfile.address || []);
  const [editingIndex, setEditingIndex] = useState(null); // Track which address is being edited
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  // Fetch address data when the component mounts
  useEffect(() => {
    dispatch(getAddress());
  }, [dispatch]);

  // Handle saving or posting data
  const onSubmit = async (data) => {
    try {
      if (editingIndex !== null) {
        // Update existing address
        const updatedData = [...addressData];
        updatedData[editingIndex] = data;
        await updateAddressProfile(data); // Call API for update
        dispatch(postAddress(updatedData)); // Dispatch updated data
      } else {
        // Add new address
        await updateAddressProfile(data); // Call API to save
        dispatch(postAddress([...addressData, data])); // Dispatch with new data
      }
      setEditingIndex(null); // Exit editing mode
      reset(); // Reset form
    } catch (err) {
      setError(err.message);
    }
  };

  // Set form values for editing
  const handleEdit = (index) => {
    setEditingIndex(index);
    const selectedAddress = addressData[index];
    Object.keys(selectedAddress).forEach((key) => setValue(key, selectedAddress[key]));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingIndex(null);
    reset();
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Manage Address</h3>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input label="City" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter City" type="text" {...register("user_id", { required: true })} />
            {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
          </div>
          <div>
          <Input label="State" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter State" type="text" {...register("state", { required: true })} />
            {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
          </div>
          <div>
          <Input label="District" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter District" type="text" {...register("district", { required: true })} />
            {errors.district && <span className="text-red-500 text-sm">{errors.district.message}</span>}
          </div>
          <div>
          <Input label="Division"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Division" type="text" {...register("division")} />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>
          <div>
          <Input label="Block" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter Block" type="text" {...register("block")} />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>
          <div>
          <Input label="Village"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Village" type="text" {...register("village")} />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>
          <div>
          <Input label="Area" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Area" type="text" {...register("area")} />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>
          <div>
          <Input label="Pincode" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Pincode" type="text" {...register("pincode", { required: true })} />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingIndex !== null ? "Update" : "Save"}
          </button>
        </div>
      </form>

      {/* Existing Addresses */}
      <div className="mt-6 space-y-4">
        {addressData.length > 0 ? (
          addressData.map((address, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded-md shadow-md border"
            >
              <div>
                <p><strong>City:</strong> {address.city}</p>
                <p><strong>State:</strong> {address.state}</p>
                <p><strong>District:</strong> {address.district}</p>
                <p><strong>Pincode:</strong> {address.pincode}</p>
              </div>
              <button
                onClick={() => handleEdit(index)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiEdit2 size={20} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No addresses added yet.</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default AddressProfileCard;
