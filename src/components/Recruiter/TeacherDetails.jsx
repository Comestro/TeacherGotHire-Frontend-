import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTeachers } from "../../features/teacherFilterSlice";

const TeacherDetail = () => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeacherDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchTeachers({});
                const selectedTeacher = data.find((teacher) => teacher.id === parseInt(id));
                setTeacher(selectedTeacher);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch teacher details. Please try again.");
                setLoading(false);
            }
        };

        fetchTeacherDetails();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center mt-16"><div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div></div>;
    if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

    if (!teacher) return <p className="text-center mt-8 text-lg">No teacher found. Please check the URL.</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 bg-gray-600">
            <div className="flex flex-col items-center justify-between md:flex-row md:space-x-8">
                <div className="flex items-center gap-6">
                <img
                    src={teacher.profiles?.profile_picture || "https://via.placeholder.com/150"}
                    alt={`${teacher.Fname} ${teacher.Lname}`}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md"
                />
                <div className="mt-6 md:mt-0 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-800">{teacher.Fname} {teacher.Lname}</h1>
                    <p className="text-lg text-gray-600 mt-2">{teacher.email}</p>
                </div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Experience:</h4>
                    {teacher.teacherexperiences.length > 0 ? (
                        teacher.teacherexperiences.map((exp, index) => (
                            <div key={index} className="mb-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">{exp.achievements}</span> ({exp.start_date} to {exp.end_date})
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">No experiences shared</p>
                    )}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Class Categories:</h3>
                    <ul className="mt-4 flex flex-wrap space-x-3">
                        {teacher.preferences.length > 0 ? (
                            teacher.preferences.flatMap((pref) =>
                                pref.class_category.map((category) => (
                                    <li key={category.id} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mb-2">
                                        {category.name}
                                    </li>
                                ))
                            )
                        ) : (
                            <p className="text-gray-500">No class categories available</p>
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Preferred Subjects</h3>
                    <ul className="mt-4 flex flex-wrap space-x-3">
                        {teacher.preferences.length > 0 ? (
                            teacher.preferences.flatMap((pref) =>
                                pref.prefered_subject.map((subject) => (
                                    <li key={subject.id} className="bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full mb-2">
                                        {subject.subject_name}
                                    </li>
                                ))
                            )
                        ) : (
                            <p className="text-gray-500">No preferred subjects available</p>
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Job Role</h3>
                    <ul className="mt-4 flex flex-wrap space-x-3">
                        {teacher.preferences.length > 0 ? (
                            teacher.preferences.flatMap((pref) =>
                                pref.job_role.map((role) => (
                                    <li key={role.id} className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full mb-2">
                                        {role.jobrole_name}
                                    </li>
                                ))
                            )
                        ) : (
                            <p className="text-gray-500">No job roles available</p>
                        )}
                    </ul>
                </div>

                {/* Skills Section */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Skills:</h4>
                    {teacher.teacherskill.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {teacher.teacherskill.map((skill) => (
                                <span
                                    key={skill.skill.id}
                                    className="bg-teal-100 text-teal-800 text-sm px-2 py-1 rounded-full"
                                >
                                    {skill.skill.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No skills listed</p>
                    )}
                </div>

                {/* Experience Section */}


                {/* Address Section */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Address:</h4>
                    {teacher.teachersaddress.length > 0 ? (
                        teacher.teachersaddress.map((address) => (
                            <p key={address.id} className="text-sm text-gray-600">
                                {address.area}, {address.district}, {address.state} - {address.pincode}
                            </p>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">No address provided</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDetail;
