import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ links, variant, externalComponent: ExternalComponent }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`flex items-center justify-between shadow py-2 px-10 ${
        variant === "light" ? "bg-white text-black" : "bg-white-500 text-black"
      }`}
    >
      <div className="text-3xl font-bold text-gray-800">PTPI.COM</div>
      <button
        ref={buttonRef}
        className="lg:hidden text-gray-800"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>      
      <div
        ref={menuRef}
        className={`flex items-center ml-4 space-x-4 ${
          isMobileMenuOpen
            ? "flex flex-col absolute bg-white top-16 left-0 right-4 p-4 shadow-lg lg:flex lg:flex-row mx-auto"
            : "hidden lg:flex lg:flex-row lg:space-x-6"
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.id}
            to={link.to}
            className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {ExternalComponent && (
          <div className="ml-4">
            <ExternalComponent />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;