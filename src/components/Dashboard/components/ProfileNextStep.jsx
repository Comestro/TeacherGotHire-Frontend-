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
        className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm shadow-emerald-100/50"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <FaExclamationCircle size={20} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-100 text-[10px] font-bold text-emerald-700 rounded uppercase tracking-wider">
                Recommended Action
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">•</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {nextStep.step}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              {nextStep.label}
            </h4>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate(nextStep.link)}
            className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Complete Profile <FaArrowRight size={12} />
          </button>
          <p className="text-[10px] text-slate-400 font-medium italic sm:text-right">
             Get hired 5x faster
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileNextStep;
