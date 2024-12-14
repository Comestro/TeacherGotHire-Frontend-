import React from "react";
import {
    HiBriefcase,
  } from "react-icons/hi";

const JobProfileCard = ({subjects, locations }) => {
  return (
    <div className="w-full max-w-md  bg-white shadow-md rounded-lg border-2 border-teal-500 p-4">
      <h2 className="text-xl font-semibold text-teal-600 mb-2 text-center flex items-center justify-center"><HiBriefcase className="mr-1"/>Job Preference</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium text-teal-600 mb-2">Selected Subjects:</h3>
        <ul className="list-disc list-inside space-y-1">
          {subjects.map((subject, index) => (
            <li key={index} className="text-gray-600">
              {subject}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-teal-600 mb-2">Preferred Locations:</h3>
        <ul className="list-disc list-inside space-y-1">
          {locations.map((location, index) => (
            <li key={index} className="text-gray-600">
              {location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JobProfileCard;
