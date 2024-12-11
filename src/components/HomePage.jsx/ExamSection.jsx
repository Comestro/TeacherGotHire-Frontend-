import React from 'react'
import { IoIosArrowForward } from 'react-icons/io'

const ExamSection = () => {
    return (
        <div className="relative overflow-hidden mb-20">
            {/* Content */}
            <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12">


            <div className="text-gray-700 mb-10 md:mt-10 px-4 md:px-10">
      {/* Heading */}
      <h1 className="text-xl md:text-2xl lg:text-3xl text-gray-600 font-bold mb-6 leading-normal">
        Create and conduct your first exam as a teacher in under an hour!
      </h1>

      {/* Paragraph */}
      <p className="text-md sm:text-lg mb-6 leading-relaxed font-serif text-gray-600">
        We provide qualified teachers committed to shaping a brighter future for your students. Login today and connect with our expert educators!
      </p>

      {/* List */}
      <ul className="space-y-4 text-md sm:text-lg lg:text-xl mb-6 leading-relaxed font-serif text-gray-600">
        <li className="flex items-center text-gray-500">
          <IoIosArrowForward className="text-gray-600 text-center mr-2" />
          Without talking to a salesperson scheduling a demo
        </li>
        <li className="flex items-center text-gray-500">
          <IoIosArrowForward className="text-gray-600 text-center mr-2" />
          Without putting a credit card on file
        </li>
        <li className="flex items-center text-gray-500">
          <IoIosArrowForward className="text-gray-600 text-center mr-2" />
          No installation, integration, simple and seamless.</li>        <li className="flex items-center text-gray-500">
          <IoIosArrowForward className="text-gray-600 text-center mr-2" />
          Without creating student accounts
        </li>
      </ul>
    </div>


                {/*  Right Section with Image */}
                <div className="relative w-full mt-5 text-center">
                    <div className="w-full h-64 lg:h-96">
                        <img
                            src="edu.jpg"
                            alt="Classroom"
                            className="w-full h-full object-contain items-baseline"
                        />
                    </div>
                </div>
            </div>
            <div className='flex justify-center'><button
                onClick={() => onSelectRole("school")}
                className="bg-gray-700 text-white font-medium text-lg px-6 py-3 rounded-full shadow-md hover:text-gray-700 hover:bg-gray-100"
            >
                Start your free trial
            </button></div>

        </div>
    )
}

export default ExamSection