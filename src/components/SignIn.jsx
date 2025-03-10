import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../services/authUtils";
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar/Navbar";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
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
    watch
  } = useForm({
    mode: "onChange",
    criteriaMode: "all"
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const watchedFields = watch();

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
          navigate("/subject-expert");
          break;
        default:
          navigate("/admin/dashboard");
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login({ ...data, navigate });
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isEmailValid = (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
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
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            <div className="space-y-2 mb-6">
              <h2 className="font-bold text-gray-500 text-lg sm:text-xl leading-tight">
                Hello, <span className="text-teal-600">User</span>
              </h2>
              <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl md:text-4xl leading-tight">
                Sign in to <span className="text-teal-600">PTPI</span>
              </h2>
            </div>
           
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
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
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: "Please enter a valid email address",
                      },
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
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="pass">
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
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
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
                Enter Credentials
              </h3>
              <p className="text-gray-500 mt-1">
                Sign in with your registered email and password
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