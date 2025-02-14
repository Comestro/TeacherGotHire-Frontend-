import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0">
      <div className="bg-white rounded-lg p-6 min-w-[400px] overflow-y-scroll max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 ">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        {children}
        <div className="mt-4 flex justify-end pr-4">
          <button onClick={onClose} className="px-6 py-2   bg-gradient-to-r text-white from-[#3E98C7] to-[#67B3DA] transition-colors rounded-lg shadow-sm hover:shadow-md">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
