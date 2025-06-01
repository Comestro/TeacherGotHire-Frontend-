import React, { useEffect, useState } from 'react';
import { 
  FiBook, 
  FiTarget, 
  FiUsers, 
  FiAward, 
  FiClock, 
  FiFileText,
  FiEdit,
  FiTrash2,
  FiHelpCircle 
} from 'react-icons/fi';
import { getExam, deleteExam } from '../../../services/adminManageExam';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ExamSetsTable = ({ onEdit, refreshTrigger }) => {
  const navigate = useNavigate();
  const [examSets, setExamSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExamSets = async () => {
    try {
      const response = await getExam();
      console.log('Exam API Response:', response);
      setExamSets(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exam sets:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch exam sets');
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam set?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteExam(examId);
      await fetchExamSets();
      toast.success('Exam set deleted successfully');
    } catch (err) {
      console.error('Error deleting exam set:', err);
      // Check for the specific error message from API
      if (err.response?.data?.error === "Please delete the associated questions first.") {
        toast.error('Please delete the associated questions first');
      } else {
        toast.error(err.response?.data?.error || 'Failed to delete exam set');
      }
    } finally {
      setIsDeleting(false);
    }
  };

const handleManageQuestions = (exam) => {
  navigate(`/manage-exam/questions/${exam.id}`, { 
    state: { exam: exam }
  });
};
  useEffect(() => {
    fetchExamSets();
  }, [refreshTrigger]); 

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exam sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-red-600">
        Error loading exam sets: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject & Level
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Configuration
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examSets.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {exam.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {exam.description}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <FiUsers className="w-4 h-4 mr-1" />
                      {exam.assigneduser.user.Fname} {exam.assigneduser.user.Lname}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <FiBook className="w-4 h-4 mr-1 text-blue-500" />
                      {exam.subject.subject_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiTarget className="w-4 h-4 mr-1 text-green-500" />
                      {exam.level.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiUsers className="w-4 h-4 mr-1 text-purple-500" />
                      Class {exam.class_category.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FiAward className="w-4 h-4 mr-1 text-yellow-500" />
                      {exam.total_marks} marks
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiClock className="w-4 h-4 mr-1 text-red-500" />
                      {exam.duration} minutes
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        exam.type === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {exam.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {exam.status ? 'Active' : 'Draft'}
                    </span>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiHelpCircle className="w-4 h-4 mr-1" />
                      {exam.questions.length} questions
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleManageQuestions(exam)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      title="Manage Questions"
                      disabled={isDeleting}
                    >
                      <FiFileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(exam)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
                      title="Edit Exam Set"
                      disabled={isDeleting}
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className={`bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Delete Exam Set"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamSetsTable;