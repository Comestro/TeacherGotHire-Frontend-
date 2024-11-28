import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Input from './Input';
import Button from './Button';
import {signUp as authSignup} from '../features/authSlice'
import { useForm } from 'react-hook-form';
import {useNavigate } from 'react-router-dom';
import { createaccount } from '../services/authServices';


function SignUpPage() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');

  const signup = async ({username,email,password}) => {
    console.log(username,email,password);
    setError('');
    try {
      const response = await createaccount({ username, email, password });
      const token = response.token;
      
      dispatch(authSignup(response));
      if(token)
      {
        navigate('/teacherdashboard')
      }
    } catch (error) {
      setError(error.message);
    }
  };


  return (
    <div
      className="flex bg-cover bg-no-repeat  items-center justify-center"
      style={{ backgroundImage: 'url("/bg.png")' }}
    >

      {/* Form Container */}
      <div className="w-full md:w-1/2 flex items-center md:pl-72 justify-center ">
        <div className='max-w-md w-full mt-5'>
          <h2 className="mb-1 font-bold text-gray-500 text-lg md:text-xl leading-none">
            Hello,  <span className='font-bold text-teal-600'>Teachers </span>
          </h2>
          <h2 className="mb-8 font-bold text-gray-500 text-xl md:text-4xl leading-none">
            Signup To <span className='font-bold text-xl md:text-4xl text-teal-600'>PTPI </span>
          </h2>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit(signup)} className="space-y-5">
            {/* Full Name */}
            <div className="mb-4">
              <Input
                className="w-full border-2 border-gray-300 text-sm rounded-xl px-3 py-3 "
                placeholder="Enter your full name"
                {...register('username', { required: true })}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <Input
               placeholder="Enter your email"
                type="email" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
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
              <Input
                placeholder="Enter your password"
                type="password" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                  {...register('password', { required: true })}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
             <Input
                placeholder="Confirm your password"
                type="password" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "
                {...register('confirmPassword', { required: true })}
             />
            </div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox" id="terms" className="w-4 h-4 border-gray-300  rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the <span className="text-teal-600">terms & policy</span>
              </label>
            </div>
      {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"          >
              Sign Up
            </Button>
            


          </form>
          <div className="text-center my-2">
            <div className="flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="px-4 text-sm text-gray-600">Or</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mt-6">
              Have an account?{' '}
              <span
                onClick={() => navigate('/signin')}
                className="text-teal-600 hover:underline font-semibold"
              >
                Sign In
              </span>
            </p>
          </div>
          </div>
      </div >

    </div >

  );
}

export default SignUpPage;
