import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';

const ProfileNextStep = ({ feedback }) => {
  const navigate = useNavigate();
  const nextStep = feedback && feedback[0];

  if (!nextStep) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={nextStep.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 shadow-sm shadow-emerald-100/50"
      >
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="h-8 w-8 sm:h-12 sm:w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className="px-1.5 py-0.5 bg-emerald-100 text-[9px] sm:text-[10px] font-bold text-emerald-700 rounded uppercase tracking-wider">
                Recommended Action
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">•</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {nextStep.step}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-base leading-tight">
              {nextStep.label}
            </h4>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-1.5 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => navigate(nextStep.link)}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-teal-600 text-white text-[11px] sm:text-xs font-bold rounded-lg hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Complete Profile <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium italic sm:text-right text-center sm:text-left">
             Get hired 5x faster
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileNextStep;
