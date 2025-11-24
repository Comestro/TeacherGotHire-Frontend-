import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
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
        err.is_verified == false || // Check for the flag from authServices
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
      console.log(response);

      if (response.data.access_token) {
        toast.success("Account verified successfully! Please log in.");

        // Set showOTPForm to false to return to login form
        setShowOTPForm(false);
        setOtp("");

        // Do not auto-login. User must log in manually.
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
        <div className="w-full animate-fadeIn">
          <div className="space-y-2 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Verify Email</h2>
            <p className="text-gray-500">
              We've sent a code to <span className="font-medium text-teal-600">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                className="w-full bg-gray-50/50 border border-gray-200 text-center text-2xl tracking-[0.5em] font-bold rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                placeholder="000000"
                pattern="\d{6}"
                maxLength={6}
                inputMode="numeric"
                required
              />
              {otp && otp.length < 6 && (
                <p className="mt-2 text-sm text-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Please enter a 6-digit code
                </p>
              )}
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in <span className="text-teal-600 font-bold">{timer}s</span>
                </p>
              ) : (
                canResend && (
                  <button
                    type="button"
                    onClick={() => handleResendOTP()}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors flex items-center justify-center mx-auto space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>Resend Verification Code</span>
                  </button>
                )
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all duration-200 ${loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verifying...
                  </span>
                ) : "Verify & Login"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowOTPForm(false);
                  setOtp("");
                }}
                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full animate-fadeIn">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-500">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <Input
                placeholder="name@example.com"
                type="email"
                id="email"
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.email
                  ? isEmailValid(watchedFields.email)
                    ? "border-teal-500 bg-teal-50/30"
                    : "border-red-300 bg-red-50/30"
                  : "border-gray-200"
                  }`}
                {...register("email", {
                  required: "Email is required",
                  validate: (value) => isEmailValid(value) || "Invalid email address",
                })}
              />
              {dirtyFields.email && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {isEmailValid(watchedFields.email) ? (
                    <FaCheckCircle className="text-teal-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                id="pass"
                className={`w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.password
                  ? watchedFields.password?.length >= 6
                    ? "border-teal-500 bg-teal-50/30"
                    : "border-red-300 bg-red-50/30"
                  : "border-gray-200"
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform hover:-translate-y-0.5 transition-all duration-200 ${!isValid || loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            disabled={!isValid || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>


        </div>



        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup/teacher" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
              Create account
            </Link>
          </p>
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-200/30 to-cyan-200/30 blur-3xl animate-float" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-purple-200/30 to-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-emerald-200/30 to-lime-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

            {/* Left Side: Hero Content (Hidden on mobile) */}
            <div className="hidden md:block w-1/2 space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Welcome Back to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                    Teacher Got Hired
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  Your gateway to the best teaching opportunities and top-tier educators. Sign in to continue your journey.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">For Recruiters</h3>
                    <p className="text-sm text-gray-500">Find the perfect candidate efficiently</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">For Teachers</h3>
                    <p className="text-sm text-gray-500">Access premium job listings instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-cyan-500" />

                {renderForm()}
              </div>

              <p className="text-center text-gray-500 text-sm mt-8">
                &copy; {new Date().getFullYear()} PTPI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
