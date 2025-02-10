import React from "react";
import { Link } from "react-router-dom"; // or from 'next/link' if using Next.js

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-5">
        {/* Tutors Section */}
        <div className="px-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Tutors</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/" className="hover:underline block">
                Home
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline block">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline block">
                About
              </Link>
            </li>
            <li>
              <Link to="/teacher" className="hover:underline block">
                Teacher Dashboard
              </Link>
            </li>
            <li>
              <Link to="/examcenter" className="hover:underline block">
                Exam Center
              </Link>
            </li>
            <li>
              <Link to="/subject-expert" className="hover:underline block">
                Subject Expert
              </Link>
            </li>
          </ul>
        </div>

        {/* Top Services Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Top Services</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/math-tutors" className="hover:underline block">
                Math Tutors
              </Link>
            </li>
            <li>
              <Link to="/reading-tutors" className="hover:underline block">
                Reading Tutors
              </Link>
            </li>
            <li>
              <Link to="/english-tutors" className="hover:underline block">
                English Tutors
              </Link>
            </li>
            <li>
              <Link to="/sat-tutoring" className="hover:underline block">
                SAT Tutoring
              </Link>
            </li>
            <li>
              <Link to="/chemistry-tutors" className="hover:underline block">
                Chemistry Tutors
              </Link>
            </li>
            <li>
              <Link to="/spanish-tutors" className="hover:underline block">
                Spanish Tutors
              </Link>
            </li>
            
          </ul>
        </div>

        {/* Students Section */}
        <div className="p-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Students</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/hiring-tips" className="hover:underline block">
                Tips for hiring
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:underline block">
                Tutoring prices
              </Link>
            </li>
            <li>
              <Link to="/free-courses" className="hover:underline block">
                Free online courses
              </Link>
            </li>
            <li>
              <Link to="/online-tutoring" className="hover:underline block">
                Online tutoring
              </Link>
            </li>
            <li>
              <Link to="/local-services" className="hover:underline block">
                Services near me
              </Link>
            </li>
          </ul>
        </div>

        {/* Tutors Jobs Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Tutors Jobs</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/tutoring-jobs" className="hover:underline block">
                Tutoring jobs
              </Link>
            </li>
            <li>
              <Link to="/online-jobs" className="hover:underline block">
                Online tutoring jobs
              </Link>
            </li>
            <li>
              <Link to="/become-tutor" className="hover:underline block">
                How to become a tutor
              </Link>
            </li>
            <li>
              <Link to="/whiteboard" className="hover:underline block">
                Online whiteboard for teaching
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:underline block">
                PTPI.com reviews
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-gray-500 mt-8 text-sm border-t pt-4 px-4">
        <p>
          © 2024 copyright ·
          <Link to="/terms" className="hover:underline mx-2">
            Terms of Use
          </Link>{" "}
          ·
          <Link to="/privacy" className="hover:underline mx-2">
            Privacy Policy
          </Link>{" "}
          ·
          <Link to="/accessibility" className="hover:underline mx-2">
            Accessibility
          </Link>{" "}
          ·
          <Link to="/services" className="hover:underline mx-2">
            Services
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;