import { useState } from "react";

const ExamSetForm = ({ onCreate, onCancel }) => {
    const [examData, setExamData] = useState({
      title: '',
      level: 'Easy',
      classCategory: 'Class 9',
      subject: '',
      language: 'english',
      totalTime: 60,
    });
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onCreate(examData);
      setExamData({
        title: '',
        level: 'Easy',
        classCategory: 'Class 9',
        subject: '',
        language: 'english',
        totalTime: 60,
      });
    };
  
    return (
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-6">Create New Exam Set</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
            <input
              type="text"
              value={examData.title}
              onChange={(e) => setExamData({...examData, title: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Category</label>
            <select
              value={examData.classCategory}
              onChange={(e) => setExamData({...examData, classCategory: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={examData.level}
              onChange={(e) => setExamData({...examData, level: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              {['Easy', 'Medium', 'Hard'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={examData.subject}
              onChange={(e) => setExamData({...examData, subject: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Subject</option>
              {subjects?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Time (minutes)</label>
            <input
              type="number"
              value={examData.totalTime}
              onChange={(e) => setExamData({...examData, totalTime: e.target.value})}
              className="w-full p-2 border rounded-md"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={examData.language}
              onChange={(e) => setExamData({...examData, language: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Exam Set
          </button>
        </div>
      </form>
    );
  };

export default ExamSetForm;