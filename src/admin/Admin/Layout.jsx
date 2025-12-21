import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiMenu, FiChevronLeft } from "react-icons/fi";
import Sidebar from "../Sidebar/Sidebar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  // Format page title from path
  const path = location.pathname
    .replace(/\//g, " ")
    .replace("-", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        }`}
      >
        {/* Header / AppBar */}
        <header
          className="h-14 bg-gradient-to-r from-teal-600 to-teal-500 shadow-md flex items-center px-4 fixed w-full md:w-[calc(100%-240px)] z-40 transition-all duration-300"
          style={{
            zIndex: 40,
            marginLeft: isSidebarOpen ? undefined : 0, // Logic for width adjustment if we were collapsing sidebar
            width: isSidebarOpen ? undefined : "100%",
          }}
        >
          <button
            onClick={handleSidebarToggle}
            className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors mr-4 focus:outline-none md:hidden"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop Toggle */}
          <button
            onClick={handleSidebarToggle}
            className="hidden md:block text-white p-2 rounded-lg hover:bg-white/20 transition-colors mr-4 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={24} />
          </button>

          <h1 className="text-xl font-medium text-white tracking-wide truncate shadow-sm">
            {path || "Dashboard"}
          </h1>
        </header>

        {/* Main Content Spacer for fixed header */}
        <div className="h-14 flex-shrink-0" />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full custom-scrollbar p-0">
          <div className="max-w-8xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}