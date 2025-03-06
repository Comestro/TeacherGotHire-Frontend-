import React from 'react'
import { createRecruiteraccount } from '../services/authServices'
import { useState } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { recruiterPostData } from "../features/authSlice";
import CustomHeader from './commons/CustomHeader';

const RecruiterSignUpPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const password = watch("password");

    const recruitersign = async ({ Fname, Lname, email, password }) => {
      setError("");
      setLoading(true);
    
      try {
        const response = await createRecruiteraccount({ Fname, Lname, email, password });
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          dispatch(recruiterPostData(response));
          navigate("/signin");
        }
      } catch (error) {
        setError(error.message || "Failed to create account. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
        <>
        <CustomHeader />
      <div
        className="flex bg-cover bg-no-repeat items-center justify-center min-h-screen"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex items-center md:pl-72 justify-center p-6 md:p-0">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
           <>
           <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
              Hello, <span className="font-bold text-teal-600">Recruiters </span>
            </h2>
            <h2 className=" font-bold text-gray-500 text-xl md:text-4xl leading-none">
              Signup To{" "}
              <span className="font-bold text-xl md:text-4xl text-teal-600">
                PTPI{" "}
              </span>
            </h2>

            <p className="text-sm font-medium text-gray-600 mt-2 mb-4">
                 I have an account? {" "}
                <span
                  onClick={() => navigate("/signin")}
                  className="text-teal-600 hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </span>
              </p>

            {/* Error Message */}
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}
           
            <form onSubmit={handleSubmit(recruitersign)} className="space-y-5">
              {/* Full Name */}
              <div className="flex gap-2">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    className={`w-full border-2 text-sm rounded-xl px-3 py-3 ${
                      errors.Fname
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-green-500"
                    }`}
                    placeholder="Enter your first name"
                    {...register("Fname", {
                      required: "First name is required",
                    })}
                  />

                  {errors.Fname && (
                    <span className="text-red-500 text-sm">
                      {errors.Fname.message}
                    </span>
                  )}
                </div>
                <div className='w-full'>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    className={`w-full border-2 text-sm rounded-xl px-3 py-3 ${
                      errors.Lname
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:bordser-green-500"
                    }`}
                    placeholder="Enter your last name"
                    {...register("Lname", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.Lname && (
                    <span className="text-red-500 text-sm">
                      {errors.Lname.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className={`w-full border-2 text-sm rounded-xl px-3 py-3 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:bordser-green-500"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {error.email && (
                  <span className="text-red-500 text-sm">{error}</span>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  className={`w-full border-2 text-sm rounded-xl px-3 py-3 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:bordser-green-500"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  placeholder="Confirm your password"
                  type="password"
                  className={`w-full border-2 text-sm rounded-xl px-3 py-3 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:bordser-green-500"
                  }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition duration-200`}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
           </>
          </div>
        </div>

        <div className="w-full md:w-1/2 hidden md:flex flex-col pl-36 justify-center h-screen p-10 ">
          {/* Step 1 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold">
                1
              </div>
              <div className="h-12 w-1 bg-teal-500"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Get Signup Completed
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                2
              </div>
              <div className="h-12 w-1 bg-gray-300"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Select Teacher in Progress
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                3
              </div>
              <div className="h-12 w-1 bg-gray-300"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Take interview
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                4
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Hire Teacher
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
    );
};

export default RecruiterSignUpPage;