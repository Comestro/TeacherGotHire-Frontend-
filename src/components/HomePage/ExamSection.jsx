import React from 'react'
import { IoIosArrowForward } from 'react-icons/io'

const ExamSection = () => {
    return (
        <div className="relative py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50/50 to-transparent" />

                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
                        {/* Left Section with Text */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                                    Create and conduct your first exam as a teacher in <span className="text-teal-600">under an hour!</span>
                                </h1>
                                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                                    We provide qualified teachers committed to shaping a brighter future for your students. Login today and connect with our expert educators!
                                </p>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    "Without talking to a salesperson or scheduling a demo",
                                    "Without putting a credit card on file",
                                    "Without installing software or performing technical integrations",
                                    "Without creating student accounts"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center text-lg text-slate-600 group">
                                        <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mr-3 group-hover:bg-teal-100 transition-colors">
                                            <IoIosArrowForward />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4">
                                <button
                                    className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:bg-slate-900 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Start your free trial
                                </button>
                            </div>
                        </div>

                        {/* Right Section with Image */}
                        <div className="relative lg:h-full flex items-center justify-center">
                            <div className="relative w-full max-w-md aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-teal-50 rounded-2xl transform rotate-3" />
                                <img
                                    src="edu.jpg"
                                    alt="Classroom"
                                    className="relative z-10 w-full h-full object-cover rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExamSection