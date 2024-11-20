import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import Input from './Input';
import Button from './Button';

function SignUpPage() {
  const { role } = useParams(); // Get the role from the URL
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');

  const signup = async (data) => {
    console.log(data);
    if (role === 'teacher') {
      navigate('/teacherdashbord');
    } else {
      navigate('/schooladmindashboard');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://source.unsplash.com/featured/?education,learning"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Form Container */}
      <div className="relative z-10 bg-white shadow-2xl rounded-lg p-8 max-w-md w-full">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-6">
          Create Your Account
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit(signup)} className="space-y-6">
          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            {...register('name', { required: true })}
          />

          {/* Email */}
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            {...register('email', {
              required: true,
              validate: {
                matchPattern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  'Email address must be valid',
              },
            })}
          />

          {/* Password */}
          <Input
            label="Password"
            placeholder="Enter your password"
            type="password"
            {...register('password', { required: true })}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            type="password"
            {...register('confirmPassword', { required: true })}
          />

          {/* Role-Specific Input */}
          {role === 'teacher' && (
            <Input
              label="School Name"
              placeholder="Enter your school name"
              {...register('schoolName', { required: true })}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-transform duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign Up
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline cursor-pointer font-semibold"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
