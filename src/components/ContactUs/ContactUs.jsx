
import React from "react";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-white to-blue-100 py-10 px-10">
      <div className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-6">
          <span className="text-teal-600 text-6xl font" style={{ fontFamily: '"Edu AU VIC WA NT Pre", cursive' }}
          >C</span>ontact Us
        </h1>
        <p className="text-lg text-center text-gray-500 font-bold mb-10">
          We’d love to hear from you! Fill out the form below or contact us
          directly.
        </p>

        <div className="grid grid-cols-1 py-12 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="md:px-12">
            {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Contact Us
            </h2> */}
            <form>
              <div className="mb-4">
                {/* <label className="block text-sm font-medium text-gray-700">
                  Name
                </label> */}
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border-2 border-gray-300 bg-transparent text-sm rounded-xl p-3 "
                />
              </div>
              <div className="mb-4">
                {/* <label className="block text-sm font-medium text-gray-700">
                  Email
                </label> */}
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full border-2 border-gray-300 bg-transparent text-sm rounded-xl p-3 " />
              </div>
              <div className="mb-4">
                {/* <label className="block text-sm font-medium text-gray-700">
                  Message
                </label> */}
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className="w-full border-2 border-gray-300 bg-transparent text-sm rounded-xl p-3 "
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"          >

                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="md:pt-8">
            <h2 className="mb-8 font-bold text-4xl md:text-3xl text-gray-500 leading-none">
              Contact Information
            </h2>
            <p className="text-gray-500 text-lg font-bold mb-6">
              Feel free to reach out via phone or email, or visit us at our
              office.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="teal" class="bi bi-telephone" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                  </svg>
                </span>
                <p className="ml-4 text-gray-500 text-lg">+1 234 567 890</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="teal" class="bi bi-google" viewBox="0 0 16 16">
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                  </svg>
                </span>
                <p className="ml-4 text-gray-500 text-lg">contact@company.com</p>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="teal" class="bi bi-building" viewBox="0 0 16 16">
                    <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                    <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                  </svg>
                </span>
                <p className="ml-4 text-gray-500 text-lg">
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
