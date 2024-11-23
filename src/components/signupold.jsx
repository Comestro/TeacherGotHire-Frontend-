import React from 'react';

const SignupForm = () => {
  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Get Started Now</h1>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the <span className="text-green-600">terms & policy</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Signup
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Or</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button className="bg-gray-100 p-2 rounded-full shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-6 h-6" />
              </button>
              <button className="bg-gray-100 p-2 rounded-full shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              Have an account?{' '}
              <a href="#" className="text-green-600 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden md:block w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("https://source.unsplash.com/random")' }}>
        {/* Add your own image URL above */}
      </div>
    </div>
  );
};

export default SignupForm;
