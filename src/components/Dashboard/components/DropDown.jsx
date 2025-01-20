import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const DropDown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const profile = useSelector((state) => state.auth.userData || {});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dropdown options
  const options = ["Profile", "Settings", "Logout"];

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-white"
      >
        {profile.Fname}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-2">
          <div className="py-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => alert(option)}
                className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropDown;
