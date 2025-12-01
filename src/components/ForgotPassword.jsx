import React, { useState } from 'react';
import { forgetPassword } from '../services/authServices';
import Button from './Button';
import Input from './Input';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import CustomHeader from './commons/CustomHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorMessage from './ErrorMessage';
import { Link } from 'react-router-dom';
import Loader from './Loader';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [sentEmail, setSentEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgetPassword(email);
      setSuccessMessage('Password reset link has been sent to your email.');
      setSentEmail(email);
      setEmail('');
      setSent(true);
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
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
      {loading && <Loader />}
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-200/30 to-cyan-200/30 blur-3xl animate-float" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-purple-200/30 to-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-emerald-200/30 to-lime-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">

            {/* Left Side: Hero Content (Hidden on mobile) */}
            <div className="hidden md:block w-1/2 space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                  Recover Your <br />
                  <span className="text-teal-600">
                    Account Access
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-md">
                  Don't worry, it happens to the best of us. We'll help you get back to your teaching journey in no time.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <span className="font-bold text-xl">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Enter Email</h3>
                    <p className="text-sm text-slate-500">Provide your registered email address</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <span className="font-bold text-xl">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Check Inbox</h3>
                    <p className="text-sm text-slate-500">Receive a secure password reset link</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="font-bold text-xl">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Reset Password</h3>
                    <p className="text-sm text-slate-500">Create a new password and log in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 relative overflow-hidden">

                <div className="space-y-2 mb-8">
                  <Link
                    to="/signin"
                    className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors mb-4 group"
                  >
                    <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                  </Link>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Forgot Password?
                  </h2>
                  <p className="text-slate-500">
                    Enter your email to receive a reset link
                  </p>
                </div>

                {sent ? (
                  <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-6 text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaEnvelope className="text-teal-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Check your email</h3>
                    <p className="text-slate-600 text-sm mb-6">
                      We sent a password reset link to <br />
                      <span className="font-medium text-teal-700">{sentEmail}</span>
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={() => window.open('https://gmail.com', '_blank')}
                        className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors font-medium"
                      >
                        Open Email App
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setEmail(sentEmail);
                          setSent(false);
                        }}
                        className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                      >
                        Click to send again
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <ErrorMessage
                      message={error}
                      onDismiss={() => setError(null)}
                    />
                    <ErrorMessage
                      message={successMessage}
                      type="success"
                      onDismiss={() => setSuccessMessage(null)}
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 ml-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-slate-400" />
                        </div>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={`w-full pl-11 pr-10 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${email
                            ? isEmailValid(email)
                              ? "border-teal-500 bg-teal-50/10"
                              : "border-red-300 bg-red-50/10"
                            : "border-slate-200"
                            }`}
                          required
                        />
                        {email && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            {isEmailValid(email) ? (
                              <FaCheckCircle className="text-teal-500" />
                            ) : (
                              <FaTimesCircle className="text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {email && !isEmailValid(email) && (
                        <p className="text-red-500 text-xs mt-1 ml-1">Please enter a valid email address</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-teal-700 transform hover:-translate-y-0.5 transition-all duration-200 ${!email || !isEmailValid(email) || loading
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                        }`}
                      disabled={!email || !isEmailValid(email) || loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Link...
                        </span>
                      ) : "Send Reset Link"}
                    </Button>
                  </form>
                )}

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-500 font-medium">Or register as</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Link
                      to="/signup/teacher"
                      className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      Teacher
                    </Link>
                    <Link
                      to="/signup/recruiter"
                      className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      Recruiter
                    </Link>
                  </div>
                </div>
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
};

export default ForgotPassword;
