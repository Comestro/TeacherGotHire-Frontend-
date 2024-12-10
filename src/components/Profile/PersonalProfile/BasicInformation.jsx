import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FiEdit2 } from "react-icons/fi";
import Input from "../../Input";
import { updateBasicProfile } from "../../../services/profileServices";
import { getBasic, postBasic,setShowForm } from "../../../features/personalProfileSlice"; // Replace with actual Redux action

const BasicInformation = () => {
  const dispatch = useDispatch();
  const basicData = useSelector((state) => state.personalProfile.basicData || {});  
  const showForm = useSelector((state) => state.personalProfile.showForm);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Fetch the basic data only once when the component mounts
    dispatch(getBasic());
    dispatch(setShowForm(true));
  }, []);

  console.log("Redux State - Basic Data:", basicData);
  useEffect(() => {
    // Pre-fill the form only if basicData is updated and exists
    if (basicData) {  
      Object.entries(basicData).forEach(([key, value]) => setValue(key, value)); // Pre-fill the form
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      console.log("kamna",data);
      await updateBasicProfile(data); // Save or update data via API
      dispatch(postBasic(data)); // Update Redux store
      setShowForm(false); // Switch to display mode
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = () => {
    setShowForm(true); // Switch back to form mode

  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

      {showForm ? (
        // Form Mode
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-gray-100 p-4 rounded-md"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Name"
              type="text"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}

            <Input
              label="Email"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Email"
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}

            <Input
              label="Phone Number"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Phone Number"
              type="text"
              {...register("mobile", { required: "Phone number is required" })}
            />
            {errors.phone_no && (
              <span className="text-red-500 text-sm">
                {errors.phone_no.message}
              </span>
            )}

            <Input
              label="Location"
              className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
              placeholder="Enter Location"
              type="text"
              {...register("location")}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="submit"
              className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 w-32"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        // Display Mode
        <div className="bg-white p-4 rounded-md shadow-md">
          <div className="mb-4">
            <p>
              <strong>Name:</strong> {basicData[0].name}
            </p>
            <p>
              <strong>Email:</strong> {basicData[0].email}
            </p>
            <p>
              <strong>Phone:</strong> {basicData[0].mobile}
            </p>
            <p>
              <strong>Location:</strong> {basicData[0].location}
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
          >
            <FiEdit2 size={20} />
            <span>Edit</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-4">Error: {error}</p>}
    </div>
  );
};

export default BasicInformation;
