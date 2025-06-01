import React, { useEffect, useState } from 'react';
import { fetchLevel } from '../../services/examServices';
import { getExam } from '../../services/adminManageExam';
import { useSelector } from 'react-redux';
import { FiPlus, FiBook, FiFileText } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamSetsTable from './componets/ExamSetsTable';
import ExamSetterModal from './componets/ExamSetterModal';

const ManageExam = () => {
  const [level, setLevel] = useState([]);
  const [examSets, setExamSets] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    subject: '',
    level: '',
    class_category: '',
    total_marks: '',
    duration: '',
    type: 'online'
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const setterUser = useSelector((state) => state.examQues.setterInfo);

  useEffect(() => {
    const getLevels = async () => {
      try {
        const response = await fetchLevel();
        setLevel(response);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchExamSets = async () => {
      try {
        const response = await getExam();
        setExamSets(response);
      } catch (error) {
        toast.error('Failed to fetch exam sets');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    getLevels();
    fetchExamSets();
  }, []);

  // Get class categories and subjects from setterUser
  const classCategories = setterUser?.[0]?.class_category || [];
  const subjects = classCategories.flatMap(cat => cat.subjects || []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const resetForm = () => {
    setFormData({
      description: '',
      subject: '',
      level: '',
      class_category: '',
      total_marks: '',
      duration: '',
      type: 'online'
    });
    setIsModalOpen(false);
    setEditingExam(null);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      description: exam.description,
      subject: exam.subject.id.toString(),
      level: exam.level.id.toString(),
      class_category: exam.class_category.id.toString(),
      total_marks: exam.total_marks,
      duration: exam.duration,
      type: exam.type
    });
    setIsModalOpen(true);
  };

  const handleDelete = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam set?')) {
      setExamSets(prev => prev.filter(exam => exam.id !== examId));
      toast.success('Exam deleted successfully!');
    }
  };

  const handleAddQuestions = (examId) => {
    alert(`Add questions for exam ID: ${examId}`);
  };

  const handleExamCreated = (newExam) => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    toast.success('Exam created successfully!');
  };

  const handleExamUpdated = (updatedExam) => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    toast.success('Exam updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiBook className="w-8 h-8 text-teal-600 mr-3" />
                Manage Exam Sets
              </h1>
              <p className="text-gray-600 mt-2">Create and manage your examination sets</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Exam Set</span>
            </button>
          </div>
        </div>

        {/* Show empty state or exam sets table */}
        {!loading && examSets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Exam Sets Found
              </h2>
              <p className="text-gray-600 mb-8">
                Get started by creating your first exam set. You can add questions after creating an exam set.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 mx-auto transition-all shadow-lg hover:shadow-xl"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create First Exam Set</span>
              </button>
            </div>
          </div>
        ) : (
          <ExamSetsTable 
            examSets={examSets}
            onAddQuestions={handleAddQuestions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Modal */}
        <ExamSetterModal 
          isOpen={isModalOpen}
          onClose={resetForm}
          editingExam={editingExam}
          formData={formData}
          onInputChange={handleInputChange}
          subjects={subjects}
          level={level}
          classCategories={classCategories}
          onExamCreated={handleExamCreated}
          onExamUpdated={handleExamUpdated}
        />
      </div>

      {/* Add loading state */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam sets...</p>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ManageExam;