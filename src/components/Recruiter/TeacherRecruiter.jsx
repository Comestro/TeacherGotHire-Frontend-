import React, { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsBriefcase, BsGeoAlt } from "react-icons/bs";
import { MdSchool } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";

const TeacherFilter = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data, status, error } = useSelector((state) => state.teachers);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        setTeachers(data);
      }, 1000);
      setLoading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center mt-16 ">
        <div className="h-fit mt-20">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 rounded shadow relative">
      {teachers?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all duration-300 group"
            >
              {/* Teacher Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={
                      teacher.profiles?.profile_picture ||
                      "/images/profile.jpg"
                    }
                    alt={teacher.Fname}
                    className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div className="absolute -bottom-2 right-0 bg-teal-500 text-white px-2 py-1 rounded-full text-xs">
                    {teacher.teacherexperiences.length}+ Exp
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {teacher.Fname} {teacher.Lname}
                  </h3>
                  <p className="text-gray-500 text-sm">{teacher.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <BsGeoAlt className="text-gray-400 text-sm" />
                    <span className="text-xs text-gray-600">
                      {teacher.teachersaddress[0]?.district ||
                        "Location not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <MdSchool className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Highest Qualification
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {teacher.teacherqualifications[0]?.qualification.name ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <BsBriefcase className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium text-gray-700">
                      {teacher.teacherexperiences.length} Positions
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Showcase */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Top Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.teacherskill.slice(0, 4).map((skill) => (
                    <span
                      key={skill.skill.id}
                      className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full"
                    >
                      {skill.skill.name}
                    </span>
                  ))}
                  {teacher.teacherskill.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{teacher.teacherskill.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Preferences Preview */}
              <div className="mb-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Prefers Teaching
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.preferences[0]?.class_category
                    .slice(0, 2)
                    .map((category) => (
                      <span
                        key={category.id}
                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  {teacher.preferences[0]?.prefered_subject
                    .slice(0, 2)
                    .map((subject) => (
                      <span
                        key={subject.id}
                        className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                      >
                        {subject.subject_name}
                      </span>
                    ))}
                </div>
              </div>

              {/* View Details Button */}
              <Link
                to={`teacher/${teacher.id}`}
                className="w-full flex items-center justify-center gap-2 mt-4 text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                View Full Profile
                <FiArrowRight className="inline-block" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">
          No teachers found matching your criteria
        </p>
      )}
    </div>
  );
};

export default TeacherFilter;
