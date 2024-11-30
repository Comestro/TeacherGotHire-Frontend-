
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../../features/personalProfileSlice";
import { updateProfileService } from "../../../services/profileServices";
import Input from "../../Input";

const PersonalProfileCard = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.personalProfile);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setValue("fullname", profile.fullname);
      setValue("email", profile.email);
      setValue("phone", profile.phone);

    }
  }, [profile, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await updateProfileService(data);
      console.log(response)
      dispatch(updateProfile(data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      {/* Profile Section */}
      <div className="flex items-center mb-4">
        <img
          src={profile.image || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="ml-4">
          <h2 className="text-xl font-bold">{profile.fullname || "Full Name"}</h2>
          <p className="text-gray-500">{profile.email || "Email not set"}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)} // Open modal on click
          className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
      <div className="space-y-2">
        <p><strong>Full Name:</strong> {profile.name || "Not set"}</p>
        <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>
        <p><strong>Email:</strong> {profile.email || "Not set"}</p>
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg h-[90%] p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 mt-4">
            <Input
                label="user"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter your full name"
                type="text"
                {...register("fullname", {
                  required: "Full name is required",
                })}
                />
              {/* Full Name */}
              <Input
                label="Full Name"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter your full name"
                type="text"
                {...register("fullname", {
                  required: "Full name is required",
                })}
              />
              {/* Email */}
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-gray-700">Gender</label>
                <select
                  {...register("gender", { required: "Gender is required" })}
                  id="gender"
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
              </div>
              {/* Additional Fields */}
              <Input placeholder="Religion" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("religion", { required: true })} />
              <Input placeholder="Nationality" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("nationality", { required: true })} />
              <Input placeholder="Phone No" type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("phone", { required: true })} />
              <Input placeholder="Alternate Phone" type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("alternate_phone")} />
              <Input placeholder="Aadhar No" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("aadhar_no", { required: true })} />
              <Input placeholder="Class Categories" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("class_categories", { required: true })} />
              <Input placeholder="Rating" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("rating")} />
              <Input placeholder="Date of Birth" type="date" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("date_of_birth", { required: true })} />
              <Input placeholder="Availability Status" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("availability_status", { required: true })} />
              <Input placeholder="Verified" type="text" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" {...register("verified", { required: true })} />
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

export default PersonalProfileCard;

