import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../Button";
import { IoIosNotifications } from "react-icons/io";

const Navbar = ({ links, variant, externalComponent: ExternalComponent }) => {
  return (
    <>
      <nav
        className={`flex items-center justify-between shadow  py-2 px-10 ${
          variant === "light"
            ? "bg-white text-black"
            : "bg-white-500 text-black"
        }`}
      >
        <div className="text-3xl font-bold text-gray-800">PTPI.COM</div>
        <div className="flex items-center justify-between">
          {/* {links.map((link, index) => (
            <a href="#" key={index}>
              <div className="flex gap-4">
              <Link href={link.href} className="font-semibold text-gray-600 px-3 p-2">
                {link.label}
              </Link>
              </div>
            </a>
          ))} */}
          {links.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className=" items-center gap-4 p-3 rounded-md hover:bg-gray-100 transition font-medium text-teal-900"
            >
              {link.label}
            </Link>
          ))}
          {/* <Button className="ml-4 bg-black">
            <IoIosNotifications />
          </Button> */}
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
