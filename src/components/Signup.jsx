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

  const getInputClassName = (fieldName) => {
    return `w-full border-2 text-sm rounded-xl p-3 transition-colors ${dirtyFields[fieldName]
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

      if (response.data.access_token) {
        toast.success('Account verified successfully! Please log in.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        setTimeout(() => navigate('/signin'), 1200);
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
                    onClick={handleResendOTP}
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
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full animate-fadeIn">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Join as Teacher
          </h2>
          <p className="text-gray-500">
            Create your account to start teaching
          </p>
        </div>

        <form onSubmit={handleSubmit(signup)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <div className="relative">
                <Input
                  className={`w-full px-4 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.Fname ? "border-teal-500 bg-teal-50/30" : "border-gray-200"
                    }`}
                  placeholder="First Name"
                  {...register("Fname", { required: "First name is required" })}
                />
                {dirtyFields.Fname && !errors.Fname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
                )}
              </div>
              {errors.Fname && <p className="mt-1 text-xs text-red-500">{errors.Fname.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <div className="relative">
                <Input
                  className={`w-full px-4 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.Lname ? "border-teal-500 bg-teal-50/30" : "border-gray-200"
                    }`}
                  placeholder="Last Name"
                  {...register("Lname", { required: "Last name is required" })}
                />
                {dirtyFields.Lname && !errors.Lname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
                )}
              </div>
              {errors.Lname && <p className="mt-1 text-xs text-red-500">{errors.Lname.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Input
                placeholder="name@example.com"
                type="email"
                className={`w-full px-4 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.email
                    ? !errors.email
                      ? "border-teal-500 bg-teal-50/30"
                      : "border-red-300 bg-red-50/30"
                    : "border-gray-200"
                  }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address"
                  }
                })}
              />
              {dirtyFields.email && !errors.email && (
                <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600" />
              )}
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Input
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3.5 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.password
                    ? !errors.password
                      ? "border-teal-500 bg-teal-50/30"
                      : "border-red-300 bg-red-50/30"
                    : "border-gray-200"
                  }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Min 8 characters" },
                  validate: (value) => {
                    if (!/\d/.test(value)) return "Must contain a number";
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Must contain special char";
                    return true;
                  }
                })}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}

            <div className="mt-3 flex gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full ${passwordCriteria.length ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>8+ chars</span>
              <span className={`text-xs px-2 py-1 rounded-full ${passwordCriteria.number ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>Number</span>
              <span className={`text-xs px-2 py-1 rounded-full ${passwordCriteria.special ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>Special char</span>
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
                Creating Account...
              </span>
            ) : "Create Teacher Account"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/signup/recruiter")}
              className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Recruiter</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Sign In</span>
              </div>
            </button>
          </div>
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-200/30 to-cyan-200/30 blur-3xl animate-float" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-purple-200/30 to-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-emerald-200/30 to-lime-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

            {/* Left Side: Hero Content */}
            <div className="hidden md:block w-1/2 space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Join the Future of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                    Teaching Excellence
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  Create your profile today and connect with top educational institutions looking for talent like you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Verified Schools</h3>
                    <p className="text-sm text-gray-500">Connect with trusted institutions</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Fast Placement</h3>
                    <p className="text-sm text-gray-500">Get hired faster with our platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="w-full md:w-1/2 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
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

export default SignUpPage;
