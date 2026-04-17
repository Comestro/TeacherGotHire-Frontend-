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
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-400"
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-amber-50 text-amber-500 rounded-lg">
            <FaExclamationCircle size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Recommended Action: {nextStep.step}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-4 leading-relaxed">
              {nextStep.label}
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(nextStep.link)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg active:scale-95"
              >
                Complete Profile <FaArrowRight size={12} />
              </button>
              
              <p className="text-[10px] text-slate-400 font-medium italic">
                Increases selection chances by 20%
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileNextStep;
