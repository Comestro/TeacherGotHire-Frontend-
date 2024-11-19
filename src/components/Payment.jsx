import React from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    // Simulate payment success and navigate to exam portal
    alert('Payment Successful!');
    navigate('/exam-portal');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Page</h1>
      <p className="text-gray-700 mb-6">Please complete your payment to proceed to the exam.</p>
      <button
        onClick={handlePaymentSuccess}
        className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition"
      >
        Pay ₹500
      </button>
    </div>
  );
};

export default Payment;
