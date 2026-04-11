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

      if (
        err.is_active === false ||
        errorMessage.toLowerCase().includes("deactivated") ||
        errorMessage.toLowerCase().includes("has been deactivated")
      ) {
        setNotification({ message: errorMessage, type: "error" });
      } else if (
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
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-black text-slate-800">Verify Email</h2>
            <p className="text-sm font-medium text-slate-500">
              We've sent a code to <span className="text-teal-600 font-bold">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <ErrorMessage
              message={notification?.message}
              type={notification?.type}
              onDismiss={() => setNotification(null)}
            />
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                className="w-full bg-slate-50 border border-slate-200 text-center text-3xl tracking-[0.5em] font-black rounded-lg py-4 outline-none focus:border-teal-600 focus:bg-white transition-all"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Resend in <span className="text-teal-600">{timer}s</span>
                </p>
              ) : (
                canResend && (
                  <button
                    type="button"
                    onClick={() => handleResendOTP()}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest"
                  >
                    Resend Code
                  </button>
                )
              )}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className={`w-full bg-teal-600 text-white py-4 rounded-lg font-black uppercase tracking-widest ${
                  loading || otp.length !== 6 ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowOTPForm(false);
                  setOtp("");
                }}
                className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <ErrorMessage
          message={notification?.message}
          type={notification?.type}
          onDismiss={() => setNotification(null)}
        />
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Email Address
          </label>
          <Input
            placeholder="institution@domain.com"
            type="email"
            id="email"
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
            {...register("email", {
              required: "Email is required",
              validate: (value) => isEmailValid(value) || "Invalid email address",
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Access Key / Password
          </label>
          <div className="relative">
            <Input
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              id="pass"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password too short",
                },
              })}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-teal-600 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Remember Session
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700"
          >
            Reset Access
          </Link>
        </div>

        <Button
          type="submit"
          className={`w-full bg-teal-600 text-white py-4 rounded-lg font-black uppercase tracking-widest transition-colors ${
            !isValid || loading ? "opacity-60 cursor-not-allowed" : "hover:bg-teal-700"
          }`}
          disabled={!isValid || loading}
        >
          {loading ? "Authorizing..." : "Authorize Access"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Helmet>
        <title>Sign In | PTP Institute</title>
      </Helmet>
      <UniversalHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Logo/Info Side - Flat Design */}
          <div className="w-full md:w-5/12 p-8 md:p-12 bg-slate-900 flex flex-col justify-between text-white relative">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center text-xl font-black mb-8">
                P
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-none mb-6">
                Security <br />
                <span className="text-teal-400">Gateway.</span>
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Enter credentials to access the institutional network.
              </p>
            </div>

            <div className="relative z-10 pt-10 border-t border-white/10 uppercase tracking-widest">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-teal-400">
                    <FaCheckCircle size={12} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white">Encrypted</p>
                    <p className="text-[8px] font-bold text-teal-500">AES-256 Verified</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Form Side - Minimalist */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
               <div className="mb-10">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Institutional Access</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Authorization required</p>
               </div>
               
               {renderForm()}

               <div className="mt-8 pt-6 border-t border-slate-100">
                 <Link to="/signup" className="flex items-center justify-between group">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No access? <span className="text-teal-600">Register</span></span>
                    <FaArrowRight size={10} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center border-t border-slate-200 bg-white">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
          &copy; {new Date().getFullYear()} PTP Institute &bull; Institutional Authentication Service
        </p>
      </footer>
    </div>
  );
}

export default Login;
