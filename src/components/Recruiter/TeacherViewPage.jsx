import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from './components/Loader';
import { useDispatch } from 'react-redux';
import { getTeacher } from '../../services/teacherService';
import { fetchSingleTeacherById } from '../../services/apiService';

const TeacherViewPage = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('qualifications');

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        console.log("teacher id", id)
        const data = await fetchSingleTeacherById(id);
        console.log("single teacher data ....", data)
        setTeacher(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadTeacher();
  }, [id]);

  if (loading) return <div className="w-full h-screen flex justify-center items-center"><Loader /></div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!teacher) return <div className="p-4">Teacher not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/recruiter" className="mb-6 inline-block text-blue-600 hover:text-blue-800">
        ← Back to Teachers List
      </Link>

      {/* First Row - Basic Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Profile Picture */}
          <div className="flex-shrink-0">
            <img
              src={teacher.profiles?.profile_picture || "/images/profile.jpg"}
              alt={teacher.Fname}
              className="w-48 h-48 rounded-full object-cover border-4 border-teal-500"
            />
          </div>

          {/* Right Column - Basic Info */}
          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {teacher.Fname} {teacher.Lname}
              </h1>
              <p className="text-gray-600 mt-2">{teacher.email}</p>
              <p className="text-gray-600">{teacher.phone}</p>
            </div>

            <div className="border-t pt-4">
              <h2 className="font-semibold text-gray-700 mb-2">Contact Information</h2>
              <p className="text-gray-600">
                <span className="font-medium">Address: </span>
                {teacher.teachersaddress.map(address => (
                  `${address.area}, ${address.district}, ${address.state} - ${address.pincode}`
                )).join(' | ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Tabs */}
      <div className="bg-white rounded-lg shadow">
        {/* Tab Headers */}
        <div className="flex border-b">
          <button
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'qualifications'
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('qualifications')}
          >
            Qualifications & Experience
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'skills'
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'preferences'
                ? 'border-b-2 border-teal-500 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Teaching Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'qualifications' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-teal-600">Qualifications</h2>
                {teacher.teacherqualifications.map((qualification) => (
                  <div key={qualification.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{qualification.qualification.name}</h3>
                    <p className="text-gray-600">{qualification.institution}</p>
                    <p className="text-sm text-gray-500">
                      {qualification.year_of_passing} | {qualification.board}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-teal-600">Experience</h2>
                {teacher.teacherexperiences.map((experience) => (
                  <div key={experience.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{experience.achievements}</h3>
                    <p className="text-gray-600">{experience.company}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(experience.start_date).toLocaleDateString()} -{' '}
                      {experience.end_date
                        ? new Date(experience.end_date).toLocaleDateString()
                        : 'Present'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-teal-600">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {teacher.teacherskill.map((skill) => (
                  <span
                    key={skill.skill.id}
                    className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-teal-600">Teaching Preferences</h2>
              {teacher.preferences.map((preference) => (
                <div key={preference.id} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Preferred Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {preference.prefered_subject.map((subject) => (
                        <span
                          key={subject.id}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          {subject.subject_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Class Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {preference.class_category.map((category) => (
                        <span
                          key={category.id}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherViewPage;