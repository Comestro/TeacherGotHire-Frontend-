import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiClock, FiInfo, FiCalendar, FiCheckCircle, FiBook, FiUserCheck, FiVideo, FiMapPin } from 'react-icons/fi';

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

  // Format date function
  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="border-b border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiVideo className="mr-2 text-blue-500" />
            Interview Status
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Keep track of your scheduled interviews
          </p>
        </div>
      </div>

      <div className="p-6">
        {interview?.map((item) => (
          <div key={item.id} className="space-y-4">
            {item.status === "requested" ? (
              // Pending Request Card
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100"
              >
                {/* Status Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    PENDING
                  </div>
                </div>
                
                <div className="p-5 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                      <FiClock size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">Interview Request Submitted</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Your interview request is currently awaiting administrator approval.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FiCalendar className="mr-2 text-amber-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            Requested for <span className="font-medium">{formatDate(item.time)}</span>
                          </span>
                        </div>
                        
                        {item.subject && (
                          <div className="flex items-center text-sm">
                            <FiBook className="mr-2 text-amber-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Subject: <span className="font-medium">{item.subject.subject_name || "N/A"}</span>
                            </span>
                          </div>
                        )}
                        
                        {item.class_category && (
                          <div className="flex items-center text-sm">
                            <FiUserCheck className="mr-2 text-amber-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Class Category: <span className="font-medium">{item.class_category.name || "N/A"}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 bg-white/50 p-3 rounded-lg border border-amber-200">
                        <div className="flex items-start">
                          <FiInfo className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-xs text-amber-700">
                            You will receive a notification once your interview request is approved by the administrator.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Approved Interview Card
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100"
              >
                {/* Status Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    APPROVED
                  </div>
                </div>
                
                <div className="p-5 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                      <FiCheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">Interview Scheduled</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Your interview has been approved and scheduled.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FiCalendar className="mr-2 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            Scheduled for <span className="font-medium">{formatDate(item.time)}</span>
                          </span>
                        </div>
                        
                        {item.subject && (
                          <div className="flex items-center text-sm">
                            <FiBook className="mr-2 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Subject: <span className="font-medium">{item.subject.subject_name || "N/A"}</span>
                            </span>
                          </div>
                        )}
                        
                        {item.class_category && (
                          <div className="flex items-center text-sm">
                            <FiUserCheck className="mr-2 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Class Category: <span className="font-medium">{item.class_category.name || "N/A"}</span>
                            </span>
                          </div>
                        )}
                        
                        {item.location && (
                          <div className="flex items-center text-sm">
                            <FiMapPin className="mr-2 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              Location: <span className="font-medium">{item.location}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <FiVideo className="mr-2" />
                          Join Interview Now
                        </a>
                      )}
                      
                      {!item.link && (
                        <div className="mt-4 bg-white/50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-start">
                            <FiInfo className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-green-700">
                              The interview link will be available 15 minutes before the scheduled time.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InterviewCard;