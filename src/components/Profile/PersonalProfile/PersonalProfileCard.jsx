import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CiCalendar, CiLocationOn, CiMail, CiPhone } from 'react-icons/ci';
import { FaLocationDot, FaMobileScreenButton } from 'react-icons/fa6';
import { GoPencil } from 'react-icons/go';
import { LuShoppingBag } from 'react-icons/lu';
import { updateProfile } from "../../../features/personalProfileSlice";
import { updateProfileService } from "../../../services/profileServices";
import Input from "../../Input";
import { RxCross2 } from "react-icons/rx";

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
    try {
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
    <div className="">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row justify-between max-w-full py-7 border-0 rounded-2xl shadow-md bg-white space-y-4 md:space-y-0 md:space-x-6 px-8">

        <div className="w-full md:w-2/12 flex items-center mb-5 justify-center">
          <img
            src={profile.image || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-32 md:w-44 rounded-full ring-1 ring-gray-400 ring-offset-4 h-32 md:h-44 object-cover"
          />
        </div>

        <div className="w-full md:w-6/12">
          <h2 className="text-xl md:text-3xl font-medium text-gray-800 flex items-center">
            {profile.fullname || "Full Name"}
            <button onClick={() => setIsModalOpen(true)} className="ml-4">
              <GoPencil className='w-5 h-5 ' />
            </button>
          </h2>
          <p className='my-1 text-xs md:text-sm text-gray-400'>
            Profile last updated - <span className='text-gray-600 font-semibold'>09Nov, 2024</span>
          </p>

          <hr className="my-4 w-40 md:w-full border-t-1 border-gray-300" />

          <div className="flex flex-col md:flex-row items-start pr-10 space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex flex-col space-y-1">
              <p className="flex items-center mb-3">
                <CiLocationOn className='w-4 h-4 mr-2 ' />
                <span className='text-gray-500 text-sm font-medium'>
                  {profile.address?.city || "City not set"}
                </span>
              </p>
              <div className="mb-3">
                <p className="flex mb-3 items-center">
                  <LuShoppingBag className='w-4 h-4 mr-2 ' />
                  <span className='text-gray-500 text-sm font-medium'>
                    New Joining
                  </span>
                </p>
              </div>
              <p className="flex items-center">
                <CiCalendar className='w-4 h-4 mr-2 ' />
                <span className='text-gray-500 text-sm font-medium'>
                  Available to join in 15 Days
                </span>
              </p>
            </div>

            <div className="hidden md:block w-px h-20 bg-gray-400"></div>

            <div className="flex flex-col space-y-1">
              <p className="flex items-center mb-3">
                <CiPhone className='w-4 h-4 mr-2' />
                <span className='text-gray-500 text-sm font-medium'>
                  {profile.phone || "Not set"}
                </span>
              </p>
              <p className="flex items-center">
                <CiMail className='w-4 h-4 mr-2' />
                <span className='text-gray-500 text-sm font-medium'>
                  {profile.email || "Email not set"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-4/12 flex flex-col items-start border-0 bg-teal-50 rounded-xl p-4 h-56">
          <h2 className="font-semibold flex items-center space-x-2">
            <div className='w-7 h-7 item-center rounded-full bg-white px-2 py-1'>
              <FaMobileScreenButton className="w-5 h-5 pr-2" />
            </div>
            <span className='text-xs md:text-sm text-gray-500 font-bold'>
              Verify mobile number
            </span>
          </h2>

          <h2 className="text-xs md:text-sm text-gray-500 font-semibold flex items-center space-y-2 space-x-2 mt-2">
            <div className='w-7 h-7 item-center rounded-full bg-white px-2 py-1'>
              <FaLocationDot className="w-5 h-5 pr-2" />
            </div>
            <span className='text-xs md:text-sm text-gray-500 font-bold'>
              Add preferred location
            </span>
          </h2>

          <div className="mt-auto w-full items-center flex justify-center">
            <button className="bg-teal-600 rounded-full text-white px-3 py-2 text-sm font-bold">
              Add 10 missing details
            </button>
          </div>
        </div>

      </div>



      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
            <div className="flex justify-between">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <button className="" type="button"
                  onClick={() => setIsModalOpen(false)} >
            <RxCross2 />
            </button>
            </div>

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
