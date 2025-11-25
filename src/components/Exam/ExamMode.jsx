
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCenter ,generatePasskey} from '../../features/examQuesSlice';
import { useDispatch, useSelector } from 'react-redux';
// import {AllCenter} from "../../Services/examQuesServices"

const ExamMode = () => {

  const { attempts,allcenter } = useSelector((state) => state.examQues );
  const {userData} = useSelector((state)=>state?.auth);
  const [selectedCenterId, setSelectedCenterId] = useState(""); // State to store selected center ID
  const {exam}= useSelector((state) => state.examQues);
    const exam_id = exam?.id; 

  const handleCenterChange = (e) => {
    setSelectedCenterId(e.target.value); // Update the selected center ID
  };


  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
   dispatch(getAllCenter());
  }, [])

  const user_id = userData.id
  
  const pass_exam_id = attempts
    ?.find(({ exam, isqualified }) => exam?.level?.id === 2 && isqualified)
    ?.exam?.id;

  // Handle verification form submission
  const handleGeneratePasskey = async(event) => {
    event.preventDefault();
    if (selectedCenterId  && pass_exam_id) {
      dispatch(generatePasskey({ user_id, exam_id,center_id:selectedCenterId}));
      navigate('/teacher');
    } else {
      alert("Please select a center before submitting.");
    }
  };

  return (
    <div className=" bg-primary flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Generate Exam Passkey</h2>
          <p className="text-secondary text-sm">Select your preferred exam center to generate passkey</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <form onSubmit={handleGeneratePasskey} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-bold text-text">
                Select Exam Center <span className="text-error">*</span>
              </label>
              <select
                value={selectedCenterId}
                onChange={handleCenterChange}
                className="border border-secondary/30 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm font-medium transition-all"
              >
                <option value="">Choose exam center...</option>
                {allcenter && allcenter?.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.center_name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={!selectedCenterId}
              className="w-full bg-primary text-white py-3 rounded-xl hover:bg-[#2a7ba0] font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              Generate Passkey for Offline Exam
            </button>
          </form>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            💡 <strong>Note:</strong> This passkey will be used for offline exam verification at the selected center.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamMode;