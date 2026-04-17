import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserEdit, 
  FaArrowRight, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaChartLine
} from 'react-icons/fa';

const ProfileCompletionWidget = ({ completionData }) => {
  const navigate = useNavigate();
  const percentage = completionData?.profile_completed || 0;
  const feedback = completionData?.feedback || [];
  
  if (percentage === 100 && feedback.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-5 text-white shadow-lg overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaCheckCircle className="text-xl" />
            </div>
            <h3 className="font-bold text-lg">Profile Complete</h3>
          </div>
          <p className="text-teal-50 text-sm opacity-90">
            Great job! Your profile is 100% complete. This increases your visibility to recruiters.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </motion.div>
    );
  }

  // Get the most important thing to do next
  const nextStep = feedback[0];

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <FaChartLine />
              </div>
              <h3 className="font-bold text-slate-800">Profile Strength</h3>
            </div>
            <span className="text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded text-xs">
              {percentage}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.3)]"
            />
          </div>

          <AnimatePresence mode="wait">
            {nextStep && (
              <motion.div 
                key={nextStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-50 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-amber-500">
                    <FaExclamationCircle />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {nextStep.step}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      {nextStep.label}
                    </p>
                    <button
                      onClick={() => navigate(nextStep.link)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors bg-white px-3 py-2 rounded-md border border-teal-100 shadow-sm"
                    >
                      Complete Profile <FaArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-500 font-medium">
            Pro Tip: Teachers with 100% complete profiles are 5x more likely to be hired.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionWidget;
