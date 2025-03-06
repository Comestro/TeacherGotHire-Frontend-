import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../services/authUtils"; // Import the login function from authUtils
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar/Navbar";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Login Page</title>
      </Helmet>
      <CustomHeader />
      {loading && <Loader />}
      <div
        className="flex bg-cover bg-no-repeat md:items-center md:justify-center min-h-screen"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex md:pl-72  md:p-0 mt-20 md:mt-0">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
              Hello,{" "}
              <span className="font-bold text-teal-600">User</span>
            </h2>
            <h2 className=" font-bold text-gray-500 text-xl md:text-4xl leading-none">
              Sign in to{" "}
              <span className="font-bold text-xl md:text-4xl text-teal-600">
                PTPI
              </span>
            </h2>
            <p className="text-sm font-medium text-gray-600 mt-2 mb-4">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/signup/teacher")}
                className="text-teal-600 hover:underline font-semibold cursor-pointer"
              >
                Sign Up
              </span>
            </p>

            <form onSubmit={handleSubmit((data) => login({ ...data, navigate, setError, setLoading }))} className="space-y-5">
              {/* Email */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium  text-gray-700 mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  id="email"
                  className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                  {...register("email", {
                    required: true,
                    validate: {
                      matchPattern: (value) =>
                        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                          value
                        ) || "Email address must be valid",
                    },
                  })}
                />
              </div>

              {/* Password */}
              <div className="mb-4 relative">
                <label
                  className="block text-sm font-medium  text-gray-700 mb-1"
                  htmlFor="pass"
                >
                  Password
                </label>
                <Input
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"} // Toggle input type based on showPassword state
                  id="pass"
                  className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 pr-10" // Add padding for the eye icon
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-7"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}{" "}
                  {/* Toggle eye icon based on showPassword state */}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition flex items-center justify-center ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            <div className="text-center my-4">
              <div className="flex items-center">
                <hr className="flex-grow border-gray-300" />
                <span className="px-4 text-sm text-gray-600">Or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <div className="flex flex-col space-y-4 mt-4">
                <Button
                  onClick={() => navigate("/signup/teacher")}
                  textColor="text-teal-600"
                  className="w-full bg-white border-2 border-teal-600 py-2 rounded-xl hover:bg-teal-50 transition"
                >
                  Register as Teacher
                </Button>
                <Button
                  onClick={() => navigate("/signup/recruiter")}
                  textColor="text-teal-600"
                  className="w-full bg-white border-2 border-teal-600 py-2 rounded-xl hover:bg-teal-50 transition"
                >
                  Register as Recruiter
                </Button>
                {/* <p className="text-sm font-medium text-gray-600">
                  <span
                    onClick={() => navigate("/forgot-password")}
                    className="text-teal-600 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </span>
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="hidden md:flex w-full md:w-1/2 flex-col pl-36 justify-center h-screen p-10">
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
                Enter Credentials
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
                Login Successful
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                3
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Go to Dashboard
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;