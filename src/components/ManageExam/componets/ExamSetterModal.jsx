import React, { useState, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { createExam, updateExam } from '../../../services/adminManageExam';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExamSetterModal = ({ 
  isOpen, 
  onClose, 
  editingExam, 
  formData, 
  onInputChange,
  level,
  classCategories,
  onExamCreated,
  onExamUpdated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get filtered subjects based on selected class category
  const filteredSubjects = useMemo(() => {
    if (!formData.class_category) return [];
    const selectedCategory = classCategories.find(
      cat => cat.id === parseInt(formData.class_category)
    );
    return selectedCategory?.subjects || [];
  }, [formData.class_category, classCategories]);

  // Reset subject when class category changes
  const handleClassCategoryChange = (e) => {
    onInputChange(e);
    // Reset subject when class category changes
    onInputChange({
      target: {
        name: 'subject',
        value: ''
      }
    });
  };

  // Handle level change to update type accordingly
  const handleLevelChange = (e) => {
    const selectedLevelId = parseInt(e.target.value);
    onInputChange(e);

    // Reset type based on selected level
    if (selectedLevelId === 2) { // Level - 2 (From Home)
      onInputChange({
        target: {
          name: 'type',
          value: 'online'
        }
      });
    } else if (selectedLevelId === 3) { // Level - 2 (From Exam Centre)
      onInputChange({
        target: {
          name: 'type',
          value: 'offline'
        }
      });
    }
  };

  // Determine if type selection should be disabled and what options to show
  const getTypeOptions = () => {
    const selectedLevelId = parseInt(formData.level);
    
    if (selectedLevelId === 2) { // Level - 2 (From Home)
      return [{ value: 'online', label: 'Online' }];
    } else if (selectedLevelId === 3) { // Level - 2 (From Exam Centre)
      return [{ value: 'offline', label: 'Offline' }];
    }
    return [
      { value: 'online', label: 'Online' },
      { value: 'offline', label: 'Offline' }
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        description: formData.description,
        subject: parseInt(formData.subject),
        level: parseInt(formData.level),
        class_category: parseInt(formData.class_category),
        type: formData.type,
        total_marks: parseInt(formData.total_marks),
        duration: parseInt(formData.duration)
      };

      if (editingExam) {
        const updatedExam = await updateExam(editingExam.id, payload);
        onExamUpdated(updatedExam);
      } else {
        const newExam = await createExam(payload);
        onExamCreated(newExam);
      }

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save exam set');
      console.error('API Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingExam ? 'Edit Exam Set' : 'Create New Exam Set'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
                required
                placeholder="Enter exam description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Category Selection - Moved before Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Category
                </label>
                <select
                  name="class_category"
                  value={formData.class_category}
                  onChange={handleClassCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Class Category</option>
                  {classCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection - Now shows filtered subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  disabled={!formData.class_category} // Disable if no class category selected
                >
                  <option value="">
                    {formData.class_category 
                      ? 'Select Subject' 
                      : 'Please select a class category first'}
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level and Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleLevelChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Level</option>
                  {level.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Updated Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={onInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    parseInt(formData.level) === 2 || parseInt(formData.level) === 3 
                      ? 'bg-gray-100' 
                      : ''
                  }`}
                  required
                  disabled={parseInt(formData.level) === 2 || parseInt(formData.level) === 3}
                >
                  {getTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {(parseInt(formData.level) === 2 || parseInt(formData.level) === 3) && (
                  <p className="mt-1 text-sm text-gray-500 italic">
                    Type is automatically set based on selected level
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marks and Duration Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  min="1"
                  placeholder="Enter total marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  min="1"
                  placeholder="Enter duration in minutes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  editingExam ? 'Update Exam Set' : 'Create Exam Set'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamSetterModal;