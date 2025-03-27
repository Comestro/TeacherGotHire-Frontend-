import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/70 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.3,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.5
        }}
        className="relative w-20 h-20"
      >
        <div className="absolute w-full h-full rounded-full border-t-4 border-b-4 border-blue-500"></div>
        <div className="absolute w-full h-full rounded-full border-r-4 border-l-4 border-blue-300 animate-spin"></div>
        <div className="absolute w-12 h-12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </motion.div>
      <motion.p 
        className="mt-4 text-white font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loader;
