import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
        {/* Tutors Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">Tutors</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Log in</a></li>
            <li><a href="#" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
            <li><a href="#" className="hover:underline">Contact us</a></li>
            <li><a href="#" className="hover:underline">Help</a></li>
          </ul>
        </div>

        {/* Top Services Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">Top services</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:underline">Math Tutors</a></li>
            <li><a href="#" className="hover:underline">Reading Tutors</a></li>
            <li><a href="#" className="hover:underline">English Tutors</a></li>
            <li><a href="#" className="hover:underline">SAT Tutoring</a></li>
            <li><a href="#" className="hover:underline">Chemistry Tutors</a></li>
            <li><a href="#" className="hover:underline">Spanish Tutors</a></li>
            <li><a href="#" className="hover:underline">Writing Tutors</a></li>
          </ul>
        </div>

        {/* Students Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">Students</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:underline">Tips for hiring</a></li>
            <li><a href="#" className="hover:underline">Tutoring prices</a></li>
            <li><a href="#" className="hover:underline">Free online courses</a></li>
            <li><a href="#" className="hover:underline">Online tutoring</a></li>
            <li><a href="#" className="hover:underline">Services near me</a></li>
          </ul>
        </div>

        {/* Tutors Jobs Section */}
        <div>
          <h3 className="font-bold text-lg mb-4">Tutors</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:underline">Tutoring jobs</a></li>
            <li><a href="#" className="hover:underline">Online tutoring jobs</a></li>
            <li><a href="#" className="hover:underline">How to become a tutor</a></li>
            <li><a href="#" className="hover:underline">Online whiteboard for teaching</a></li>
            <li><a href="#" className="hover:underline">PTPI.com reviews</a></li>
          </ul>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="text-center text-gray-500 mt-8 text-sm border-t pt-4">
        © 2024 copyright · <a href="#" className="hover:underline">Terms of Use</a> · <a href="#" className="hover:underline">Privacy Policy</a> · <a href="#" className="hover:underline">Accessibility</a> · <a href="#" className="hover:underline">Services</a>
      </div>
    </footer>
  );
};

export default Footer;