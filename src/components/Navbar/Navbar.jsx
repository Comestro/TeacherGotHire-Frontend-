import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdClose, IoMdMenu } from "react-icons/io";

const Navbar = ({ links, variant, externalComponent: ExternalComponent }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define paths where links should be hidden and where special links should be shown
  const hideLinksPaths = ["/signin", "/signup/teacher"];
  const showSpecialLinksPaths = ["/signin", "/signup/teacher"];

  // Determine whether to hide the regular links
  const shouldHideLinks = hideLinksPaths.includes(location.pathname);
  const shouldShowSpecialLinks = showSpecialLinksPaths.includes(
    location.pathname
  );

  return (
    <>
      <nav
        className={`flex items-center justify-between shadow py-2 px-6 md:px-10 ${
          variant === "light" ? "bg-white " : "bg-white-500 "
        }`}
      >
        <div className="text-3xl font-bold text-gray-800">PTPI.COM</div>

        {/* Hamburger Menu Button */}
        <button
          className="block md:hidden text-2xl focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <IoMdClose /> : <IoMdMenu />}
        </button>

        {/* Main Navigation */}
        <div
          className={`absolute top-16 left-0 w-full bg-white md:bg-transparent md:static md:flex md:items-center md:gap-6 ${
            isMenuOpen ? "block" : "hidden"
          } md:block transition-all `}
        >
          <div className="flex flex-col md:flex-row items-center md:gap-6 w-full justify-end">
            <Link
              to="/"
              className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
            >
              Home
            </Link>
            {!shouldHideLinks &&
              links.map((link) => (
                <Link
                  key={link.id}
                  to={link.to}
                  className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
                >
                  {link.label}
                </Link>
              ))}

            {shouldShowSpecialLinks && (
              <>
                <Link
                  to="/signin"
                  className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup/teacher"
                  className="items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
                >
                  Become a Teacher
                </Link>
              </>
            )}
          </div>
          {ExternalComponent && (
            <div className="mt-4 md:mt-0 md:ml-4">
              <ExternalComponent />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
