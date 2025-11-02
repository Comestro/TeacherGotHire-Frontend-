
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <form onSubmit={handleGeneratePasskey} className="space-y-4">
               
               <div className="flex flex-col mb-4 gap-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Exam Center
                  </label>
                  <select
                     value={selectedCenterId} // Controlled component bound to state
                     onChange={handleCenterChange}
                    className="border border-gray-300 rounded-md px-2 py-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-300"
                  >
                    <option value="">Select Exam Center</option>
                    {allcenter && allcenter?.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.center_name}
                      </option>
                    ))}
                  </select>
                  <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  By Clicking Generate passkey for Offline Exam
                </button> 
                </div>
              </form>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ExamMode;