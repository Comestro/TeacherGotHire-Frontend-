import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ links, variant, externalComponent: ExternalComponent }) => {
  const location = useLocation();

  // Define paths where links should be hidden and where special links should be shown
  const hideLinksPaths = ["/signin", "/signup/teacher"];
  const showSpecialLinksPaths = ["/signin", "/signup/teacher"];

  // Determine whether to hide the regular links
  const shouldHideLinks = hideLinksPaths.includes(location.pathname);
  const shouldShowSpecialLinks = showSpecialLinksPaths.includes(location.pathname);

  return (
    <>
      <nav
        className={`flex items-center justify-between shadow py-2 px-10 ${
          variant === "light"
            ? "bg-white text-black"
            : "bg-white-500 text-black"
        }`}
      >
        <div className="text-3xl font-bold text-gray-800">PTPI.COM</div>
        <div className="flex items-center justify-between">
          {/* Conditionally render the regular links */}
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

          {/* Conditionally render the special "Logout" and "Become a Teacher" links */}
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

          {ExternalComponent && (
            <div className="ml-4">
              <ExternalComponent />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;