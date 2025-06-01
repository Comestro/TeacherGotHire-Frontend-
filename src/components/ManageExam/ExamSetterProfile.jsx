import React from 'react';
import { FiUser, FiMail, FiCheckCircle, FiBook, FiAward, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { IoSchoolOutline } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ExamSetterProfile = () => {
  const setterUserArray = useSelector((state) => state.examQues.setterInfo);
  const navigate = useNavigate();

  if (!setterUserArray || !setterUserArray.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const setterUser = setterUserArray[0];
  const { user, subject, class_category, status } = setterUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Add Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center px-4 py-2 bg-teal-600 rounded-lg shadow-sm hover:bg-teal-700 transition-colors text-white hover:text-gray-100"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 px-8 py-12 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10 flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <FiUser className="w-12 h-12 text-teal-600" />
              </div>
              
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">
                  {user.Fname} {user.Lname}
                </h1>
                <p className="text-teal-100 text-lg mb-2">Exam Setter</p>
                <div className="flex items-center space-x-2">
                  <span className="text-teal-200">ID: {user.user_code}</span>
                  {user.is_verified && (
                    <div className="flex items-center space-x-1 bg-teal-500 px-3 py-1 rounded-full">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiMail className="w-5 h-5 text-teal-600 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-600">Email:</span>
                </div>
                <p className="text-gray-800 ml-5 break-all">{user.email}</p>
                
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-600">User ID:</span>
                </div>
                <p className="text-gray-800 ml-5 font-mono">{user.user_code}</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiAward className="w-5 h-5 text-green-600 mr-2" />
                Status
              </h2>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-semibold ${status ? 'text-green-700' : 'text-red-700'}`}>
                  {status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Academic Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Class Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <IoSchoolOutline className="w-6 h-6 text-teal-600 mr-3" />
                Class Categories
              </h2>
              
              <div className="space-y-4">
                {class_category.map((category) => (
                  <div key={category.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-indigo-800 flex items-center">
                        <FiUsers className="w-5 h-5 mr-2" />
                        Grade {category.name}
                      </h3>
                      <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ID: {category.id}
                      </span>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 mb-4">{category.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 mb-3">Associated Subjects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.subjects.map((subj) => (
                          <span key={subj.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
                            {subj.subject_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">#{user.id}</p>
              <p className="text-gray-600 text-sm">User ID</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{subject.length}</p>
              <p className="text-gray-600 text-sm">Subjects</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoSchoolOutline className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{class_category.length}</p>
              <p className="text-gray-600 text-sm">Class Categories</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{user.is_verified ? 'Yes' : 'No'}</p>
              <p className="text-gray-600 text-sm">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSetterProfile;