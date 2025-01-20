
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPasscode } from '../../features/examQuesSlice';
import { useDispatch, useSelector } from 'react-redux';

const ExamMode = () => {
  
  const [passcode, setPasscode] = useState('');

  const { attempts } = useSelector(
      (state) => state.examQues
    );
  
  const {userData} = useSelector((state)=>state?.auth)

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user_id = userData.id
  console.log("attempts",attempts);
  const exam_id = attempts
    ?.find(({ exam, isqualified }) => exam?.level?.id === 2 && isqualified)
    ?.exam?.id;

  // Handle verification form submission
  const handleVerificationSubmit = async(event) => {
    event.preventDefault();
    console.log('Verification Code Submitted:', passcode);
    await dispatch(verifyPasscode({user_id,exam_id,passcode})).unwrap();
    console.log('Verification Code Submitted:', passcode);
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Enter Your Verification Code</h3>
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Verification Code"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ExamMode;