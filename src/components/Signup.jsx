import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createaccount, verifyTeacherOtp, resendTeacherOtp } from "../services/authServices";
import { login } from "../services/authUtils";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);

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

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await resendTeacherOtp(userEmail);
      setTimer(30);
      setCanResend(false);
      toast.success('OTP resent successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "onChange",
    criteriaMode: "all"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false
  });
  
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');

  const watchedFields = watch();
  const password = watchedFields.password;

  useEffect(() => {
    if (password) {
      setPasswordCriteria({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
    }
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  const getInputClassName = (fieldName) => {
    return `w-full border-2 text-sm rounded-xl p-3 transition-colors ${
      dirtyFields[fieldName]
        ? errors[fieldName]
          ? "border-red-500 focus:border-red-500"
          : "border-teal-600 focus:border-teal-600"
        : "border-gray-300 focus:border-teal-600"
    }`;
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await verifyTeacherOtp({
        email: userEmail,
        otp: otp
      });

      if (response.access_token) {
        toast.success('Account verified successfully!');
        navigate('/teacher');
      }
    } catch (error) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ Fname, Lname, email, password }) => {
    setError("");
    setLoading(true);
  
    try {
      const userData = await createaccount({ Fname, Lname, email, password });
      if (userData) {
        toast.success("Account created! Please verify your email.");
        setUserEmail(email);
        setShowOTPForm(true);
        setTimer(30); 
        setCanResend(false); 
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8 flex items-center justify-center">
          <div className="">
          <div className="space-y-2 mb-6 ">
            <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl leading-tight">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              Please enter the OTP sent to {userEmail}
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-4 mb-40 md:mb-0">
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
                  Resend OTP in <span className="text-teal-600 font-medium">{timer}s</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className={`w-full bg-teal-600 text-white py-3 rounded-xl transition duration-200 ${
                  loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : "hover:bg-teal-700"
                }`}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              {canResend && (
                <button
                  type="button"
                  onClick={handleResendOTP}
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
                    <span className="text-teal-600 font-medium">Resend OTP</span>
                  </div>
                </button>
              )}
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
            Hello, <span className="text-teal-600">Teachers</span>
          </h2>
          <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl md:text-4xl leading-tight">
            Signup To <span className="text-teal-600">PTPI</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit(signup)} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name
              </label>
              <div className="relative">
                <Input
                  className={getInputClassName("Fname")}
                  placeholder="Enter your first name"
                  {...register("Fname", {
                    required: "First name is required",
                  })}
                />
                {dirtyFields.Fname && !errors.Fname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
                )}
              </div>
              {errors.Fname && (
                <p className="mt-1 text-sm text-red-600">{errors.Fname.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <Input
                  className={getInputClassName("Lname")}
                  placeholder="Enter your last name"
                  {...register("Lname", {
                    required: "Last name is required",
                  })}
                />
                {dirtyFields.Lname && !errors.Lname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
                )}
              </div>
              {errors.Lname && (
                <p className="mt-1 text-sm text-red-600">{errors.Lname.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Input
                placeholder="Enter your email"
                type="email"
                className={getInputClassName("email")}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {dirtyFields.email && !errors.email && (
                <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                className={getInputClassName("password")}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  validate: (value) => {
                    if (!/\d/.test(value)) return "Password must contain at least one number";
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Password must contain at least one special character";
                    return true;
                  }
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
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}

            {/* Password Criteria */}
            <div className="mt-2 space-y-1">
              <p className={`text-xs ${passwordCriteria.length ? 'text-teal-600' : 'text-gray-500'}`}>
                ✓ At least 8 characters
              </p>
              <p className={`text-xs ${passwordCriteria.number ? 'text-teal-600' : 'text-gray-500'}`}>
                ✓ Contains a number
              </p>
              <p className={`text-xs ${passwordCriteria.special ? 'text-teal-600' : 'text-gray-500'}`}>
                ✓ Contains a special character
              </p>
            </div>
          </div>

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
              "Sign Up as Teacher"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signup/recruiter")}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-teal-600 text-sm font-medium rounded-xl text-white hover:bg-teal-700 transition duration-200"
          >
            Sign up as Recruiter
          </button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/signin")}
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-3 border border-teal-600 text-sm font-medium rounded-xl text-teal-600 bg-white hover:bg-teal-50 transition duration-200"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <CustomHeader />
      <Helmet>
        <title>PTPI | Signup Page</title>
      </Helmet>
      {loading && <Loader />}
      <ToastContainer />
      <div
        className="flex min-h-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
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
                Create Account
              </h3>
              <p className="text-gray-500 mt-1">
                Fill in your details to create your account
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
                Verify Email
              </h3>
              <p className="text-gray-500 mt-1">
                Confirm your email address
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
                Complete Profile
              </h3>
              <p className="text-gray-500 mt-1">
                Set up your teacher profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
