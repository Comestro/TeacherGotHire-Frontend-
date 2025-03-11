import React, { useEffect } from "react";
import { BiLock } from "react-icons/bi";
import { FaHome, FaHeadset } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { handleLogout } from "../services/authUtils";
import { useDispatch } from "react-redux";

const UnauthorizedAccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
      handleLogout(dispatch, navigate)
  }, []);

  const handleSupportClick = () => {
    console.log("Contacting support");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          <BiLock
            className="mx-auto h-24 w-24 text-red-600 animate-pulse"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              403 Unauthorized
            </h1>
            <h2 className="text-xl font-medium text-gray-600">Access Denied</h2>
            <p className="text-base text-gray-500">
              You do not have permission to view this page. Please verify your
              credentials and try again.
            </p>
          </div>

          <div className="error-ref text-sm text-gray-400">
            Error Reference: #ERR-403-{Math.random().toString(36).substr(2, 9)}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to={"/"}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
            >
              <FaHome className="mr-2" />
              Return to Home
            </Link>

            <button
              onClick={handleSupportClick}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 ease-in-out"
              aria-label="Contact support team"
            >
              <FaHeadset className="mr-2" />
              Contact Support
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is a mistake, please contact your system
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
