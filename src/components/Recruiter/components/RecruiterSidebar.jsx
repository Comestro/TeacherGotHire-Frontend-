import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../services/authServices";
import { getUserData } from "../../../features/authSlice";
import { HiViewGrid, HiUser, HiBriefcase, HiOutlineLogin } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
 
const RecruiterSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.userData || {});
 
  // Define the isOpen state to control sidebar visibility
  const [isOpen, setIsOpen] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({
    dropdown1: false,
    dropdown2: false,
  });
 
  const toggleDropdown = (dropdown) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };
 
  useEffect(() => {
    dispatch(getUserData());
  }, [dispatch]);
 
  const handleLogout = () => {
    logout();
    navigate("/signin");
  };
 
  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
 
  return (
    <>
      <div
        className={`fixed bg-[#8b9d83] top-15 left-0 w-72 z-50 p-1 sticky border h-screen bg-white shadow-md ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col justify-center py-2 border-b-2 border-white">
            <h1 className="font-bold text-2xl text-gray-700 text-center">PTPI</h1>
            <p className="text-sm text-center text-teal-500 font-semibold mb-2">
              Private Teacher Provider Institute.
            </p>
          </div>
          <div className="flex flex-col flex-1 justify-between">
            <nav className="w-full mt-1">
              {/* Dropdown 1 */}
              <div
                className="mt-5 p-3 w-full cursor-pointer bg-white border-t  hover:bg-[#E5F1F9] transition-all"
                onClick={() => toggleDropdown("dropdown1")}
              >
                <div className="flex justify-between items-center">
                  <label htmlFor="basic" className="text-gray-700 font-semibold">
                    School
                  </label>
                  <span
                    className={`transform transition-all ${dropdownStates.dropdown1 ? "rotate-180" : "rotate-0"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
 
              {dropdownStates.dropdown1 && (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option1" />
                    <label htmlFor="option1" className="text-gray-600 text-sm">
                      Option 1
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option2" />
                    <label htmlFor="option2" className="text-gray-600 text-sm">
                      Option 2
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option3" />
                    <label htmlFor="option3" className="text-gray-600 text-sm">
                      Option 3
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option4" />
                    <label htmlFor="option4" className="text-gray-600 text-sm">
                      Option 4
                    </label>
                  </div>
                </div>
              )}
 
              <div
                className="p-3 w-full cursor-pointer bg-white border-t border-b hover:bg-[#E5F1F9] transition-all"
                onClick={() => toggleDropdown("dropdown2")}
              >
                <div className="flex justify-between items-center">
                  <label htmlFor="basic" className="text-gray-700 font-semibold">
                    Teacher
                  </label>
                  <span
                    className={`transform transition-all ${dropdownStates.dropdown2 ? "rotate-180" : "rotate-0"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
 
              {dropdownStates.dropdown2 && (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option1" />
                    <label htmlFor="option1" className="text-gray-600 text-sm">
                      Option 1
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option2" />
                    <label htmlFor="option2" className="text-gray-600 text-sm">
                      Option 2
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option3" />
                    <label htmlFor="option3" className="text-gray-600 text-sm">
                      Option 3
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="option4" />
                    <label htmlFor="option4" className="text-gray-600 text-sm">
                      Option 4
                    </label>
                  </div>
                </div>
              )}
            </nav>
 
            <div className="flex flex-col">
              <div className="border-t border-gray-200">
                <button className="flex items-center gap-1 text-md font-semibold text-gray-500 py-2 px-4">
                  <IoMdSettings className="size-5" />
                  Settings
                </button>
              </div>
 
              <div className="copyright flex justify-center w-full border-t border-gray-200">
                <p className="text-gray-500 text-center p-1 text-sm font-semibold">
                  Designed by Comestro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
 
export default RecruiterSidebar;