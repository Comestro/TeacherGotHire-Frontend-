import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Mathematics",
      category: "Academic",
      gradeLevels: ["9th", "10th"],
      dateAdded: "2024-01-15",
      description: "Core mathematics curriculum"
    },
    {
      id: 2,
      name: "Physics",
      category: "Academic",
      gradeLevels: ["11th", "12th"],
      dateAdded: "2024-01-14",
      description: "Advanced physics studies"
    },
    {
      id: 3,
      name: "Art & Craft",
      category: "Extracurricular",
      gradeLevels: ["All"],
      dateAdded: "2024-01-13",
      description: "Creative arts and crafts"
    }
  ]);

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const handleEdit = (subject) => {
    setCurrentSubject(subject);
    setIsEditModalOpen(true);
  };

  const handleDelete = (subject) => {
    setCurrentSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    setSubjects(subjects.filter(subject => !selectedSubjects.includes(subject.id)));
    setSelectedSubjects([]);
  };

  const EditModal = () => (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${isEditModalOpen ? "" : "hidden"}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium">Edit Subject</h3>
          <form className="mt-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Subject Name</label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                value={currentSubject?.name || ""}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                value={currentSubject?.description || ""}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="mr-2 px-4 py-2 text-gray-500 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${isDeleteModalOpen ? "" : "hidden"}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium">Confirm Delete</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-gray-500">Are you sure you want to delete this subject? This action cannot be undone.</p>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="mr-2 px-4 py-2 text-gray-500 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setSubjects(subjects.filter(s => s.id !== currentSubject.id));
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
        <button
          onClick={() => {
            setCurrentSubject(null);
            setIsEditModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FiPlus className="mr-2" /> Add Subject
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="All">All Grades</option>
            <option value="9th">9th Grade</option>
            <option value="10th">10th Grade</option>
            <option value="11th">11th Grade</option>
            <option value="12th">12th Grade</option>
          </select>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Extracurricular">Extracurricular</option>
          </select>
        </div>

        {selectedSubjects.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete Selected ({selectedSubjects.length})
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedSubjects(
                        e.target.checked ? subjects.map((s) => s.id) : []
                      )
                    }
                  />
                </th>
                <th className="px-4 py-2 text-left">Subject Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Grade Levels</th>
                <th className="px-4 py-2 text-left">Date Added</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={(e) =>
                        setSelectedSubjects(
                          e.target.checked
                            ? [...selectedSubjects, subject.id]
                            : selectedSubjects.filter((id) => id !== subject.id)
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">{subject.name}</td>
                  <td className="px-4 py-2">{subject.category}</td>
                  <td className="px-4 py-2">{subject.gradeLevels.join(", ")}</td>
                  <td className="px-4 py-2">{subject.dateAdded}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="mr-2 text-blue-500 hover:text-blue-700"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(subject)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditModal />
      <DeleteConfirmationModal />
    </div>
  );
};

export default ManageSubjects;
