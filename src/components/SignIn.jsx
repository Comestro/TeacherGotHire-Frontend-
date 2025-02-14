import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getResendOtp } from "../features/authSlice"; // Redux action to store the user login state
import {
  login as loginService,
  verifyOtp,
} from "../services/authServices"; // Service to authenticate the user
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar/Navbar";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const login = async ({ email, password }) => {
    setError("");
    setLoading(true);

    try {
      const userData = await loginService({ email, password }); // Call the service function to authenticate the user

      if (userData) {
        if (userData?.role === "recruiter") {
          navigate("/recruiter");
        } else if (userData?.role === "teacher") {
          navigate("/teacher");
        } else if (userData?.role === "centeruser") {
          navigate("/examcenter");
        } else if (userData?.role === "questionuser") {
          navigate("/subject-expert");
        }
        else {
          navigate("/admin/dashboard");
        }
      }
    } catch (error) {
      if (error.status === 403) {
        setError(
          "Your account is not verified. Please verify your account to log in."
        );
        setOtpSent(true); // Optional: Trigger OTP resend logic
        setEmail(email); // Store the email for OTP resend later

        try {
          const otpResponse = await getResendOtp(email).unwrap();
          if (otpResponse.status === 200) {
            setSuccessMessage("An OTP has been sent to your email.");
          } else {
            setError(
              "Failed to send verification email. Please try again later."
            );
          }
        } catch (otpError) {
          setError(
            otpError.message || "Failed to resend OTP. Please try again later."
          );
        }
      } else if (error.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (error.status === 400) {
        setError("Bad request. Please check your input.");
      } else if (error.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const verifyOtpHandler = async () => {
    setError("");
    setLoading(true); // Set loading to true
    setSuccessMessage("");
    try {
      const response = await verifyOtp({ email, otp });
      if (response) {
        if (response.data?.role === "recruiter") {
          navigate("/recruiter");
        } else if (response.data?.role === "teacher") {
          navigate("/teacher");
        }
        else if (response.data?.role === "centeruser") {
          navigate("/examcenter");
        } 
        else if (response.data?.role === "questionuser") {
          navigate("/subject-expert");
        }
        else {
          navigate("/admin/dashboard");
        }
      }
     else {
      setError(response.message || "Invalid OTP. Please try again.");
    }
  } catch (error) {
    setError(error.name || "Failed to verify OTP. Please try again.");
  } finally {
    setLoading(false); // Set loading to false
  }
};

return (
  <>
    <Helmet>
      <title>PTPI | Login Page</title>
    </Helmet>
    {loading && <Loader />} {/* Show loader while loading */}

    <div
      className="flex bg-cover bg-no-repeat items-center justify-center mt-5"
      style={{ backgroundImage: 'url("/bg.png")' }}
    >
      {/* Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:pl-20">
        <div className="max-w-lg w-full mt-5 bg-white rounded-lg p-6">
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {!otpSent ? (
            <>
              <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
                Hello,{" "}
                <span className="font-bold text-teal-600">Teachers</span>
              </h2>
              <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
                Sign in to{" "}
                <span className="font-bold text-xl md:text-4xl text-teal-600">
                  PTPI
                </span>
              </h2>

              <form onSubmit={handleSubmit(login)} className="space-y-5">
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
                  className={`w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition flex items-center justify-center ${loading ? "cursor-not-allowed" : ""
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

                <p className="text-sm font-medium text-gray-600 mt-6">
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate("/signup/teacher")}
                    className="text-teal-600 hover:underline font-semibold"
                  >
                    Sign Up
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-600 mt-6">
                  <span
                    onClick={() => navigate("/forgot-password")}
                    className="text-teal-600 hover:underline font-semibold"
                  >
                    Forgot-Password
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              {successMessage && (
                <p className="bg-green-200 text-green-900 px-3 py-2 rounded border border-green-700 text-center mb-4">
                  {successMessage}
                </p>
              )}
              <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
                Verify OTP
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border-2 text-sm rounded-xl px-3 py-3 border-gray-300 focus:border-green-500"
                />
              </div>
              <Button
                onClick={verifyOtpHandler}
                disabled={!otp || loading} // Disable button when loading or OTP is empty
                className={`w-full py-2 rounded-xl transition ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          )}
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
