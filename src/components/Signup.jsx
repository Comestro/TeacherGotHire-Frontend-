import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createaccount } from "../services/authServices";
import { login } from "../services/authUtils"; // Import the login function from authUtils
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import Navbar from "./Navbar/Navbar";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";

function SignUpPage() {
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
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

  const password = watch("password");
  const inputClass = `w-full border-2 text-sm rounded-xl px-3 py-3 ${
    errors.email
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:border-green-500"
  }`;

  const signup = async ({ Fname, Lname, email, password }) => {
    console.log(email, password);
    setError("");
    setLoading(true); // Set loading to true

    try {
      const userData = await createaccount({ Fname, Lname, email, password });
      console.log("userData", userData);
      if (userData) {
        setSuccessMessage("Account created successfully.");
        // Call the login function after successful signup
        await login({ email, password, navigate, setError, setLoading });
      }
    } catch (error) {
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <>
      <CustomHeader />
      <Helmet>
        <title>PTPI | Signup Page</title>
      </Helmet>
      {loading && <Loader />} {/* Show loader while loading */}
      <div
        className="flex bg-cover bg-no-repeat mt-3  items-center justify-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex items-center md:pl-72 justify-center md:p-0 p-8 ">
          <div className="max-w-md w-full mt-5">
            <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
              Hello,{" "}
              <span className="font-bold text-teal-600">Teachers </span>
            </h2>
            <h2 className="mb-2 font-bold text-gray-500 text-xl md:text-4xl leading-none">
              Signup To{" "}
              <span className="font-bold text-xl md:text-4xl text-teal-600">
                PTPI{" "}
              </span>
            </h2>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600">
                Have an account?{" "}
                <span
                  onClick={() => navigate("/signin")}
                  className="text-teal-600 hover:underline font-semibold"
                >
                  Sign In
                </span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-center mb-4">{error}</p>
            )}

            <form
              onSubmit={handleSubmit(signup)}
              className="space-y-4 mb-5"
            >
              {/* Full Name */}
              <div className="flex gap-2">
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    className={inputClass}
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
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    className={inputClass}
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
                  className={inputClass}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
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
                  className={inputClass}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
              </div> 

              {/* Confirm Password */}
               <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  placeholder="Confirm your password"
                  type="password"
                  className={inputClass}
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
                
             

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-2 rounded-xl transition  ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {loading ? "Sending..." : "Sign Up"}
              </Button>
            </form>

            {error && (
              <p className="text-red-500 text-sm mt-4">Error: {error}</p>
            )}
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
}

export default SignUpPage;
