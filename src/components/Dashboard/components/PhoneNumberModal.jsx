import React, { useRef, useEffect } from "react";

const PhoneNumberModal = ({
  isOpen,
  onClose,
  phoneNumber,
  setPhoneNumber,
  error,
  loading,
  onSubmit
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Please Provide your Contact Number
        </h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-teal-600 text-sm font-medium mb-2">
              Phone Number*
            </label>
            <input
              ref={inputRef}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              placeholder="Enter 10-digit phone number"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-teal-600"
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className={`px-5 py-2 text-white rounded-lg transition-all ${
                loading || phoneNumber.length !== 10
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 hover:shadow-md"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhoneNumberModal;