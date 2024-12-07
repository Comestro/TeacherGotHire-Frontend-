import React from 'react'
import { IoIosArrowForward } from 'react-icons/io'

const ExamSection = () => {
    return (
        <div className="relative overflow-hidden mb-20">
            {/* Content */}
            <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12">


                <div className="text-gray-700 mb-10 md:mt-10">
                    <h1 className="text-2xl sm:text-2xl text-gray-600 font-bold mb-6 leading-normal">
                        Create and conduct your first exam as a teacher in under an hour!
                    </h1>
                    <p className="text-lg pl-2 sm:text-md mb-6 leading-relaxed font-serif text-gray-600">
                        We provide qualified teachers committed to shaping a brighter future for your students. Login today and connect with our expert educators!
                    </p>
                    <ul className="space-y-4 text-lg sm:text-xl mb-6 leading-relaxed font-serif text-gray-600">
                        <li className="flex text-lg text-gray-500 items-center">
                            <IoIosArrowForward />

                            Without talking to a salesperson or scheduling a demo
                        </li>
                        <li className="flex text-lg text-gray-500 items-center">
                            <IoIosArrowForward />

                            Without putting a credit card on file
                        </li>
                        <li className="flex text-lg text-gray-500 items-center">
                            <IoIosArrowForward />

                            Without installing software or performing technical integrations
                        </li>
                        <li className="flex text-lg text-gray-500 items-center">
                            <IoIosArrowForward />

                            Without creating student accounts
                        </li>
                    </ul>
                </div>


                {/*  Right Section with Image */}
                <div className="relative w-full mt-5 text-center">
                    <div className="w-full h-64 lg:h-96">
                        <img
                            src="exam.webp"
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