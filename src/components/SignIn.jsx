import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login as authlogin } from '../features/authSlice'; // Redux action to store the user login state
import { login as loginService } from '../services/authServices'; // Service to authenticate the user
import Input from './Input';
import Button from './Button';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');

  const login = async ({email,password}) => {
    setError(''); // Clear any previous errors
    try {
      const userData = await loginService({email,password}); // Call the service function to authenticate the user
      if (userData) {
        dispatch(authlogin(userData)); // Dispatch action to store the user data in Redux store
        navigate('/teacher'); // Redirect to teacher dashboard after login
      }
    } catch (error) {
      setError(error.message); // Set error message if login fails
    }
  };

  return (
    <div className="flex bg-cover bg-no-repeat items-center justify-center m" style={{ backgroundImage: 'url("/bg.png")' }}>
      {/* Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:pl-20">
        <div className="max-w-lg w-full mt-5 bg-white rounded-lg p-6">
          <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
            Hello, <span className="font-bold text-teal-600">Teachers</span>
          </h2>
          <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
            Sign in to <span className="font-bold text-xl md:text-4xl text-teal-600">PTPI</span>
          </h2>

          {/* Error Message */}

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit(login)} className="space-y-5">
            {/* Email */}
            <div className="mb-4">
            <label className="block text-sm font-medium  text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
            <Input

              placeholder="Enter your email"
              type="email" id="email" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "


              {...register('email', {
                required: true,
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    'Email address must be valid',
                },
              })}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
            <label className="block text-sm font-medium  text-gray-700 mb-1" htmlFor="pass">
                  Password
                </label>
              <Input
                placeholder="Enter your password"
                type="password"
                id="pass"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                {...register('password', { required: 'Password is required' })}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              Log In
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
                <span className="text-sm font-medium text-gray-600">Sign in with Google</span>
              </button>

              <button className="flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:bg-gray-100 transition">
                <img
                  src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium text-gray-600">Sign in with Facebook</span>
              </button>
            </div>

            <p className="text-sm font-medium text-gray-600 mt-6">
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/signup/teacher')}
                className="text-teal-600 hover:underline font-semibold"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col pl-36 justify-center h-screen p-10">
        {/* Step 1 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold">1</div>
            <div className="h-12 w-1 bg-teal-500"></div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Enter Credentials</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">2</div>
            <div className="h-12 w-1 bg-gray-300"></div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Login Successful</div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">3</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Go to Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
  
