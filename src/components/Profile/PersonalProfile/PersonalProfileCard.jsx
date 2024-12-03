
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { CiCalendar, CiLocationOn, CiMail, CiPhone } from 'react-icons/ci';
import { FaLocationDot, FaMobileScreenButton } from 'react-icons/fa6';
import { GoPencil } from 'react-icons/go';
import { LuShoppingBag } from 'react-icons/lu';
import { getProfile} from "../../../features/personalProfileSlice";
import { updatePersonalProfile  } from "../../../services/profileServices";
import Input from "../../Input";
import { RxCross2 } from "react-icons/rx";

const PersonalProfileCard = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.personalProfile.profileData);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");



  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const onSubmit = async (data) => {

    try {
      const response = await updatePersonalProfile (data);
      console.log(response)
      dispatch(updateProfile(data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="">
      
      {/* Profile Section */}
      <div>
      {
        profile.map((profile) => (
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
  
  
        ))
      }
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

