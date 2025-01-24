import React, { useState } from 'react';
import { forgetPassword } from '../services/authServices';
import Button from './Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await forgetPassword(email);
      setMessage('Password reset link has been sent to your email.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {message && (
            <p className={`text-sm text-center ${message.includes('sent') ? 'text-green-500' : 'text-red-500'} mb-4`}>
              {message}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-xl transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>          
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
