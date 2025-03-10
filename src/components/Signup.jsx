import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createaccount } from "../services/authServices";
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false,
    capital: false,
  });

  const password = watch("password");

  useEffect(() => {
    if (password) {
      setPasswordCriteria({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        capital: /[A-Z]/.test(password),
      });
    }
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputClass = `w-full border-2 text-sm rounded-xl px-3 py-3 ${
    errors.email
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:border-green-500"
  }`;

  const signup = async ({ Fname, Lname, email, password }) => {
    setError("");
    setLoading(true);
  
    try {
      const userData = await createaccount({ Fname, Lname, email, password });
      if (userData) {
        toast.success("Account created successfully!");
        await login({ email, password, navigate, setError, setLoading });
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHeader />
      <Helmet>
        <title>PTPI | Signup Page</title>
      </Helmet>
      {loading && <Loader />}
      <div
        className="flex bg-cover bg-no-repeat mt-3 items-center justify-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        <div className="w-full md:w-1/2 flex items-center md:pl-72 justify-center md:p-0 p-8">
          <div className="max-w-md w-full mt-5">
            <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
              Hello,{" "}
              <span className="font-bold text-teal-600">Teachers </span>
            </h2>
            <h2 className="mb-2 font-bold text-gray-500 text-xl md:text-4xl leading-none">
              Signup To{" "}
              <span className="font-bold text-xl md:text-4xl text-teal-600">
                PTPI{" "}
              </span>
            </h2>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600">
                Have an account?{" "}
                <span
                  onClick={() => navigate("/signin")}
                  className="text-teal-600 hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit(signup)} className="space-y-4 mb-5">
              <div className="flex gap-2">
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    className={inputClass}
                    placeholder="Enter your first name"
                    {...register("Fname", {
                      required: "First name is required",
                    })}
                  />
                  {errors.Fname && (
                    <span className="text-red-500 text-sm">
                      {errors.Fname.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    className={inputClass}
                    placeholder="Enter your last name"
                    {...register("Lname", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.Lname && (
                    <span className="text-red-500 text-sm">
                      {errors.Lname.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className={inputClass}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    className={inputClass}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long",
                      },
                      validate: (value) => {
                        if (!/\d/.test(value)) return "Password must contain at least one number";
                        if (!/[A-Z]/.test(value)) return "Password must contain at least one capital letter";
                        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Password must contain at least one special character";
                        return true;
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm">{errors.password.message}</span>
                )}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm">
                    <FaCheck className={`mr-2 ${passwordCriteria.length ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordCriteria.length ? 'text-green-500' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaCheck className={`mr-2 ${passwordCriteria.number ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordCriteria.number ? 'text-green-500' : 'text-gray-500'}>
                      Contains a number
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaCheck className={`mr-2 ${passwordCriteria.special ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordCriteria.special ? 'text-green-500' : 'text-gray-500'}>
                      Contains a special character
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaCheck className={`mr-2 ${passwordCriteria.capital ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={passwordCriteria.capital ? 'text-green-500' : 'text-gray-500'}>
                      Contains a capital letter
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  placeholder="Confirm your password"
                  type="password"
                  className={inputClass}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-2 rounded-xl transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {loading ? "Sending..." : "Sign Up"}
              </Button>
            </form>
          </div>
        </div>

        <div className="w-full md:w-1/2 hidden md:flex flex-col pl-36 justify-center h-screen p-10 ">
          {/* Step 1 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold">
                1
              </div>
              <div className="h-12 w-1 bg-teal-500"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Get Signup Completed
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                2
              </div>
              <div className="h-12 w-1 bg-gray-300"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Select Teacher in Progress
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                3
              </div>
              <div className="h-12 w-1 bg-gray-300"></div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Take interview
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                4
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Hire Teacher
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default SignUpPage;
