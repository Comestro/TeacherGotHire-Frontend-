import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import UniversalHeader from "../../components/commons/UniversalHeader";
import Sidebar from "../Sidebar/Sidebar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col`}
      >
        <UniversalHeader 
          onToggleSidebar={handleSidebarToggle} 
          isSidebarPresent={true} 
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full p-0">
          <div className="max-w-8xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}