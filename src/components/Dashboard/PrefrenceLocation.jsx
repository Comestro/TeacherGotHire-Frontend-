import React from "react";
import {
    HiBriefcase,
  } from "react-icons/hi";

const JobProfileCard = ({locations }) => {
  return (
    <div className="bg-white shadow-md rounded-md border border-teal-500 p-4">
      <h2 className="md:text-xl font-semibold text-teal-600 mb-2 text-center flex items-center justify-center"><HiBriefcase className="mr-1"/>Preference Job Location</h2>
      <div>
        <ul className="list-disc list-inside space-y-1">
          {locations?.map((location, index) => (
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