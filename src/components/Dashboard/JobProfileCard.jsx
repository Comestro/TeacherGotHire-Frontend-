import React from "react";
import {
    HiBriefcase,
  } from "react-icons/hi";

const JobProfileCard = ({subjects, locations }) => {
  return (
    <div className=" bg-white shadow-md rounded-md border border-teal-500 p-4">
      <h2 className="md:text-xl font-semibold text-teal-600 mb-2 text-center flex items-center justify-center"><HiBriefcase className="mr-1"/>Preference Job Subject</h2>
      
      <div className="mb-4">
        <ul className="list-disc list-inside space-y-1">
          {subjects?.map((subject, index) => (
            <li key={index} className="text-gray-600">
              {subject}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JobProfileCard;
