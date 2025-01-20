import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-5">
        {/* Tutors Section */}
        <div className="px-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Tutors</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a href="#" className="hover:underline block">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Log in
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Press
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Contact us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Help
              </a>
            </li>
          </ul>
        </div>

        {/* Top Services Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Top Services</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a href="#" className="hover:underline block">
                Math Tutors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Reading Tutors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                English Tutors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                SAT Tutoring
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Chemistry Tutors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Spanish Tutors
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Writing Tutors
              </a>
            </li>
          </ul>
        </div>

        {/* Students Section */}
        <div className="p-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Students</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a href="#" className="hover:underline block">
                Tips for hiring
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Tutoring prices
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Free online courses
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Online tutoring
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Services near me
              </a>
            </li>
          </ul>
        </div>

        {/* Tutors Jobs Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-800">Tutors Jobs</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a href="#" className="hover:underline block">
                Tutoring jobs
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Online tutoring jobs
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                How to become a tutor
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                Online whiteboard for teaching
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline block">
                PTPI.com reviews
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-gray-500 mt-8 text-sm border-t pt-4 px-4">
        <p>
          © 2024 copyright ·
          <a href="#" className="hover:underline mx-2">
            Terms of Use
          </a>{" "}
          ·
          <a href="#" className="hover:underline mx-2">
            Privacy Policy
          </a>{" "}
          ·
          <a href="#" className="hover:underline mx-2">
            Accessibility
          </a>{" "}
          ·
          <a href="#" className="hover:underline mx-2">
            Services
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
