import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authServices';
import Button from './Button';
import Input from './Input';
import { FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaTimesCircle } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import CustomHeader from './commons/CustomHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (success && countdown === 0) {
      navigate('/signin');
    }
    return () => clearInterval(timer);
  }, [success, countdown, navigate]);

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score >= 4) return { label: 'Strong', color: 'bg-green-500', score: 3 };
    if (score >= 2) return { label: 'Medium', color: 'bg-yellow-400', score: 2 };
    return { label: 'Weak', color: 'bg-red-400', score: 1 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }



    setError(null);
    setLoading(true);
    try {
      await resetPassword(uid, token, password);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      setError(error?.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <>
      <Helmet>
        <title>PTPI | Reset Password</title>
      </Helmet>
      <CustomHeader />
      {loading && <Loader />}
      <ToastContainer />
      <div className="flex items-center justify-center relative overflow-hidden bg-slate-50 py-5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-200/30 to-cyan-200/30 blur-3xl animate-float" />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-purple-200/30 to-indigo-200/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-emerald-200/30 to-lime-200/30 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="w-full max-w-md px-4 relative z-10">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 relative overflow-hidden animate-slide-up">

            {success ? (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-green-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Reset!</h2>
                <p className="text-slate-600 mb-6">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
                <p className="text-sm text-slate-500">
                  Redirecting to login in <span className="font-bold text-teal-600">{countdown}s</span>...
                </p>
                <Button
                  onClick={() => navigate('/signin')}
                  className="mt-6 w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Login Now
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
                    <FaLock className="text-teal-600 text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    Reset Password
                  </h2>
                  <p className="text-slate-500">
                    Create a new secure password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-slate-400" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        className={`w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${password ? "border-slate-300" : "border-slate-200"
                          }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 px-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Strength</span>
                          <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden gap-1">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} style={{ width: '33%' }} />
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} style={{ width: '33%' }} />
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} style={{ width: '33%' }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Use 8+ chars with mix of letters, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-slate-400" />
                      </div>
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full pl-11 pr-12 py-3.5 bg-white border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none ${confirmPassword && password === confirmPassword
                          ? "border-teal-500 bg-teal-50/10"
                          : confirmPassword
                            ? "border-red-300 bg-red-50/10"
                            : "border-slate-200"
                          }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>

                      {confirmPassword && (
                        <div className="absolute inset-y-0 right-12 pr-2 flex items-center pointer-events-none">
                          {password === confirmPassword ? (
                            <FaCheckCircle className="text-teal-500" />
                          ) : (
                            <FaTimesCircle className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-md hover:bg-teal-700 transform hover:-translate-y-0.5 transition-all duration-200 ${!password || !confirmPassword || password !== confirmPassword || loading
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                      }`}
                    disabled={!password || !confirmPassword || password !== confirmPassword || loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </span>
                    ) : "Reset Password"}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <Link
                    to="/signin"
                    className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            &copy; {new Date().getFullYear()} PTPI. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
