import React, { useState, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { createExam, updateExam } from "../../../services/adminManageExam";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExamSetterModal = ({
  isOpen,
  onClose,
  editingExam,
  isCopying, // Add new prop to indicate if we're copying an exam set
  formData,
  onInputChange,
  level,
  classCategories,
  onExamCreated,
  onExamUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredSubjects = useMemo(() => {
    if (!formData.class_category) return [];
    const selectedCategory = classCategories.find(
      (cat) => cat.id === parseInt(formData.class_category)
    );
    return selectedCategory?.subjects || [];
  }, [formData.class_category, classCategories]);
  const handleClassCategoryChange = (e) => {
    onInputChange(e);
    onInputChange({
      target: {
        name: "subject",
        value: "",
      },
    });
  };
  const handleLevelChange = (e) => {
    const selectedLevelId = parseInt(e.target.value);
    onInputChange(e);
    if (selectedLevelId === 2) {
      // Level - 2 (From Home)
      onInputChange({
        target: {
          name: "type",
          value: "online",
        },
      });
    } else if (selectedLevelId === 3) {
      // Level - 2 (From Exam Centre)
      onInputChange({
        target: {
          name: "type",
          value: "offline",
        },
      });
    }
  };
  const getTypeOptions = () => {
    const selectedLevelId = parseInt(formData.level);

    if (selectedLevelId === 2) {
      // Level - 2 (From Home)
      return [{ value: "online", label: "Online" }];
    } else if (selectedLevelId === 3) {
      // Level - 2 (From Exam Centre)
      return [{ value: "offline", label: "Offline" }];
    }
    return [
      { value: "online", label: "Online" },
      { value: "offline", label: "Offline" },
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        set_name: formData.set_name, // Add set_name to the payload
        description: formData.description,
        subject: parseInt(formData.subject),
        level: parseInt(formData.level),
        class_category: parseInt(formData.class_category),
        type: formData.type,
        total_marks: parseInt(formData.total_marks),
        duration: parseInt(formData.duration),
        total_questions: parseInt(formData.total_questions || 0), // Add total_questions to payload
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
      toast.error(error.message || "Failed to save exam set");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {editingExam && !isCopying
              ? "Edit Exam Set"
              : "Create New Exam Set"}
            {isCopying && (
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-teal-100">
                Copying
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Exam Set Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="set_name"
                value={formData.set_name || ""}
                onChange={onInputChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
                placeholder="e.g. Mathematics - Term 1"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                rows="2"
                required
                placeholder="Brief description of the exam set..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Class Category
                </label>
                <select
                  name="class_category"
                  value={formData.class_category}
                  onChange={handleClassCategoryChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  required
                >
                  <option value="">Select Class</option>
                  {classCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={onInputChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  required
                  disabled={!formData.class_category}
                >
                  <option value="">
                    {formData.class_category
                      ? "Select Subject"
                      : "Select class first"}
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleLevelChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
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

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={onInputChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                  min="1"
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={onInputChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                  min="1"
                  placeholder="e.g. 60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  name="total_questions"
                  value={formData.total_questions || ""}
                  onChange={onInputChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  min="1"
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : isCopying ? (
                  "Create Copy"
                ) : editingExam ? (
                  "Update Exam Set"
                ) : (
                  "Create Exam Set"
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
