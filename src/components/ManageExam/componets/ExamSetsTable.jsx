import React from "react";
import {
  FiEdit2,
  FiTrash2,
  FiList,
  FiCopy,
  FiCheck,
  FiLock,
  FiClock,
  FiAward,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const ExamSetsTable = ({
  examSets,
  onEdit,
  onCopy,
  onDelete,
  refreshTrigger,
}) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const groupedExams = examSets.reduce((acc, exam) => {
    const className =
      typeof exam.class_category === "string"
        ? exam.class_category
        : exam.class_category?.name || "Unknown Class";
    const subjectName =
      typeof exam.subject === "string"
        ? exam.subject
        : exam.subject?.subject_name || "Unknown Subject";
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
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-200">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="divide-y divide-gray-200">
          {groupedExamsArray.map((group, groupIndex) => (
            <div
              key={`${group.className}|${group.subjectName}`}
              className="bg-white"
            >
              {/* Group Header - More compact */}
              <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    {group.className}
                  </h3>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <p className="text-xs font-medium text-teal-600">
                    📚 {group.subjectName}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase">
                  {group.exams.length}{" "}
                  {group.exams.length === 1 ? "Exam" : "Exams"}
                </span>
              </div>

              {/* Table for this group - More compact */}
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Exam Details
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Level
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Marks
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Questions
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-widest"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {group.exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {exam.set_name || "N/A"}
                        </div>
                        <div
                          className="text-[11px] text-gray-500 truncate max-w-[200px]"
                          title={exam.description}
                        >
                          {exam.description}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-700">
                          {typeof exam.level === "string"
                            ? exam.level
                            : exam.level?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded uppercase tracking-tighter ${
                            exam.type === "online"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {exam.type === "online" ? "Home" : "Exam Centre"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                        <div className="flex items-center">
                          <FiClock className="mr-1 h-3 w-3 text-gray-400" />
                          {exam.duration || 0}m
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                        <div className="flex items-center">
                          <FiAward className="mr-1 h-3 w-3 text-gray-400" />
                          {exam.total_marks || 0}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`flex items-center text-xs font-medium ${
                            exam.status ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {exam.status ? (
                            <>
                              <FiCheck className="mr-1 h-3 w-3" /> Published
                            </>
                          ) : (
                            <>
                              <FiLock className="mr-1 h-3 w-3" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 font-medium">
                        <span className="text-gray-900">
                          {exam.count_question
                            ? exam.count_question?.original_questions +
                              exam.count_question?.related_questions
                            : 0}
                        </span>
                        <span className="mx-0.5 text-gray-300">/</span>
                        {exam.total_questions ?? 0}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/manage-exam/questions/${exam.id}`}
                            state={{ exam }}
                            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-all"
                            title="Manage Questions"
                          >
                            <FiList className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => onEdit(exam)}
                            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-all"
                            title="Edit Exam"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onCopy(exam)}
                            className="text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg transition-all"
                            title="Copy Exam Set"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(exam.id)}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                            title="Delete Exam"
                          >
                            <FiTrash2 className="w-4 h-4" />
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

      {/* Mobile Card View - More compact */}
      <div className="md:hidden divide-y divide-gray-100">
        {groupedExamsArray.map((group, groupIndex) => (
          <div
            key={`${group.className}|${group.subjectName}`}
            className="bg-white"
          >
            {/* Mobile Group Header */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {group.className}
                </h3>
                <p className="text-[10px] font-medium text-teal-600 mt-0.5">
                  📚 {group.subjectName}
                </p>
              </div>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase whitespace-nowrap">
                {group.exams.length}
              </span>
            </div>

            {/* Mobile Cards */}
            {group.exams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 hover:bg-gray-50/50 border-b border-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {exam.set_name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(exam.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 inline-flex text-[10px] leading-3 font-bold rounded uppercase tracking-tighter shrink-0 ${
                      exam.type === "online"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}
                  >
                    {exam.type === "online" ? "Home" : "Centre"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2 text-[11px]">
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Level:</span>
                    <span className="font-semibold text-gray-700">
                      {typeof exam.level === "string"
                        ? exam.level
                        : exam.level?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-700">
                      {exam.duration || 0}m
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Marks:</span>
                    <span className="font-semibold text-gray-700">
                      {exam.total_marks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Questions:</span>
                    <span className="font-semibold text-gray-700">
                      {exam.count_question?.original_questions || 0}/
                      {exam.total_questions || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div
                    className={`text-[10px] font-bold uppercase tracking-tight ${
                      exam.status ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {exam.status ? "Published" : "Draft"}
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`/manage-exam/questions/${exam.id}`}
                      state={{ exam }}
                      className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    >
                      Questions
                    </Link>
                    <button
                      onClick={() => onEdit(exam)}
                      className="p-1 px-2.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(exam.id)}
                      className="p-1 px-2.5 bg-red-50 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
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
