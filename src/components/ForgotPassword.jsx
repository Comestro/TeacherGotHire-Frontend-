import React, { useState } from 'react';
import { forgetPassword } from '../services/authServices';
import Button from './Button';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import CustomHeader from './commons/CustomHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgetPassword(email);
      toast.success('Password reset link has been sent to your email.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setSentEmail(email);
      setEmail('');
      setSent(true);
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
    setLoading(false);
  };

  const isEmailValid = (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  };

  return (
    <>
      <Helmet>
        <title>PTPI | Forgot Password</title>
      </Helmet>
      <CustomHeader />
      <ToastContainer />
      <div
        className="flex min-h-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: 'url("/bg.png")' }}
      >
        {/* Form Container */}
        <div className="w-full md:w-1/2 flex justify-center md:pl-16 lg:pl-24 xl:pl-32 mt-16 md:mt-0">
          <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8">
            <div className="space-y-2 mb-6">
              <Link
                to="/signin"
                className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors mb-4"
              >
                <FaArrowLeft className="mr-2" />
                Back to Login
              </Link>
              <h2 className="font-bold text-gray-500 text-2xl sm:text-3xl leading-tight">
                Forgot Your <span className="text-teal-600">Password?</span>
              </h2>
              <p className="text-gray-600">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {sent ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold">Check your email</p>
                    <p className="text-sm">We sent a password reset link to <span className="font-medium">{sentEmail}</span>. Please check your inbox (and spam) and follow the instructions.</p>
                    <div className="mt-3 flex items-center gap-4">
                      <Link to="/signin" className="text-teal-600 hover:underline">Back to login</Link>
                      <button
                        type="button"
                        onClick={() => {
                          // allow user to send again: prefill email and show form
                          setEmail(sentEmail);
                          setSent(false);
                        }}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Send again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full border-2 text-sm rounded-xl p-3 pr-10 transition-colors ${
                      email
                        ? isEmailValid(email)
                          ? "border-teal-600 focus:border-teal-600"
                          : "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-teal-600"
                    }`}
                    required
                  />
                  {email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isEmailValid(email) ? (
                        <FaCheckCircle className="text-teal-600" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {email && !isEmailValid(email) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full bg-teal-600 text-white py-3 rounded-xl transition duration-200 flex items-center justify-center ${
                  !email || !isEmailValid(email) || loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-teal-700"
                }`}
                disabled={!email || !isEmailValid(email) || loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
                ) : null}
                {loading ? "Sending..." : "Send Reset Link"}
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
                  onClick={() => window.location.href = '/signup/teacher'}
                  textColor="text-teal-600"
                  className="w-full bg-white border-2 border-teal-600 py-3 rounded-xl hover:bg-teal-50 transition duration-200"
                >
                  Register as Teacher
                </Button>
                <Button
                  onClick={() => window.location.href = '/signup/recruiter'}
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
                Enter Email
              </h3>
              <p className="text-gray-500 mt-1">
                Provide your registered email address
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
                Check Email
              </h3>
              <p className="text-gray-500 mt-1">
                Click the reset link sent to your email
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
                Reset Password
              </h3>
              <p className="text-gray-500 mt-1">
                Create a new secure password
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
