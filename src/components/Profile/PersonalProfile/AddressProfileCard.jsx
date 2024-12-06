import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Input from "../../Input";
import { getAddress, postAddress } from "../../../features/addressSlice";
import { FiEdit2 } from "react-icons/fi";
import { updateAddressProfile } from "../../../services/profileServices";

const AddressProfileCard = () => {
  const dispatch = useDispatch();
  const addressProfile = useSelector((state) => state);
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    
      dispatch(getAddress());
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await updateAddressProfile (data);
      console.log(response)
      dispatch(postAddress(data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">

      {/* header section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Address</h3>
        <button
          onClick={() => setIsModalOpen(true)} // Open modal for adding new education
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Add Address
        </button>
      </div>
      {/* Profile Section */}
      <div className="space-y-4">
        {addressProfile.length > 0 ? (
          addressProfile.map((add, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>City:</strong> {add.city}
              </p>
              <p>
                <strong>State:</strong> {add.state}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)} // Open modal for editing
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                {/* <button
                  onClick={() => handleRemoveEducation(index)} // Remove education
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No address added yet.</p>
        )}
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg h-[90%] p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold">Edit Address</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 mt-4">
              <Input label="User ID" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter User ID" type="text" {...register("user_id", { required: true })} />
              <Input label="Address Type" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter Address Type" type="text" {...register("address_type", { required: true })} />
              <Input label="State" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter State" type="text" {...register("state", { required: true })} />
              <Input label="Division"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Division" type="text" {...register("division")} />
              <Input label="District" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter District" type="text" {...register("district", { required: true })} />
              <Input label="Block" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Enter Block" type="text" {...register("block")} />
              <Input label="Village"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Village" type="text" {...register("village")} />
              <Input label="Area" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Area" type="text" {...register("area")} />
              <Input label="Pincode" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Enter Pincode" type="text" {...register("pincode", { required: true })} />
              <div className="flex justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressProfileCard;
