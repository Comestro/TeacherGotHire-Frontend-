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
  const [error, setError] = useState('');

  // Populate the form with the existing profile data
  useEffect(() => {
    if (profile) {
      setValue("fullname", profile.fullname);
      setValue("email", profile.email);
      setValue("gender", profile.gender);
      setValue("phone", profile.phone);
      // setValue("address", profile.address); // Assuming you have address as part of the profile
    }
  }, [profile, setValue]);

  const onSubmit = async (data) => {
    console.log(data);
    try{
       const response = updateProfileService(data);
       console.log(data);
       dispatch(updateProfile(data)); 
       setIsModalOpen(false);
    }

    catch (error) {
      setError(error.message);
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
        <p><strong>Gender:</strong> {profile.gender || "Not set"}</p>
        <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>
        <p><strong>Address:</strong> {profile.address?.city || "City not set"}</p>
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              {/* <div className="mb-4">
                <label htmlFor="fullname" className="block text-gray-700">Full Name</label>
                <input
                  {...register("fullname", { required: "Full Name is required" })}
                  id="fullname"
                  className="w-full p-2 border rounded"
                />
                {errors.fullname && <p className="text-red-500">{errors.fullname.message}</p>}
              </div> */}
              <div className="mb-4">
              <Input
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter your Username"
                type="text"
                {...register('username', {
                  required: 'Username is required',
                })}
              />
            </div>
             

              {/* Email */}
              <div className="mb-4">
              <Input
               placeholder="Enter your email"
                type="email" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('email', {
                  required: true,
                  validate: {
                    matchPattern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      'Email address must be valid',
                  },
              })}
              />
            </div>
              {/* <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">Email</label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  id="email"
                  className="w-full p-2 border rounded"
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div> */}

              {/* Gender */}
              <div className="mb-4">
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

              {/* Phone */}
              {/* <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700">Phone</label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  type="tel"
                  id="phone"
                  className="w-full p-2 border rounded"
                />
                {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
              </div> */}
              <div className="mb-4">
              <Input
               placeholder="Phone No"
                type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('phone', {
                  required: true,
              })}
              />
            </div>
            <div className="mb-4">
              <Input
               placeholder="Phone No"
                type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('phone', {
                  required: true,
              })}
              />
            </div>
            <div className="mb-4">
              <Input
               placeholder="Phone No"
                type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('phone', {
                  required: true,
              })}
              />
            </div>
            <div className="mb-4">
              <Input
              label="phone"
               placeholder="Phone No"
                type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('phone', {
                  required: true,
              })}
              />
            </div>
            <div className="mb-4">
              <Input
               placeholder="Phone No"
                type="tel" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('phone', {
                  required: true,
              })}
              />
            </div>
              {/* <div className="mb-4">
                <label htmlFor="AadharNo" className="block text-gray-700">Phone</label>
                <input
                  {...register("phone", { required: "Phone is required" })}
                  type="tel"
                  id="phone"
                  className="w-full p-2 border rounded"
                />
                {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
              </div> */}

              {/* Address */}
              {/* <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700">City</label>
                <input
                  {...register("address.city", { required: "City is required" })}
                  type="text"
                  placeholder="City"
                  className="w-full p-2 border rounded"
                />
                {errors.address?.city && <p className="text-red-500">{errors.address.city.message}</p>}
              </div> */}

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)} // Close the modal without saving
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
