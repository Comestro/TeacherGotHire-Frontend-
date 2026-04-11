import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import {
  createaccount,
  verifyTeacherOtp,
  resendTeacherOtp,
} from "../services/authServices";
import { login } from "../services/authUtils";
import {
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaUniversity,
  FaRocket,
} from "react-icons/fa";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import UniversalHeader from "./commons/UniversalHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorMessage from "./ErrorMessage";

function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false,
  });

  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");

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
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
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
    criteriaMode: "all",
  });

  const watchedFields = watch();
  const password = watchedFields.password;

  useEffect(() => {
    if (password) {
      setPasswordCriteria({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await verifyTeacherOtp({
        email: userEmail,
        otp: otp,
      });

      if (response.status === "success" && response.data) {
        toast.success("Account verified and logged in successfully!");
        const { access_token, role } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("role", role);

        setTimeout(() => {
          if (role === "teacher") {
            navigate("/teacher");
          } else {
            navigate("/signin");
          }
        }, 1200);
      }
    } catch (error) {
      setError(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ Fname, Lname, email, password }) => {
    email = email.toLowerCase();
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
      setError(error.message || "Failed to create account");
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

  const renderForm = () => {
    if (showOTPForm) {
      return (
        <div className="w-full">
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-black text-slate-800">Verify Email</h2>
            <p className="text-sm font-medium text-slate-500">
              Check code on <span className="text-teal-600 font-bold">{userEmail}</span>
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <ErrorMessage message={error} onDismiss={() => setError("")} />
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
                    onClick={handleResendOTP}
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
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Teacher Account</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Create institutional identity</p>
        </div>

        <form onSubmit={handleSubmit(signup)} className="space-y-4">
          <ErrorMessage message={error} onDismiss={() => setError("")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label>
              <Input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
                placeholder="John"
                {...register("Fname", { required: "Required" })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Last Name</label>
              <Input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
                placeholder="Doe"
                {...register("Lname", { required: "Required" })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</label>
            <Input
              placeholder="teacher@domain.com"
              type="email"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
              {...register("email", {
                required: "Required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
              })}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
            <div className="relative">
              <Input
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-600 focus:bg-white transition-all"
                {...register("password", {
                  required: "Required",
                  minLength: { value: 8, message: "Min 8 chars" },
                })}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
             {['8+ Chars', 'Number', 'Special'].map((text, i) => (
                <div key={i} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    (i === 0 && passwordCriteria.length) || (i === 1 && passwordCriteria.number) || (i === 2 && passwordCriteria.special)
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}>
                    {text}
                </div>
             ))}
          </div>

          <Button
            type="submit"
            className={`w-full bg-teal-600 text-white py-4 rounded-lg font-black uppercase tracking-widest transition-colors ${
              !isValid || loading ? "opacity-60 cursor-not-allowed" : "hover:bg-teal-700 font-black uppercase"
            }`}
            disabled={!isValid || loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
            <Link to="/signin" className="flex items-center justify-between group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Already have an account? <span className="text-teal-600">Sign In</span></span>
                <FaArrowRight size={10} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
            </Link>
            <Link to="/signup/recruiter" className="flex items-center justify-between group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Are you a Recruiter? <span className="text-teal-600">Join Here</span></span>
                <FaArrowRight size={10} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
            </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Helmet>
        <title>Teacher Registration | PTP Institute</title>
      </Helmet>
      <UniversalHeader />
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Logo/Info Side - Flat Design */}
          <div className="w-full md:w-5/12 p-8 md:p-12 bg-slate-900 flex flex-col justify-between text-white relative">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-teal-600 rounded flex items-center justify-center text-xl font-black mb-8">
                P
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-none mb-6">
                Institutional <br />
                <span className="text-teal-400">Onboarding.</span>
              </h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Connect with India's most prestigious educational institutions.
              </p>
            </div>

            <div className="relative z-10 pt-10 border-t border-white/10 uppercase tracking-widest">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-teal-400">
                    <FaCheck size={12} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white">Verification</p>
                    <p className="text-[8px] font-bold text-teal-500">Dual-layer Security</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Form Side - Minimalist */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
               {renderForm()}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center border-t border-slate-200 bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
          &copy; {new Date().getFullYear()} PTP Institute &bull; Institutional Access Protocol
        </p>
      </footer>
    </div>
  );
}

export default SignUpPage;
