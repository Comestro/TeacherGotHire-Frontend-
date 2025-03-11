import React, { useState, useEffect } from 'react'
import { createRecruiteraccount } from '../services/authServices'
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { recruiterPostData } from "../features/authSlice";
import CustomHeader from './commons/CustomHeader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

const RecruiterSignUpPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
      return `w-full border-2 text-sm rounded-xl p-3 transition-colors ${
        dirtyFields[fieldName]
          ? errors[fieldName]
            ? "border-red-500 focus:border-red-500"
            : "border-teal-600 focus:border-teal-600"
          : "border-gray-300 focus:border-teal-600"
      }`;
    };

    const recruitersign = async ({ Fname, Lname, email, password }) => {
      setError("");
      setLoading(true);
    
      try {
        const response = await createRecruiteraccount({ Fname, Lname, email, password });
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          dispatch(recruiterPostData(response));
          toast.success('Account created successfully!');
          navigate("/signin");
        }
      } catch (error) {
        const errorMessage = error.message || "Failed to create account. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
        <>
        <CustomHeader />
        <ToastContainer />
        <div
          className="flex min-h-screen bg-cover bg-no-repeat bg-center bg-opacity-10"
          style={{ 
            backgroundImage: 'url("/bg.png")',
            backgroundColor: 'rgba(13, 148, 136, 0.02)'
          }}
        >
          <div className="w-full md:w-1/2 flex justify-center md:pl-16 lg:pl-24 xl:pl-32 mt-16 md:mt-0">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8">
              <div className="space-y-2 mb-6">
                <h2 className="font-bold text-gray-500 text-lg sm:text-xl leading-tight">
                  Hello, <span className="text-teal-600">Recruiters</span>
                </h2>
                <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl md:text-4xl leading-tight">
                  Signup To <span className="text-teal-600">PTPI</span>
                </h2>
              </div>

              <form onSubmit={handleSubmit(recruitersign)} className="space-y-4 sm:space-y-5">
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
                    "Sign Up as Recruiter"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/signup/teacher")}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-teal-600 text-sm font-medium rounded-xl text-white hover:bg-teal-700 transition duration-200"
                >
                  Sign up as Teacher
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
                  Get Signup Completed
                </h3>
                <p className="text-gray-500 mt-1">
                  Create your recruiter account
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
                  Select Teacher in Progress
                </h3>
                <p className="text-gray-500 mt-1">
                  Browse and select potential candidates
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                  3
                </div>
                <div className="h-16 w-1 bg-gray-300"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-gray-700 font-bold text-xl">
                  Take Interview
                </h3>
                <p className="text-gray-500 mt-1">
                  Schedule and conduct interviews
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
                  4
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-gray-700 font-bold text-xl">
                  Hire Teacher
                </h3>
                <p className="text-gray-500 mt-1">
                  Complete the hiring process
                </p>
              </div>
            </div>
          </div>
        </div>
        </>
    );
}

export default RecruiterSignUpPage;