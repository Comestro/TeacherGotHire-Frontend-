import React from "react";
import { FiLoader } from "react-icons/fi";

/**
 * A premium, reusable data loader for the Admin Panel
 */
const DataLoader = ({ message = "Synchronizing your data...", minHeight = "300px", className = "" }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center w-full transition-all duration-500 ease-in-out ${className}`} 
      style={{ minHeight }}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="w-16 h-16 rounded-full border-[3px] border-teal-50 border-t-teal-500 animate-[spin_1s_linear_infinite] shadow-sm"></div>
        
        {/* Inner Pulsing Core */}
        <div className="absolute w-10 h-10 rounded-full bg-teal-50/50 flex items-center justify-center">
            <FiLoader className="text-teal-600 w-5 h-5 animate-[spin_3s_linear_infinite]" />
        </div>
        
        {/* Subtitle animation */}
        <div className="absolute -bottom-1 w-2 h-2 bg-teal-500 rounded-full animate-ping"></div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-1">
        <p className="text-gray-600 font-bold text-sm tracking-widest uppercase opacity-80 animate-pulse">
          {message}
        </p>
        <div className="flex gap-1.5 mt-1">
           <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default DataLoader;
