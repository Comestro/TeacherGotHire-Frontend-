import { useState, useEffect } from 'react'
import { createRecruiteraccount, verifyRecruiterOtp, resendRecruiterOtp } from '../services/authServices'
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CustomHeader from './commons/CustomHeader';
import Loader from './Loader';
import { Helmet } from 'react-helmet-async';
import ErrorMessage from './ErrorMessage';
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineShieldCheck } from "react-icons/hi2";

const RecruiterSignUpPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "onChange",
    criteriaMode: "all"
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false
  });

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      await resendRecruiterOtp(userEmail);
      setTimer(30);
      setCanResend(false);
      setSuccessMessage('OTP resent successfully!');
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await verifyRecruiterOtp({
        email: userEmail,
        otp: otp
      });

      if (response.data.access_token) {
        setSuccessMessage('Account verified successfully! Please log in.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        setTimeout(() => navigate('/signin'), 1200);
      }
    } catch (error) {
      setError(error.message || 'OTP verification failed');
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

  const recruitersign = async ({ Fname, Lname, email, password }) => {
    email = email.toLowerCase();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await createRecruiteraccount({ Fname, Lname, email, password });
      if (response) {
        setSuccessMessage("Account created! Please verify your email.");
        setUserEmail(email);
        setShowOTPForm(true);
        setTimer(30);
        setCanResend(false);
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full animate-fadeIn">
          <div className="space-y-2 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-4 border border-teal-100">
              <HiOutlineShieldCheck className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Verify Email</h2>
            <p className="text-slate-500 text-sm">
              We've sent a code to <span className="font-medium text-teal-600">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
            <ErrorMessage
              message={successMessage}
              type="success"
              onDismiss={() => setSuccessMessage(null)}
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
                autoFocus
              />
              {otp && otp.length < 6 && (
                <p className="mt-2 text-sm text-red-500 flex items-center justify-center">
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
                    onClick={handleResendOTP}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors flex items-center justify-center mx-auto space-x-1"
                  >
                    <span>Resend Verification Code</span>
                  </button>
                )
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className={`w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : ""
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
          <h2 className="text-2xl font-bold text-slate-800">
            Join as a Recruiter
          </h2>
          <p className="text-slate-500 text-sm">
            Find the perfect candidates for your institution
          </p>
        </div>

        <form onSubmit={handleSubmit(recruitersign)} className="space-y-5">
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
          <ErrorMessage
            message={successMessage}
            type="success"
            onDismiss={() => setSuccessMessage(null)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <div className="relative">
                <Input
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.Fname ? "border-teal-500" : "border-slate-300"
                    }`}
                  placeholder="First Name"
                  {...register("Fname", { required: "First name is required" })}
                />
                {dirtyFields.Fname && !errors.Fname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 text-sm" />
                )}
              </div>
              {errors.Fname && <p className="mt-1 text-xs text-red-500">{errors.Fname.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <div className="relative">
                <Input
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.Lname ? "border-teal-500" : "border-slate-300"
                    }`}
                  placeholder="Last Name"
                  {...register("Lname", { required: "Last name is required" })}
                />
                {dirtyFields.Lname && !errors.Lname && (
                  <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 text-sm" />
                )}
              </div>
              {errors.Lname && <p className="mt-1 text-xs text-red-500">{errors.Lname.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Input
                placeholder="name@example.com"
                type="email"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.email
                  ? !errors.email
                    ? "border-teal-500"
                    : "border-red-300"
                  : "border-slate-300"
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
                <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 text-sm" />
              )}
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Input
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${dirtyFields.password
                  ? !errors.password
                    ? "border-teal-500"
                    : "border-red-300"
                  : "border-slate-300"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}

            <div className="mt-3 flex gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full border ${passwordCriteria.length ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>8+ chars</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${passwordCriteria.number ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Number</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${passwordCriteria.special ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Special char</span>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-200 ${!isValid || loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            disabled={!isValid || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
              </span>
            ) : "Create Recruiter Account"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/signup/teacher")}
              className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Teacher</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Sign In</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Recruiter Signup</title>
      </Helmet>
      <CustomHeader />
      {loading && <Loader />}
      <div className="flex items-center justify-center relative overflow-hidden bg-slate-50 py-5">

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

            {/* Left Side: Hero Content */}
            <div className="hidden md:block w-1/2 space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                  Find the Perfect <br />
                  <span className="text-teal-600">
                    Teaching Talent
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-md">
                  Connect with qualified educators and streamline your recruitment process with our advanced platform.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <HiOutlineUserGroup className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Large Talent Pool</h3>
                    <p className="text-sm text-slate-500">Access thousands of qualified teachers</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <HiOutlineBriefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Verified Profiles</h3>
                    <p className="text-sm text-slate-500">Screened candidates for quality assurance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Signup Form */}
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

export default RecruiterSignUpPage;
