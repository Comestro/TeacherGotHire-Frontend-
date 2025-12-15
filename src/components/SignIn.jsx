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
  FaUserTie,
  FaChalkboardTeacher,
  FaArrowRight
} from "react-icons/fa";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorMessage from "./ErrorMessage";

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
  const [loginError, setLoginError] = useState(null);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const watchedFields = watch();
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
    setLoginError(null);

    try {
      await login(data);
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
      const errorMessage = err.message || "An error occurred during login";
      if (errorMessage.toLowerCase().includes("csrf") || errorMessage.toLowerCase().includes("session expired")) {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
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
        const email = getValues("email");
        setUserEmail(email);
        setShowOTPForm(true);
        setTimer(30);
        setCanResend(false);
        handleResendOTP(email);
      } else {
        setLoginError(errorMessage);
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
    setLoginError(null);

    try {
      const response = await verifyTeacherOtp({
        email: userEmail,
        otp: otp,
      });
      console.log(response);

      if (response.data.access_token) {
        toast.success("Account verified successfully! Please log in.");
        setShowOTPForm(false);
        setOtp("");
      }
    } catch (error) {
      setLoginError(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => {
    if (!email || email.length < 3) return false;
    if (!email.includes('@')) return false;
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    if (!parts[0] || !parts[1]) return false;
    return true;
  };
  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full animate-fadeIn">
          <div className="space-y-2 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-4 border border-teal-100">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Verify Email</h2>
            <p className="text-slate-500">
              We've sent a code to <span className="font-medium text-teal-600">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <ErrorMessage
              message={loginError}
              onDismiss={() => setLoginError(null)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                className="w-full bg-white border border-slate-200 text-center text-2xl tracking-[0.5em] font-bold rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
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
                <p className="text-sm text-slate-500">
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
                className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-teal-700 transform hover:-translate-y-0.5 transition-all duration-200 ${loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : ""
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
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors"
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
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome Back
          </h2>
          <p className="text-slate-500">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <ErrorMessage
            message={loginError}
            onDismiss={() => setLoginError(null)}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </div>
              <Input
                placeholder="name@example.com"
                type="email"
                id="email"
                className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.email
                  ? isEmailValid(watchedFields.email)
                    ? "border-teal-500 bg-teal-50/10"
                    : "border-red-300 bg-red-50/10"
                  : "border-slate-200"
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
            <label className="block text-sm font-medium text-slate-700 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                id="pass"
                className={`w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.password
                  ? watchedFields.password?.length >= 6
                    ? "border-teal-500 bg-teal-50/10"
                    : "border-red-300 bg-red-50/10"
                  : "border-slate-200"
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500">
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
            className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-teal-700 transform hover:-translate-y-0.5 transition-all duration-200 ${!isValid || loading ? "opacity-60 cursor-not-allowed" : ""
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
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500">
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
      <div className="flex items-center justify-center relative overflow-hidden bg-slate-50 py-5">

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

            {/* Left Side: Hero Content (Hidden on mobile) */}
            <div className="hidden md:block w-1/2 space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                  Welcome Back to <br />
                  <span className="text-teal-600">
                    Teacher Got Hired
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-md">
                  Your gateway to the best teaching opportunities and top-tier educators. Sign in to continue your journey.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <FaUserTie className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">For Recruiters</h3>
                    <p className="text-sm text-slate-500">Find the perfect candidate efficiently</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaChalkboardTeacher className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">For Teachers</h3>
                    <p className="text-sm text-slate-500">Access premium job listings instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 relative overflow-hidden">
                {renderForm()}
              </div>

              <p className="text-center text-slate-400 text-sm mt-8">
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
