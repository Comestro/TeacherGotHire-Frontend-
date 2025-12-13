import React from "react";
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlinePhone } from "react-icons/hi";

const TeacherCard = ({ teacher }) => {
  const {
    Fname,
    Lname,
    email,
    phone_number,
    current_address,
    last_experience,
    last_education,
    profile_picture,
  } = teacher;
  const currentAddress = current_address || {};
  const latestExperience = last_experience;
  const highestQualification = last_education;

  return (
    <div className="bg-white p-5 rounded-lg hover:scale-[1.02] transition-transform duration-300">
      {/* Header Section */}
      <div className="border-b pb-3 mb-4">
        <h2 className="text-xl font-bold text-text">
          {Fname} {Lname}
        </h2>
      </div>

      {/* Key Information */}
      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-start gap-3">
          <HiOutlineMail className="text-accent mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-secondary font-medium uppercase">Email</p>
            <p className="text-sm text-text truncate">{email}</p>
          </div>
        </div>

        {/* Phone */}
        {phone_number && (
          <div className="flex items-start gap-3">
            <HiOutlinePhone className="text-accent mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary font-medium uppercase">Phone</p>
              <p className="text-sm text-text">{phone_number}</p>
            </div>
          </div>
        )}

        {/* Location */}
        {currentAddress.district && (
          <div className="flex items-start gap-3">
            <HiOutlineLocationMarker className="text-accent mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary font-medium uppercase">Location</p>
              <p className="text-sm text-text">
                {currentAddress.district}, {currentAddress.state}
              </p>
            </div>
          </div>
        )}

        {/* Job Role */}
        {latestExperience && (
          <div className="flex items-start gap-3">
            <HiOutlineBriefcase className="text-accent mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary font-medium uppercase">Current Role</p>
              <p className="text-sm text-text font-medium">{latestExperience.role?.jobrole_name || "N/A"}</p>
              <p className="text-xs text-secondary mt-0.5">{latestExperience.institution}</p>
            </div>
          </div>
        )}

        {/* Education */}
        {highestQualification && (
          <div className="flex items-start gap-3">
            <HiOutlineAcademicCap className="text-accent mt-0.5 flex-shrink-0" size={18} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary font-medium uppercase">Education</p>
              <p className="text-sm text-text font-medium">{highestQualification.qualification?.name || "N/A"}</p>
              <p className="text-xs text-secondary mt-0.5">
                {highestQualification.institution} • {highestQualification.year_of_passing}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCard;
