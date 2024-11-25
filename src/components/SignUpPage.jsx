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

              {/* <label className="block text-sm font-medium  text-gray-700 mb-1" htmlFor="name">
                Name
              </label> */}
              <Input
                className="w-full border-2 border-gray-300 text-sm rounded-xl px-3 py-3 "
                placeholder="Enter your full name"
                {...register('name', { required: true })}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              {/* <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Email
              </label> */}
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
              {/* <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label> */}
              <Input
                placeholder="Enter your password"
                type="password" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "

                {...register('password', { required: true })}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              {/* <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Confirm Password
              </label> */}
              <Input

                placeholder="Confirm your password"
                type="password" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "

                {...register('confirmPassword', { required: true })}
              />
            </div>

            {/* Role-Specific Input */}
            <div className="mb-4">

              {role === 'teacher' && (

                <Input

                  placeholder="Enter your school name" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3 "

                  {...register('schoolName', { required: true })}
                />
              )}
            </div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 border-gray-300  rounded"
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
              Have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-teal-600 hover:underline font-semibold"
              >
                Sign In
              </span>

            </p>
          </div>


        </div>
      </div>

      {/* Background Image */}
      {/* <div className="hidden md:block w-1/2 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: 'url("https://img.freepik.com/premium-photo/pretty-teacher-holding-notebook-classroom_13339-248389.jpg?uid=R138633026&ga=GA1.1.1275289697.1728223870&semt=ais_hybrid")' }}>
      </div> */}

      <div className="w-full md:w-1/2 flex flex-col pl-36 justify-center h-screen p-10 ">
        {/* Step 1 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold">1</div>
            <div className="h-12 w-1 bg-teal-500"></div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Get Signup Completed</div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">2</div>
            <div className="h-12 w-1 bg-gray-300"></div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Select Teacher in Progress</div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">3</div>
            <div className="h-12 w-1 bg-gray-300"></div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Take interview</div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start space-x-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-bold">4</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold text-sm md:text-xl leading-none">Hire Teacher</div>
          </div>
        </div>
      </div>




    </div>

  );
}

export default SignUpPage;
