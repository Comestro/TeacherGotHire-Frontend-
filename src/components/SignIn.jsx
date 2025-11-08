import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  login,
  verifyTeacherOtp,
  resendTeacherOtp,
} from "../services/authServices";
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar/Navbar";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    getValues,
  } = useForm({
    mode: "onChange",
    criteriaMode: "all",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States for OTP verification
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const watchedFields = watch();

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (showOTPForm && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, showOTPForm]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (token && role) {
      switch (role) {
        case "recruiter":
          navigate("/recruiter");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "centeruser":
          navigate("/examcenter");
          break;
        case "questionuser":
          navigate("/manage-exam");
          break;
        default:
          navigate("/admin/dashboard");
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await login(data);

      // If login is successful, navigate based on role
      const role = localStorage.getItem("role");
      if (role === "recruiter") {
        navigate("/recruiter");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else if (role === "centeruser") {
        navigate("/examcenter");
      } else if (role === "questionuser") {
        navigate("/manage-exam");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      

      // Check if error is related to account verification
      const errorMessage = err.message || "An error occurred during login";

      // Handle CSRF token error specifically
      if (errorMessage.toLowerCase().includes("csrf") || errorMessage.toLowerCase().includes("session expired")) {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        // Reload the page to get a fresh CSRF token
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      if (
        errorMessage.toLowerCase().includes("verify") ||
        errorMessage.toLowerCase().includes("verification") ||
        errorMessage.toLowerCase().includes("activate") ||
        errorMessage.toLowerCase().includes("account not active") ||
        errorMessage.toLowerCase().includes("please verify your account")
      ) {
        // Instead of just showing verification error, show OTP form
        const email = getValues("email");
        setUserEmail(email);
        setShowOTPForm(true);
        setTimer(30);
        setCanResend(false);

        // Trigger sending OTP automatically
        handleResendOTP(email);
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (email = null) => {
    const emailToUse = email || userEmail;

    if (!emailToUse) {
      toast.error("Email address is required for verification");
      return;
    }

    setLoading(true);

    try {
      
      await resendTeacherOtp(emailToUse);

      setTimer(30);
      setCanResend(false);

      toast.success("Verification code sent successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      
      toast.error(err.message || "Failed to send verification code", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await verifyTeacherOtp({
        email: userEmail,
        otp: otp,
      });

      if (response.access_token) {
        toast.success("Account verified successfully!");

        // Set showOTPForm to false to return to login form
        setShowOTPForm(false);
        setOtp("");

        // Store token if received
        if (response.access_token) {
          localStorage.setItem("access_token", response.access_token);

          // If role is also returned, store and navigate
          if (response.role) {
            localStorage.setItem("role", response.role);

            // Determine where to navigate based on user role
            switch (response.role) {
              case "recruiter":
                navigate("/recruiter");
                return;
              case "teacher":
                navigate("/teacher");
                return;
              case "centeruser":
                navigate("/examcenter");
                return;
              case "questionuser":
                navigate("/subject-expert");
                return;
              default:
                navigate("/admin/dashboard");
                return;
            }
          }
        }

        // If no navigation happened (no role or token), show login form with success message
        toast.info("Please login with your credentials now", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => {
    // Visual feedback should be lenient during typing
    if (!email || email.length < 3) return false;
    if (!email.includes('@')) return false;
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    if (!parts[0] || !parts[1]) return false;
    // Don't require dot for visual feedback - allow during typing
    return true;
  };

  // Render the appropriate form based on state
  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8 flex items-center justify-center">
          <div className="">
            <div className="space-y-2 mb-6">
              <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl leading-tight">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                Please enter the OTP sent to {userEmail}
              </p>
            </div>

            <form
              onSubmit={handleOTPSubmit}
              className="space-y-4 mb-40 md:mb-0"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={handleOTPChange}
                  className="w-full border-2 text-sm rounded-xl p-3 transition-colors border-gray-300 focus:border-teal-600"
                  placeholder="Enter 6-digit OTP"
                  pattern="\d{6}"
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
                {otp && otp.length < 6 && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a 6-digit OTP
                  </p>
                )}
              </div>

              {/* Timer Display */}
              <div className="text-center">
                {timer > 0 && (
                  <p className="text-gray-600">
                    Resend OTP in{" "}
                    <span className="text-teal-600 font-medium">{timer}s</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className={`w-full bg-teal-600 text-white py-3 rounded-xl transition duration-200 ${
                    loading || otp.length !== 6
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-teal-700"
                  }`}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                {canResend && (
                  <button
                    type="button"
                    onClick={() => handleResendOTP()}
                    className="w-full group relative px-4 py-3 rounded-xl overflow-hidden border-2 border-teal-500 hover:border-teal-600 transition-colors"
                    disabled={loading}
                  >
                    {/* Background Shine Effect */}
                    <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Button Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5 text-teal-600 group-hover:rotate-180 transition-transform duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span className="text-teal-600 font-medium">
                        Resend OTP
                      </span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowOTPForm(false);
                    setOtp("");
                  }}
                  className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8">
        <div className="space-y-2 mb-6">
          <h2 className="font-bold text-gray-500 text-lg sm:text-xl leading-tight">
            Hello, <span className="text-teal-600">User</span>
          </h2>
          <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl md:text-4xl leading-tight">
            Sign in to <span className="text-teal-600">PTPI</span>
          </h2>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-5"
        >
          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <Input
                placeholder="Enter your email"
                type="email"
                id="email"
                className={`w-full border-2 text-sm rounded-xl p-3 pr-10 transition-colors ${
                  dirtyFields.email
                    ? isEmailValid(watchedFields.email)
                      ? "border-teal-600 focus:border-teal-600"
                      : "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-teal-600"
                }`}
                {...register("email", {
                  required: "Email is required",
                  validate: (value) => {
                    // More lenient validation that allows partial emails during typing
                    if (!value) return "Email is required";
                    if (value.length < 3) return true; // Allow short emails during typing
                    if (!value.includes('@')) return "Email must contain @";
                    const parts = value.split('@');
                    if (parts.length !== 2) return "Invalid email format";
                    if (!parts[0]) return "Email username is required";
                    if (!parts[1]) return "Email domain is required";
                    if (!parts[1].includes('.')) return "Email domain must contain a dot";
                    // Only do strict validation if it looks like a complete email
                    if (parts[1].split('.').length < 2) return true; // Allow during typing
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please enter a valid email address";
                  }
                })}
              />
              {dirtyFields.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isEmailValid(watchedFields.email) ? (
                    <FaCheckCircle className="text-teal-600" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="pass"
            >
              Password
            </label>
            <div className="relative">
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                id="pass"
                className={`w-full border-2 text-sm rounded-xl p-3 pr-10 transition-colors ${
                  dirtyFields.password
                    ? watchedFields.password?.length >= 6
                      ? "border-teal-600 focus:border-teal-600"
                      : "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-teal-600"
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex justify-end mb-4">
            <a
              href="/forgot-password"
              className="text-teal-600 hover:underline text-sm"
            >
              Forgot password?
            </a>
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            className={`w-full bg-teal-600 text-white py-3 rounded-xl transition duration-200 flex items-center justify-center ${
              !isValid || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-teal-700"
            }`}
            disabled={!isValid || loading}
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

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-sm text-gray-500">Or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/signup/teacher")}
              textColor="text-teal-600"
              className="w-full bg-white border-2 border-teal-600 py-3 rounded-xl hover:bg-teal-50 transition duration-200"
            >
              Register as Teacher
            </Button>
            <Button
              onClick={() => navigate("/signup/recruiter")}
              textColor="text-teal-600"
              className="w-full bg-white border-2 border-teal-600 py-3 rounded-xl hover:bg-teal-50 transition duration-200"
            >
              Register as Recruiter
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Login Page</title>
      </Helmet>
      <CustomHeader />
      {loading && <Loader />}
      <ToastContainer />
      <div
        className="flex min-h-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex justify-center md:pl-16 lg:pl-24 xl:pl-32 mt-16 md:mt-0">
          {renderForm()}
        </div>

        {/* Timeline - Hidden on mobile, shown on md screens and up */}
        <div className="hidden md:flex w-1/2 flex-col justify-center pl-16 lg:pl-24">
          {/* Step 1 */}
          <div className="flex items-start space-x-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 text-white font-bold text-lg">
                1
              </div>
              <div className="h-16 w-1 bg-teal-600"></div>
            </div>
            <div className="pt-2">
              <h3 className="text-gray-700 font-bold text-xl">
                {showOTPForm ? "Verify Email" : "Enter Credentials"}
              </h3>
              <p className="text-gray-500 mt-1">
                {showOTPForm
                  ? "Confirm your email with OTP verification"
                  : "Sign in with your registered email and password"}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                2
              </div>
              <div className="h-16 w-1 bg-gray-300"></div>
            </div>
            <div className="pt-2">
              <h3 className="text-gray-700 font-bold text-xl">
                Login Successful
              </h3>
              <p className="text-gray-500 mt-1">
                Verification and authentication complete
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                3
              </div>
            </div>
            <div className="pt-2">
              <h3 className="text-gray-700 font-bold text-xl">
                Go to Dashboard
              </h3>
              <p className="text-gray-500 mt-1">
                Access your personalized dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
