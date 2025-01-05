import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getPostData, recruiterPostData } from "../features/authSlice"; // Redux action to store the user login state
import { login as loginService, resendOtp, verifyOtp } from "../services/authServices"; // Service to authenticate the user
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar/Navbar";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");




  const login = async ({ email, password }) => {
    setError(""); // Clear any previous errors
    setLoading(true); // Set loading to true

    try {
      const userData = await loginService({ email, password }); // Call the service function to authenticate the user

      if (userData) {
        // dispatch(getPostData(userData)); // Dispatch action to store the user data in Redux store
        // dispatch(recruiterPostData(userData))
        if (userData?.role === 'recruiter') {
          dispatch(recruiterPostData(userData));  // Save recruiter data in redux
          navigate("/recruiter"); // Redirect to recruiter dashboard
        } else if (userData?.role === 'user') {
          dispatch(getPostData(userData)); // Save teacher data in redux
          navigate("/teacher"); // Redirect to teacher dashboard
        }


      }
    } catch (error) {
      if (error.status === 403) {
        // Handle specific case for unverified account
        setError("Your account is not verified. Please verify your account to log in.");
        setOtpSent(true); // Optional: Trigger OTP resend logic
        setEmail(email); // Store the email for OTP resend later

        try {
          const otpResponse = await resendOtp(email);
          if (otpResponse.status === 200) {
            setSuccessMessage("An OTP has been sent to your email.");
          } else {
            setError("Failed to send verification email. Please try again later.");
          }
        } catch (otpError) {
          setError(otpError.message || "Failed to resend OTP. Please try again later.");
        }
      } else if (error.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (error.status === 400) {
        setError("Bad request. Please check your input.");
      } else if (error.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const verifyOtpHandler = async () => {
    setError("");
    setLoading(true); // Set loading to true
    setSuccessMessage("");
    alert("testing");
    try {
      const response = await verifyOtp({ email, otp });
      if (response) {
        if (response.data?.role === 'recruiter') {
          dispatch(recruiterPostData(response.data)); // Store recruiter data in Redux
          navigate("/recruiter"); // Redirect to recruiter dashboard
        } else if (response.data?.role === 'user') {
          dispatch(getPostData(response.data)); // Store teacher data in Redux
          navigate("/teacher"); // Redirect to teacher dashboard
        }
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError(error.name || "Failed to verify OTP. Please try again.");
    }
    finally {
      setLoading(false); // Set loading to false
    }
  };

  // Helper function to resend OTP




  return (
    <>
      {/* <Navbar /> */}
      <div
        className="flex bg-cover bg-no-repeat items-center justify-center mt-5"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:pl-20">
          <div className="max-w-lg w-full mt-5 bg-white rounded-lg p-6">
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {!otpSent ? (
              <>
                <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
                  Hello, <span className="font-bold text-teal-600">Teachers</span>
                </h2>
                <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
                  Sign in to{" "}
                  <span className="font-bold text-xl md:text-4xl text-teal-600">
                    PTPI
                  </span>
                </h2>



                <form onSubmit={handleSubmit(login)} className="space-y-5">
                  {/* Email */}
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium  text-gray-700 mb-1"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      id="email"
                      className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                      {...register("email", {
                        required: true,
                        validate: {
                          matchPattern: (value) =>
                            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                              value
                            ) || "Email address must be valid",
                        },
                      })}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium  text-gray-700 mb-1"
                      htmlFor="pass"
                    >
                      Password
                    </label>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      id="pass"
                      className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={`w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition flex items-center justify-center ${loading ? "cursor-not-allowed" : ""
                      }`}
                    disabled={loading}
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

                <div className="text-center my-4">
                  <div className="flex items-center">
                    <hr className="flex-grow border-gray-300" />
                    <span className="px-4 text-sm text-gray-600">Or</span>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-4 sm:space-y-0 mt-2">
                    <button className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition">
                      <img
                        src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                        alt="Google"
                        className="w-5 h-5 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-600">
                        Sign in with Google
                      </span>
                    </button>

                    <button className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition">
                      <img
                        src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
                        alt="Facebook"
                        className="w-5 h-5 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-600">
                        Sign in with Facebook
                      </span>
                    </button>
                  </div>

                  <p className="text-sm font-medium text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <span
                      onClick={() => navigate("/signup/teacher")}
                      className="text-teal-600 hover:underline font-semibold"
                    >
                      Sign Up
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                {successMessage && (
                  <p className="bg-green-200 text-green-900 px-3 py-2 rounded border border-green-700 text-center mb-4">{successMessage}</p>
                )}
                <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
                  Verify OTP
                </h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter the OTP sent to your email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border-2 text-sm rounded-xl px-3 py-3 border-gray-300 focus:border-green-500"
                  />
                </div>
                <Button
                  onClick={verifyOtpHandler}
                  disabled={!otp || loading} // Disable button when loading or OTP is empty
                  className={`w-full py-2 rounded-xl transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <div className="hidden md:flex w-full md:w-1/2 flex-col pl-36 justify-center h-screen p-10">
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
                Enter Credentials
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
                Login Successful
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">
                3
              </div>
            </div>
            <div>
              <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">
                Go to Dashboard
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
