import React, { useState } from 'react'
import HorizontalLinearAlternativeLabelStepper from '../Dashboard/components/Stepper'
import { CircularProgressbar } from 'react-circular-progressbar'

const FindTeacherRecruiter = () => {
  const [percentage, setPercentage] = useState(50); // Example dynamic percentage

  return (
    <div className="w-[1000px] min-h-screen bg-white">
      {/* Main section */}
      <div className="px-4 md:px-8">
        <div className="w-full flex flex-col mx-auto rounded-md">
          <div className="px-4 grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            
            {/* Profile Section */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-6 flex flex-col items-center shadow-lg">
              <div className="flex justify-center w-20 mb-4">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  styles={{
                    path: { stroke: "#3E98C7" },
                    trail: { stroke: "#D6EAF8" },
                    text: {
                      fill: "#3E98C7",
                      fontSize: "20px",
                      fontWeight: "bold",
                    },
                  }}
                />
              </div>
              <p className="text-gray-500 font-semibold text-center">
                {percentage}% profile completed.
              </p>
              {/* Button Section */}
              <button className="mt-6 px-6 py-3 bg-[#3E98C7] text-white text-sm font-medium rounded-lg transition-all duration-300 hover:bg-[#2A7D99]">
                Complete Profile
              </button>
            </div>

            {/* Exam Section */}
            <div className="col-span-2 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-blue-300 rounded-lg p-6 shadow-lg flex flex-col gap-6">
              <p className="text-xl font-semibold text-[#3E98C7] text-center">
                Complete your exam in 3 levels
              </p>
              <div className="w-full mt-4">
                <HorizontalLinearAlternativeLabelStepper />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindTeacherRecruiter
