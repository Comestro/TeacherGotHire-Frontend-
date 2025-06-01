import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const QuestionModal = ({ isOpen, onClose, onSubmit, examId, editingQuestion }) => {
  const initialFormState = {
    text: '',
    options: ['', '', '', ''],
    correct_option: 1,
    exam: examId,
    language: 'English',
    solution: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        text: editingQuestion.text,
        options: editingQuestion.options,
        correct_option: editingQuestion.correct_option,
        exam: editingQuestion.exam,
        language: editingQuestion.language,
        solution: editingQuestion.solution || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingQuestion, examId, isOpen]); // Added isOpen to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.text.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      toast.error('All options are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text*
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language*
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options*
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={formData.correct_option === index + 1}
                    onChange={() => setFormData(prev => ({ ...prev, correct_option: index + 1 }))}
                    className="w-4 h-4 text-teal-600"
                    required
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution (Optional)
            </label>
            <textarea
              value={formData.solution}
              onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              rows="2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {editingQuestion ? 'Updating...' : 'Saving...'}
                </div>
              ) : (
                editingQuestion ? 'Update Question' : 'Add Question'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;