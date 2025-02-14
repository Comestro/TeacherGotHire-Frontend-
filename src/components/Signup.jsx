import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createaccount, verifyOtp } from "../services/authServices";
import Navbar from "./Navbar/Navbar";
import { getPostData, getResendOtp } from "../features/authSlice";
import Loader from "./Loader";
import { Helmet } from "react-helmet-async";
import CustomHeader from "./commons/CustomHeader";

function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm();

  const inputRefs = useRef([]); // Refs for each input field
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isOTPValid, setIsOTPValid] = useState(false);
  const [correctOTP, setcorrectOTP] = useState("");

  const [showResendButton, setShowResendButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const password = watch("password");
  const inputClass = `w-full border-2 text-sm rounded-xl px-3 py-3 ${
    errors.email
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:bordser-green-500"
  }`;

  console.log("correctOtp", correctOTP);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus on the next input if a digit is entered
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Auto-submit when OTP length is 6
  useEffect(() => {
    console.log("otp", otp);
    console.log("correctotp", correctOTP);
    const enteredOTP = otp.join("");
    console.log("enterotp",enteredOTP.length)
    
    if (enteredOTP.length === 6) {
      if (enteredOTP === correctOTP) {
        console.log("enterotp",enteredOTP)
         setIsOTPValid(true);
        // Simulate form submission (e.g., API call)
        verifyOtpHandler();
        setOtp(Array(5).fill(""));
      } else {
        console.log("invalid otp");
        setIsOTPValid(false);
        setShowResendButton(true);
      }
    }
  }, [otp,correctOTP]);

  const signup = async ({ Fname, Lname, email, password }) => {
    console.log(email, password);
    setError("");
    setLoading(true); // Set loading to true

    try {
      const userData = await createaccount({ Fname, Lname, email, password });
      console.log("userData", userData);
      const resOtp = userData?.payload?.otp;
      console.log("resOtp", resOtp);
      setcorrectOTP(resOtp);
      if (userData) {
        setOtpSent(true);
        setEmail(email);
        setSuccessMessage("An OTP has been sent to your email.");
      }
    } catch (error) {
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };


  const handleResendOTP = async () => {

    try{
      console.log("Initial otp:", otp);
      // setLoading(true);
     const resendotp =  await dispatch(getResendOtp(email)).unwrap();
     
      console.log("Reset otp:", resendotp);
      setOtp(Array(6).fill("")); // Reset OTP fields
      const resOtp = resendotp?.data?.otp;
      console.log("resOtp", resOtp);
      setcorrectOTP(resOtp);
      setShowResendButton(false); // Hide resend button
      setIsOTPValid(null); // Reset validation status
    } catch (error) {
        setError(error.message || " Please try again.");
    }
   
  };

  const verifyOtpHandler = async () => {
    setError("");
    setLoading(true); // Set loading to true
    setSuccessMessage("");
    console.log("helloooooo")
    try {
      const response = await verifyOtp({ email, otp: otp.join("") });
      if (response) {
        dispatch(getPostData(response.data));
        navigate("/signin");
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError(error.name || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <>
    <CustomHeader />
    <Helmet>
      <title>PTPI | Signup Page</title>
    </Helmet>
      {/* <Navbar /> */}
      {loading && <Loader />} {/* Show loader while loading */}
      <div
        className="flex bg-cover bg-no-repeat mt-3  items-center justify-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex items-center md:pl-72 justify-center md:p-0 p-8 ">
          <div className="max-w-md w-full mt-5">
            {!otpSent ? (
              <>
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
                      className="text-teal-600 hover:underline font-semibold"
                    >
                      Sign In
                    </span>
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-red-600 text-center mb-4">{error}</p>
                )}

                <form
                  onSubmit={handleSubmit(signup)}
                  className="space-y-4 mb-5"
                >
                  {/* Full Name */}
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

                  {/* Email */}
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
                    {error.email && (
                      <span className="text-red-500 text-sm">{error}</span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      className={inputClass}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message:
                            "Password must be at least 6 characters long",
                        },
                      })}
                    />
                    {errors.password && (
                      <span className="text-red-500 text-sm">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isValid || loading}
                    className={`w-full py-2 rounded-xl transition  ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    {loading ? "Sending..." : "Sign Up"}
                  </Button>
                </form>

                {error && (
                  <p className="text-red-500 text-sm mt-4">Error: {error}</p>
                )}
              </>
            ) : (
              <>
                <>
                  {successMessage && (
                    <p className="bg-green-200 text-green-900 px-3 py-2 rounded border border-green-700 text-center mb-4">
                      {successMessage}
                    </p>
                  )}
                  <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
                    Verify OTP
                  </h2>
                  {error && (
                    <p className="text-red-600 text-center mb-4">{error}</p>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <div className="flex space-x-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          value={digit}
                          maxLength="1"
                          className="w-10 h-10 text-center border border-gray-300"
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          ref={(el) => (inputRefs.current[index] = el)}
                        />
                      ))}
                    </div>
                    {otp.join("").length === 6 && !isOTPValid && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid OTP. Please try again.
                      </p>
                    )}

                    {showResendButton && (
                      <button
                        onClick={handleResendOTP}
                        
                        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Resend OTP
                      </button>
                    )}

                    {isOTPValid && (
                      <p className="text-green-500 text-sm mt-1">
                        OTP is valid. Form submitted successfully!
                      </p>
                    )}
                  </div>
                </>
              </>
            )}
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
    </>
  );
}

export default SignUpPage;
