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
  FiHelpCircle, 
  FiLock,
  FiEdit2,
  FiList,
  FiPlus,
  FiCopy,
  FiMoreVertical,
  FiEye,
  FiBarChart2
} from 'react-icons/fi';
import { getExam, deleteExam } from '../../../services/adminManageExam';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const ExamSetsTable = ({ onEdit, refreshTrigger, onAddQuestions, onCopy }) => {
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

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewQuestions = (exam) => {
    navigate('/manage-exam/questions', { state: { exam } });
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
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exam Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class & Subject
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Questions
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examSets.map((exam) => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{exam.set_name || "N/A"}</div>
                  <div className="text-sm text-gray-500">{exam.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{exam.subject?.subject_name || 'N/A'} ({exam.class_category?.name || 'N/A'})</div>
                  <div className="text-sm text-gray-500">{exam.level?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    exam.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {exam.type === 'online' ? 'Online Exam' : 'Center Exam'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`flex items-center text-sm ${
                    exam.is_published ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {exam.is_published ? (
                      <><FiCheck className="mr-1.5 h-4 w-4" /> Published</>
                    ) : (
                      <><FiLock className="mr-1.5 h-4 w-4" /> Draft</>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(exam.subject.subject_name != "hindi") ? exam.questions.length/2 : 0} questions
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/manage-exam/questions/${exam.id}`}
                      state={{ exam }}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                      title="Manage Questions"
                    >
                      <FiList className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(exam)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors"
                      title="Edit Exam"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                      title="Delete Exam"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCopy(exam)}
                      className="text-teal-600 hover:text-teal-900 p-1.5 rounded-md hover:bg-teal-50"
                      title="Copy Exam Set"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {examSets.map((exam) => (
          <div key={exam.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-medium text-gray-900">{exam.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDate(exam.created_at)}</p>
              </div>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                exam.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {exam.type === 'online' ? 'Online Exam' : 'Center Exam'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-gray-500">Class:</span>
                <span className="ml-1 text-gray-900 font-medium">{exam.class_category?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Subject:</span>
                <span className="ml-1 text-gray-900 font-medium">{exam.subject?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Questions:</span>
                <span className="ml-1 text-gray-900 font-medium">{exam.questions.length}</span>
              </div>
              <div className={exam.is_published ? 'text-green-600' : 'text-amber-600'}>
                {exam.is_published ? (
                  <><FiCheck className="inline mr-1 h-3 w-3" /> Published</>
                ) : (
                  <><FiLock className="inline mr-1 h-3 w-3" /> Draft</>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
              <Link
                to={`/manage-exam/questions`}
                state={{ exam }}
                className="flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <FiList className="w-3 h-3 mr-1" />
                Questions
              </Link>
              <button
                onClick={() => onEdit(exam)}
                className="flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <FiEdit2 className="w-3 h-3 mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(exam.id)}
                className="flex items-center justify-center bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <FiTrash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
              <button
                onClick={() => onCopy(exam)}
                className="flex items-center justify-center bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <FiCopy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamSetsTable;