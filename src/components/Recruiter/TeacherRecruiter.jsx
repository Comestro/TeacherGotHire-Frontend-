import React, { useState } from "react";

const TeacherRecruiter = () => {
  const teachers = [
    { id: 1, name: 'Saurav Itachi', subject: 'Math', experience: '1 years' },
    { id: 2, name: 'Roni Saha', subject: 'Science', experience: '3 years' },
    { id: 3, name: 'Archana kumari', subject: 'English', experience: '4 years' },
    { id: 4, name: 'Rahul Kumar', subject: 'History', experience: '1 years' },
  ];

  const [dropdownStates, setDropdownStates] = useState({
    subjectDropdown: false,
    experienceDropdown: false,
  });

  const [filters, setFilters] = useState({
    subject: '',
    experience: '',
  });

  const toggleDropdown = (dropdown) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [dropdown]: !prevState[dropdown],
    }));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (filters.subject === '' || teacher.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
      (filters.experience === '' || teacher.experience.toLowerCase().includes(filters.experience.toLowerCase()))
    );
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({ subject: '', experience: '' });
  };

  return (
    <div className="flex w-full p-4 gap-4">
      {/* Sidebar with Dropdowns */}
      <div className="w-full lg:w-4/12 h-[390px] border shadow-sm">
        <h3 className="text-2xl font-semibold mb-6 p-2 text-gray-800">Teachers</h3>

        {/* Subject Filter Dropdown */}
        <div className="mb-3">
          <div
            className="flex justify-between border-t border-b items-center cursor-pointer p-3 bg-white shadow-sm "
            onClick={() => toggleDropdown('subjectDropdown')}
          >
            <span className="text-gray-800 font-medium">Subject</span>
            <span className={`${dropdownStates.subjectDropdown ? 'rotate-180' : 'rotate-0'} transform transition-all`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {dropdownStates.subjectDropdown && (
            <div className="mt-2">
              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500"
                placeholder="Filter by subject"
              />
            </div>
          )}
        </div>

        {/* Experience Filter Dropdown */}
        <div>
          <div
            className="flex justify-between items-center border-t border-b cursor-pointer p-3 bg-white shadow-sm"
            onClick={() => toggleDropdown('experienceDropdown')}
          >
            <span className="text-gray-800 font-medium">Experience</span>
            <span className={`${dropdownStates.experienceDropdown ? 'rotate-180' : 'rotate-0'} transform transition-all`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {dropdownStates.experienceDropdown && (
            <div className="mt-2">
              <input
                type="text"
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                className="w-full p-3 border border-gray-300  shadow-sm focus:ring-2 focus:ring-teal-500"
                placeholder="Filter by experience"
              />
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={clearFilters}
            className="text-sm text-teal-500 border px-4 py-2 border-teal-300 hover:text-teal-700"
          >
            Clear Teachers
          </button>
        </div>
      </div>

      <div className="w-full">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white p-6 shadow-sm border hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex flex-col mb-4">
                <h4 className="text-2xl font-semibold text-gray-800">{teacher.name}</h4>
                <p className="text-gray-600 text-sm">{teacher.subject}</p>
                <p className="text-gray-600 text-sm">{teacher.experience}</p>
              </div>
              <button className="mt-auto w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition duration-200">
                View Profile
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">No teachers found</div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TeacherRecruiter;
