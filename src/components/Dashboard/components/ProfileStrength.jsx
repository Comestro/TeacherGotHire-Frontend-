import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';

const ProfileStrength = ({ percentage }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <FaChartLine size={14} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Profile Strength</h3>
        </div>
        <span className="text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded text-[10px]">
          {percentage}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default ProfileStrength;
