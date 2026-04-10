import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  FaArrowRight,
} from "react-icons/fa";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import UniversalHeader from "./commons/UniversalHeader";
import ErrorMessage from "./ErrorMessage";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [notification, setNotification] = useState(null);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const watchedFields = watch();

  useEffect(() => {
    if (location.state?.error) {
      setNotification({ message: location.state.error, type: "error" });
    } else if (location.state?.success) {
      setNotification({ message: location.state.success, type: "success" });
    }
  }, [location.state]);

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
    setNotification(null);

    try {
      await login(data);
      const role = localStorage.getItem("role");

      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
        return;
      }

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
      if (
        errorMessage.toLowerCase().includes("csrf") ||
        errorMessage.toLowerCase().includes("session expired")
      ) {
        setNotification({ message: errorMessage, type: "error" });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      // Check if account is deactivated — show error, do NOT redirect to OTP
      if (
        err.is_active === false ||
        errorMessage.toLowerCase().includes("deactivated") ||
        errorMessage.toLowerCase().includes("has been deactivated")
      ) {
        setNotification({ message: errorMessage, type: "error" });
      }
      // Check if account needs OTP verification
      else if (
        err.is_verified === false ||
        err.is_pending === true ||
        errorMessage.toLowerCase().includes("verify your account") ||
        errorMessage.toLowerCase().includes("verification")
      ) {
        const email = getValues("email");
        setUserEmail(email);
        setShowOTPForm(true);
        setTimer(30);
        setCanResend(false);
        handleResendOTP(email);
      } else {
        setNotification({ message: errorMessage, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (email = null) => {
    const emailToUse = email || userEmail;

    if (!emailToUse) {
      setNotification({
        message: "Email address is required for verification",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await resendTeacherOtp(emailToUse);

      setTimer(30);
      setCanResend(false);

      setNotification({
        message: "Verification code sent successfully",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err.message || "Failed to send verification code",
        type: "error",
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
    setNotification(null);

    try {
      const response = await verifyTeacherOtp({
        email: userEmail,
        otp: otp,
      });
      console.log(response);

      if (response.status === "success" && response.data) {
        setNotification({
          message: "Account verified and logged in successfully!",
          type: "success",
        });

        const { access_token, role } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("role", role);

        setTimeout(() => {
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
        }, 1200);
      }
    } catch (error) {
      setNotification({
        message: error.message || "OTP verification failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => {
    if (!email || email.length < 3) return false;
    if (!email.includes("@")) return false;
    const parts = email.split("@");
    if (parts.length !== 2) return false;
    if (!parts[0] || !parts[1]) return false;
    return true;
  };
  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full">
          <div className="space-y-2 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 mb-4 border border-teal-100">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Verify Email</h2>
            <p className="text-slate-500">
              We've sent a code to{" "}
              <span className="font-medium text-teal-600">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <ErrorMessage
              message={notification?.message}
              type={notification?.type}
              onDismiss={() => setNotification(null)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                className="w-full bg-white border border-slate-200 text-center text-2xl tracking-[0.5em] font-bold rounded-xl p-4 outline-none"
                placeholder="000000"
                pattern="\d{6}"
                maxLength={6}
                inputMode="numeric"
                required
              />
              {otp && otp.length < 6 && (
                <p className="mt-2 text-sm text-red-500 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Please enter a 6-digit code
                </p>
              )}
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-slate-500">
                  Resend code in{" "}
                  <span className="text-teal-600 font-bold">{timer}s</span>
                </p>
              ) : (
                canResend && (
                  <button
                    type="button"
                    onClick={() => handleResendOTP()}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center justify-center mx-auto space-x-1"
                  >
                    <svg
                      className="w-4 h-4"
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
                    <span>Resend Verification Code</span>
                  </button>
                )
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md ${
                  loading || otp.length !== 6
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowOTPForm(false);
                  setOtp("");
                }}
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <ErrorMessage
            message={notification?.message}
            type={notification?.type}
            onDismiss={() => setNotification(null)}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <Input
                placeholder="name@example.com"
                type="email"
                id="email"
                className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl outline-none ${
                  dirtyFields.email
                    ? isEmailValid(watchedFields.email)
                      ? "border-teal-500 bg-teal-50/10"
                      : "border-red-300 bg-red-50/10"
                    : "border-slate-200"
                }`}
                {...register("email", {
                  required: "Email is required",
                  validate: (value) =>
                    isEmailValid(value) || "Invalid email address",
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
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                id="pass"
                className={`w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl outline-none ${
                  dirtyFields.password
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.password.message}
              </p>
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
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-500"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md ${
              !isValid || loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={!isValid || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/signup/teacher"
              className="font-bold text-teal-600 hover:text-teal-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    );
  };  return (
    <>
      <Helmet>
        <title>PTPI | Sign In</title>
      </Helmet>
      <UniversalHeader />
      {loading && <Loader />}
      
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-8 sm:py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            
            {/* Left Side: Editorial Content */}
            <div className="hidden lg:block w-1/2 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-sm font-bold uppercase tracking-wider">
                  <FaCheckCircle size={14} />
                  Institutional Access
                </div>
                <h1 className="text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1]">
                  Elevate Your <br />
                  <span className="text-teal-600">Teaching Career</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-md leading-relaxed">
                  The gateway to India's most prestigious teaching opportunities and elite educational institutions.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-md">
                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-200">
                    <FaChalkboardTeacher className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Verified Network</h3>
                    <p className="text-sm text-slate-500">Access to 1000+ verified schools</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <FaUserTie className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Direct Recruitment</h3>
                    <p className="text-sm text-slate-500">Connect directly with institutional heads</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Premium Login Card */}
            <div className="w-full lg:w-1/2 max-w-[480px]">
              <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                {renderForm()}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between px-4 gap-4 text-center sm:text-left">
                <p className="text-slate-400 text-sm font-medium">
                  &copy; {new Date().getFullYear()} PTPI. Verified Institution.
                </p>
                <div className="flex gap-4">
                  <Link to="/help" className="text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest">Help</Link>
                  <Link to="/privacy" className="text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest">Privacy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;n;
