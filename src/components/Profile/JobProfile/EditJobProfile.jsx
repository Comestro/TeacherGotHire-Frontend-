
import React from "react";
import EducationProfileCard from "./Education";

const EditJobProfile = () => {
  return (
    <>
      <div>
          <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
          <EducationProfileCard/> {/* Render nested routes here */}
      </div>
    </>
  );
};

export default EditJobProfile;
