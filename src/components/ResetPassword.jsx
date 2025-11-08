import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/authServices';
import Button from './Button';
import { FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '' };
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return { label: 'Strong', color: 'bg-green-500' };
    if (pwd.length >= 8) return { label: 'Medium', color: 'bg-yellow-400' };
    return { label: 'Weak', color: 'bg-red-400' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(uid, token, password);
      setMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1800);
    } catch (error) {
      setMessage(error?.message || 'Something went wrong, please try again.');
    }
    setLoading(false);
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800">Reset your password</h2>
            <p className="text-sm text-gray-500 mt-2">Enter a new secure password for your account.</p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.toLowerCase().includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="alert">
              <div className="flex items-center gap-2">
                {message.toLowerCase().includes('success') && <FaCheckCircle className="text-green-600" />}
                <span className="text-sm">{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Choose a strong password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {strength.label && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="w-2/3 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`${strength.color} h-2`} style={{ width: strength.label === 'Strong' ? '100%' : strength.label === 'Medium' ? '66%' : '33%' }} />
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{strength.label}</div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-200"
                  placeholder="Repeat your password"
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-xl transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <Link to="/signin" className="text-teal-600 hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
