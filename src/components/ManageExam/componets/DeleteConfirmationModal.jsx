import React from "react";
import { FiAlertTriangle, FiX, FiTrash2, FiGlobe } from "react-icons/fi";

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  question, 
  pair 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-red-900">Confirm Deletion</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            This question is part of a language pair. How would you like to proceed with the deletion?
          </p>

          <div className="space-y-3">
            {/* Delete Both */}
            <button
              onClick={() => onDelete('both')}
              className="w-full flex items-center justify-between p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <FiTrash2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm">Delete Both Versions</div>
                  <div className="text-[10px] opacity-80 font-normal mt-0.5 whitespace-nowrap">English & Hindi (Highly Recommended)</div>
                </div>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Sync</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* Delete English */}
              <button
                onClick={() => onDelete('single_english')}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl transition-all group"
              >
                <FiGlobe className="w-5 h-5 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center">English Only</span>
                <span className="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-tighter">Single</span>
              </button>

              {/* Delete Hindi */}
              <button
                onClick={() => onDelete('single_hindi')}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 hover:border-purple-100 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-xl transition-all group"
              >
                <FiGlobe className="w-5 h-5 mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center">Hindi Only</span>
                <span className="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-tighter">Single</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
