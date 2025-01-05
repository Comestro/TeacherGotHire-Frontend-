import React, { useState, useEffect } from 'react';

const TeacherRecruiter = () => {
  const teachers = [
    { id: 1, name: 'John Doe', subject: 'Mathematics', experience: '5 years' },
    { id: 2, name: 'Jane Smith', subject: 'Science', experience: '3 years' },
    { id: 3, name: 'Mark Johnson', subject: 'History', experience: '7 years' },
    { id: 4, name: 'Emma Brown', subject: 'English', experience: '4 years' },
    { id: 5, name: 'Liam White', subject: 'Mathematics', experience: '2 years' },
    { id: 6, name: 'Olivia Taylor', subject: 'Art', experience: '6 years' },
    { id: 7, name: 'Noah Harris', subject: 'Science', experience: '1 year' },
    { id: 8, name: 'Sophia Clark', subject: 'Mathematics', experience: '10 years' },
    { id: 9, name: 'Lucas Allen', subject: 'Physical Education', experience: '8 years' },
    { id: 10, name: 'Mia Walker', subject: 'Geography', experience: '4 years' },
  ];

  const [dropdownStates, setDropdownStates] = useState({
    subjectDropdown: false,
    experienceDropdown: false,
  });

  const [filters, setFilters] = useState({
    subject: '',
    experience: '',
  });

  const [filteredTeachers, setFilteredTeachers] = useState(teachers);

  // Toggle Dropdowns
  const toggleDropdown = (dropdown) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({ subject: '', experience: '' });
    setFilteredTeachers(teachers); // Reset to all teachers
  };

  // Filter Teachers based on selected filters
  useEffect(() => {
    let result = teachers;

    if (filters.subject) {
      result = result.filter((teacher) =>
        teacher.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.experience) {
      result = result.filter((teacher) =>
        teacher.experience.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }

    setFilteredTeachers(result);
  }, [filters]);

  return (
    <div className="flex w-full">
      {/* Sidebar with Dropdowns */}
      <div className="w-full lg:w-4/12 p-6 rounded-xl ">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Teachers</h3>

        {/* Subject Filter Dropdown */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-lg shadow-md hover:bg-blue-50"
            onClick={() => toggleDropdown('subjectDropdown')}
          >
            <span className="text-gray-800 font-medium">Subject</span>
            <span
              className={`${
                dropdownStates.subjectDropdown ? 'rotate-180' : 'rotate-0'
              } transform transition-all`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          {dropdownStates.subjectDropdown && (
            <div className="mt-3">
              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by subject"
              />
            </div>
          )}
        </div>

        {/* Experience Filter Dropdown */}
        <div className='min-height'>
          <div
            className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-lg shadow-md hover:bg-teal-50"
            onClick={() => toggleDropdown('experienceDropdown')}
          >
            <span className="text-gray-800 font-medium">Experience</span>
            <span
              className={`${
                dropdownStates.experienceDropdown ? 'rotate-180' : 'rotate-0'
              } transform transition-all`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          {dropdownStates.experienceDropdown && (
            <div className="mt-3">
              <input
                type="text"
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Filter by experience"
              />
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <div className="mt-6 text-center">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Clear Teacher
          </button>
        </div>
      </div>

      <div className='flex-1'>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex flex-col items-center mb-4">
                <h4 className="text-2xl font-semibold text-gray-800">
                  {teacher.name}
                </h4>
                <p className="text-gray-600 text-sm">{teacher.subject}</p>
                <p className="text-gray-600 text-sm">{teacher.experience}</p>
              </div>
              <button className="mt-auto w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                View Profile
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">
            No teachers found
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TeacherRecruiter;
