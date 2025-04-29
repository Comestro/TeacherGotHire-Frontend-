import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiX, FiHome } from 'react-icons/fi';
import SignupModal from './SignupModal';

const EnquiryHeader = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-800">
              PTP <span className="text-teal-600">INSTITUTE</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center">
            <button
              onClick={() => setShowSignupModal(true)}
              className="flex items-center gap-2 px-4 py-2 font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FiUser className="w-5 h-5" />
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} />
      )}
    </header>
  );
};

export default EnquiryHeader;