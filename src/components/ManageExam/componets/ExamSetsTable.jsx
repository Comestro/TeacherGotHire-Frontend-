import React from 'react';
import { FiEdit2, FiTrash2, FiList, FiCopy, FiCheck, FiLock, FiClock, FiAward } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const ExamSetsTable = ({ examSets, onEdit, onCopy, onDelete, refreshTrigger }) => {
  const navigate = useNavigate();

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  console.log('ExamSetsTable received examSets:', examSets.map(exam => ({ id: exam.id, set_name: exam.set_name, level: exam.level?.name })));

  // Group exams by class category and subject
  const groupedExams = examSets.reduce((acc, exam) => {
    const className = exam.class_category?.name || 'Unknown Class';
    const subjectName = exam.subject?.subject_name || 'Unknown Subject';
    const key = `${className}|${subjectName}`;

    if (!acc[key]) {
      acc[key] = {
        className,
        subjectName,
        exams: [],
      };
    }

    acc[key].exams.push(exam);
    return acc;
  }, {});

  const groupedExamsArray = Object.values(groupedExams);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div>
          {groupedExamsArray.map((group, groupIndex) => (
            <div key={`${group.className}|${group.subjectName}`} className={groupIndex > 0 ? 'border-t border-gray-200' : ''}>
              {/* Group Header */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-3 border-b border-teal-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-teal-900">{group.className}</h3>
                    <p className="text-xs text-teal-700 mt-1">📚 {group.subjectName}</p>
                  </div>
                  <span className="text-xs font-semibold bg-teal-200 text-teal-800 px-3 py-1 rounded-full">
                    {group.exams.length} exam{group.exams.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Table for this group */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
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
                  {group.exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.set_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{exam.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{exam.level?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            exam.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {exam.type === 'online' ? 'Home' : 'Exam Centre'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                          {exam.duration || 0} mins
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiAward className="mr-1.5 h-4 w-4 text-gray-400" />
                          {exam.total_marks || 0} marks
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center text-sm ${exam.status ? 'text-green-600' : 'text-amber-600'}`}>
                          {exam.status ? (
                            <>
                              <FiCheck className="mr-1.5 h-4 w-4" /> Published
                            </>
                          ) : (
                            <>
                              <FiLock className="mr-1.5 h-4 w-4" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exam.questions.length} / {exam.total_questions} questions
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
                            onClick={() => onDelete(exam.id)}
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
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {groupedExamsArray.map((group, groupIndex) => (
          <div key={`${group.className}|${group.subjectName}`} className={groupIndex > 0 ? 'border-t border-gray-200' : ''}>
            {/* Mobile Group Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 border-b border-teal-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-teal-900">{group.className}</h3>
                  <p className="text-xs text-teal-700 mt-1">📚 {group.subjectName}</p>
                </div>
                <span className="text-xs font-semibold bg-teal-200 text-teal-800 px-2 py-1 rounded-full whitespace-nowrap">
                  {group.exams.length}
                </span>
              </div>
            </div>

            {/* Mobile Cards */}
            {group.exams.map((exam) => (
              <div key={exam.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{exam.set_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(exam.created_at)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      exam.type === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {exam.type === 'online' ? 'Home' : 'Exam Centre'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Level:</span>
                    <span className="ml-1 text-gray-900 font-medium">{exam.level?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 text-gray-900 font-medium">{exam.duration || 0} mins</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Marks:</span>
                    <span className="ml-1 text-gray-900 font-medium">{exam.total_marks || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Questions:</span>
                    <span className="ml-1 text-gray-900 font-medium">{exam.questions.length}</span>
                  </div>
                  <div className={exam.status ? 'text-green-600' : 'text-amber-600'}>
                    {exam.status ? (
                      <>
                        <FiCheck className="inline mr-1 h-3 w-3" /> Published
                      </>
                    ) : (
                      <>
                        <FiLock className="inline mr-1 h-3 w-3" /> Draft
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 gap-2">
                  <Link
                    to={`/manage-exam/questions/${exam.id}`}
                    state={{ exam }}
                    className="flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                  >
                    <FiList className="w-3 h-3 mr-1" />
                    Questions
                  </Link>
                  <button
                    onClick={() => onEdit(exam)}
                    className="flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                  >
                    <FiEdit2 className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(exam.id)}
                    className="flex items-center justify-center bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                  >
                    <FiTrash2 className="w-3 h-3 mr-1" />
                    Delete
                  </button>
                  <button
                    onClick={() => onCopy(exam)}
                    className="flex items-center justify-center bg-teal-50 text-teal-700 hover:bg-teal-100 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1"
                  >
                    <FiCopy className="w-3 h-3 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamSetsTable;