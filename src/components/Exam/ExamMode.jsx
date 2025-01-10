// src/ExamMode.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePasskey, verifyPasscode } from '../../features/examQuesSlice';
import { useDispatch, useSelector } from 'react-redux';

const ExamMode = () => {
  // State to store selected mode
  const [mode, setMode] = useState('');

  
  const [showVerification, setShowVerification] = useState(false);
  const [passcode, setPasscode] = useState('');

  const {exam} = useSelector((state)=>state?.examQues);
  const {userData} = useSelector((state)=>state?.auth)
  
  const user_id = userData.id;
  const exam_id = exam.id

  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  // Handle mode selection
  const handleModeChange = async(event) => {
    const selectedMode = event.target.value;
    setMode(selectedMode);

    try{
      if (selectedMode === 'center') {
        await  dispatch(generatePasskey({user_id,exam_id})).unwrap();
        setShowVerification(true);
      } else {
        setShowVerification(false);
        navigate('/exam-guide');
      }
    }catch (error){
      error.error;
    }
  };

  // Handle verification form submission
  const handleVerificationSubmit = async(event) => {
    event.preventDefault();
    console.log('Verification Code Submitted:', passcode);
    await dispatch(verifyPasscode({user_id,exam_id,passcode})).unwrap();
    console.log('Verification Code Submitted:', passcode);
    navigate('/exam-guide');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Select Exam Mode</h2>
        <div className="flex justify-around mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="examMode"
              value="center"
              checked={mode === 'center'}
              onChange={handleModeChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="text-lg">Center</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="examMode"
              value="inHome"
              checked={mode === 'inHome'}
              onChange={handleModeChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="text-lg">In Home</span>
          </label>
        </div>

        {showVerification && (
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
        )}
      </div>
    </div>
  );
};

export default ExamMode;