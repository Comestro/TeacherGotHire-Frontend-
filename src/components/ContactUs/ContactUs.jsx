
import React from "react";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-100 py-10">
import React from "react";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-100 py-10 px-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Get in Touch
        </h1>
        <p className="text-lg text-center text-gray-600 mb-10">
          We’d love to hear from you! Fill out the form below or contact us
          directly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6">
              Feel free to reach out via phone or email, or visit us at our
              office.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h11M9 21V3m6 18V3"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">+1 234 567 890</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 2H8c-1.1 0-2 .9-2 2v16l7-3 7 3V4c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">contact@company.com</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16l-4-4m0 0l4-4m-4 4h16"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">
                  123 Main Street, City, Country
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;



        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-6">
              Feel free to reach out via phone or email, or visit us at our
              office.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h11M9 21V3m6 18V3"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">+1 234 567 890</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 2H8c-1.1 0-2 .9-2 2v16l7-3 7 3V4c0-1.1-.9-2-2-2z"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">contact@company.com</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16l-4-4m0 0l4-4m-4 4h16"
                    />
                  </svg>
                </span>
                <p className="ml-4 text-gray-700">
                  123 Main Street, City, Country
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
