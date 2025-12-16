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

  // Mobile toggle logic can be handled within Sidebar or here depending on responsiveness requirements
  // For simplicity based on previous MUI logic, we'll keep a state that sidebar consumes.
  // We'll also pass a mobile-specific prop if needed, or let Sidebar handle media queries.

  // Format page title from path
  const path = location.pathname
    .replace(/\//g, " ")
    .replace("-", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          // Adjust margin or width based on sidebar state if needed,
          // but traditionally with flexbox, 'flex-1' takes remaining space.
          // If Sidebar is fixed/absolute on mobile, we need to handle that.
          // Let's assume Sidebar handles its own width/visibility and this div takes remaining space.
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        }`}
        style={
          {
            // If sidebar is properly "flexed" it consumes space.
            // If we want the drawer effect where content pushes, we just use flex.
            // If MUI drawer was "persistent", it pushed content.
            // If we want to replicate that:
            // The Sidebar component needs to be a flex item that expands/collapses width.
          }
        }
      >
        {/* Header / AppBar */}
        <header
          className="h-14 bg-gradient-to-r from-teal-600 to-teal-500 shadow-md flex items-center px-4 fixed w-full z-40 transition-all duration-300"
          style={{
            // If we want the header to span the whole width fixed, we leave it w-full.
            // If it should shift with sidebar, we'd adjust left padding or margin.
            // For a standard admin panel, header usually spans full width or sits next to sidebar.
            // The MUI one had zIndex.drawer + 1, so it likely sat ON TOP of sidebar?
            // "zIndex: theme.zIndex.drawer + 1" means Header is above Sidebar.
            zIndex: 50,
          }}
        >
          <button
            onClick={handleSidebarToggle}
            className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors mr-4 focus:outline-none md:hidden"
            aria-label="Toggle Sidebar"
          >
            {/* Only show toggle on mobile if sidebar is permanent on desktop? 
                 MUI logic: "open={open && !isMobile}". 
                 Desktop toggles "persistent" drawer. Mobile toggles "temporary".
                 We will implement a responsive sidebar.
             */}
            {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop Toggle (if we want to collapse sidebar on desktop too) */}
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
        {/* Main Content Spacer for fixed header */}
        <div className="h-14" />

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden w-full max-w-full">
          <div className="max-w-8xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
