import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';

const ProfileStrength = ({ percentage }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <FaChartLine size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">Profile Strength</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Overall Completion</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-teal-600 font-black text-lg leading-none">
              {percentage}%
            </span>
            <span className="text-[9px] font-bold text-teal-500/80 uppercase mt-1">
              {percentage === 100 ? 'Excellent' : percentage >= 70 ? 'Very Good' : percentage >= 40 ? 'Good' : 'Needs Work'}
            </span>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="space-y-3">
          <div className="relative h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="absolute top-0 left-0 h-full bg-teal-500 rounded-full"
            />
          </div>
          
          {percentage < 100 && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
              <div className="w-1 h-1 bg-teal-500 rounded-full" />
              Complete your profile to unlock more opportunities
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileStrength;
