import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 p-8">
      <div className="container mx-auto flex flex-col items-center md:flex-row md:justify-between">
        
        {/* Logo and Description */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-white">PTPI</h2>
          <p className="text-sm">Connecting students with the best teachers and teaching opportunities.</p>
        </div>
        
        {/* Links */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <a href="#" className="text-sm hover:text-white">About Us</a>
          <a href="#" className="text-sm hover:text-white">Courses</a>
          <a href="#" className="text-sm hover:text-white">Blog</a>
          <a href="#" className="text-sm hover:text-white">Contact</a>
        </div>
        
        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <a href="#" className="hover:text-white"><FaFacebookF /></a>
          <a href="#" className="hover:text-white"><FaTwitter /></a>
          <a href="#" className="hover:text-white"><FaInstagram /></a>
          <a href="#" className="hover:text-white"><FaLinkedinIn /></a>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm mt-4">
        &copy; {new Date().getFullYear()} PTPI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
