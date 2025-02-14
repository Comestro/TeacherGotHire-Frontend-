import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from './components/Loader';
import { fetchTeacherById } from '../../services/teacherService';

const TeacherViewPage = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        console.log("teacher id", id)
        const data = await fetchTeacherById(id);
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

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
        <Link to="/recruiter" className="block mt-4 text-blue-600">
          ← Back to Teachers List
        </Link>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-4">
        Teacher not found
        <Link to="/teachers" className="block mt-4 text-blue-600">
          ← Back to Teachers List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        to="/recruiter"
        className="mb-6 inline-block text-blue-600 hover:text-blue-800"
      >
        ← Back to Teachers List
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Teacher Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <img
            src={teacher.profiles?.profile_picture || "https://via.placeholder.com/150"}
            alt={teacher.Fname}
            className="w-32 h-32 rounded-full object-cover border-4 border-teal-500"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {teacher.Fname} {teacher.Lname}
            </h1>
            <p className="text-gray-600 mt-2">{teacher.email}</p>
            <p className="text-gray-600">{teacher.phone}</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Qualifications */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">Qualifications</h2>
            {teacher.teacherqualifications.map((qualification) => (
              <div key={qualification.id} className="mb-4">
                <h3 className="font-semibold text-gray-800">{qualification.qualification.name}</h3>
                <p className="text-gray-600">{qualification.institution}</p>
                <p className="text-sm text-gray-500">
                  {qualification.year_of_passing} | {qualification.board}
                </p>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">Experience</h2>
            {teacher.teacherexperiences.map((experience) => (
              <div key={experience.id} className="mb-4">
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

          {/* Skills */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.teacherskill.map((skill) => (
                <span
                  key={skill.skill.id}
                  className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill.skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">Contact Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Address:</span>{' '}
                {teacher.teachersaddress.map(address => (
                  `${address.area}, ${address.district}, ${address.state} - ${address.pincode}`
                )).join(' | ')}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {teacher.phone}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {teacher.email}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">Teaching Preferences</h2>
          {teacher.preferences.map((preference) => (
            <div key={preference.id} className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Preferred Subjects</h3>
                <div className="flex flex-wrap gap-2 mt-2">
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
                <h3 className="font-semibold text-lg">Class Categories</h3>
                <div className="flex flex-wrap gap-2 mt-2">
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
      </div>
    </div>
  );
};

export default TeacherViewPage;