import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import Input from './Input';
import Button from './Button';

function SignUpPage() {
  const { role } = useParams(); // Get the role from the URL
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');

  const signup = async (data) => {
    console.log(data);
    if (role === 'teacher') {
      navigate('/teacherdashbord');
    } else {
      navigate('/schooladmindashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden justify-center w-full h-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Form Section */}
        <div className='w-full justify-center'>
          <div className="p-8 flex flex-col justify-center w-full h-screen space-y-4">
            <h1 className="text-4xl font-bold mb-6 text-gray-700 text-center">Signup to <span className='text-4xl text-teal-600 font-bold'>PTPI</span></h1>
            <form onSubmit={handleSubmit(signup)} className="flex justify-center w-full">
              {/* Full Name */}
              <div className='w-[400px] space-y-3'>
                <div>
                  <label className="block text-sm font-semibold text-zinc-900">Full Name</label>
                  <input
                    className="w-full rounded-xl border border-gray-400 px-3 py-2 mt-1  focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your full name"
                    {...register("name", { required: true })}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    className="w-full rounded-xl border  border-gray-400   px-3 py-2 mt-1 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your email"
                    type="email"
                    {...register("email", {
                      required: true,
                      validate: {
                        matchPattern: (value) =>
                          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Email address must be valid",
                      },
                    })}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    className="w-full rounded-xl border border-gray-400 px-3 py-2 mt-1 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your password"
                    type="password"
                    {...register("password", { required: true })}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    className="w-full rounded-xl border  border-gray-400 px-3 py-2 mt-1 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Confirm your password"
                    type="password"
                    {...register("confirmPassword", { required: true })}
                  />
                </div>

                {/* Role-Specific Input */}
                {role === "teacher" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School Name</label>
                    <input
                      className="w-full rounded-xl border border-gray-400  px-3 py-2 mt-1 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your school name"
                      {...register("schoolName", { required: true })}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-5 bg-teal-600 text-white font-semibold py-3 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            </form>
            <div className="flex flex-col items-center w-full mt-8">
      {/* Divider */}
      <div className="flex items-center justify-center px-[21%] w-full my-4">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-500">Or</span>
        <hr className="w-full border-gray-300" />
      </div>

      {/* Social Login Buttons */}
      <div className="flex space-x-4">
        {/* Google Button */}
        <button
          className="flex items-center justify-center border border-gray-300 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 transition duration-300"
          onClick={() => alert("Sign in with Google clicked")}
        >
          <img
            src="https://img.icons8.com/color/48/google-logo.png"
            alt="Google Logo"
            className="w-5 h-5 mr-2"
          />
          <span className="text-sm font-medium">Sign in with Google</span>
        </button>

        {/* Apple Button */}
        <button
          className="flex items-center justify-center border border-gray-300 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100 transition duration-300"
          onClick={() => alert("Sign in with Apple clicked")}
        >
          <img
            src="https://img.icons8.com/ios-filled/50/000000/mac-os.png"
            alt="Apple Logo"
            className="w-5 h-5 mr-2"
          />
          <span className="text-sm font-medium">Sign in with Apple</span>
        </button>
      </div>

      {/* Sign In Link */}
          {/* Sign In Link */}
          <p className="mt-6 text-center text-xs text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline cursor-pointer font-semibold"
              >
                Sign In
              </span>
            </p>
      
    </div>

        
          </div>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="School"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
