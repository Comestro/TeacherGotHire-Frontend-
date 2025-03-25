import React from 'react';
import { useSelector } from 'react-redux';

const InterviewCard = () => {
  // Get data from Redux store
  const { interview, examSet } = useSelector(
    (state) => state.examQues
  );
  
  const level2OfflineExamSets = examSet?.filter(
    (exam) => exam.level.name === "2nd Level Offline"
  );

  if (!level2OfflineExamSets || level2OfflineExamSets.length === 0) {
    return null;
  }

  if (!interview || interview.length === 0) {
    return null; // Don't show anything if no interview data exists
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
      {interview?.map((item) => (
        <div key={item.id} className="space-y-4">
          {item.status === false ? (
            // Pending Approval Card
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500 text-white text-sm font-medium">
                  Pending Approval
                </span>
                <span className="text-sm text-gray-500">
                  Admin Confirmation
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Interview Request Submitted
              </h4>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Your selected date and time: <span className="font-medium">{item.time}</span></span>
                </p>
                <p className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  <span>Admin will confirm your request soon</span>
                </p>
              </div>
              
              <div className="mt-4 text-center bg-yellow-100 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Thank you for submitting your request. We will notify you once it is approved.
                </p>
              </div>
            </div>
          ) : (
            // Approved Interview Card
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium">
                  Approved
                </span>
                <span className="text-sm text-gray-500">
                  Ready to Join
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Interview Scheduled
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">Subject:</span> {item.subject_name || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Time:</span> {new Date(item.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {item.link && (
                  <div className="mt-4 text-center">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      Join Interview
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InterviewCard;