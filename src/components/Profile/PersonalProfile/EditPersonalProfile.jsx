import React, { useEffect } from "react";
import BasicInformation from "./BasicInformation";
import AddressProfileCard from "./AddressProfileCard";
import { useDispatch, useSelector } from "react-redux";
import { getBasic } from "../../../features/personalProfileSlice";

const EditPersonalProfile = () => {


  return (
    <div className="flex h-screen bg-white">
      <div className="flex flex-col md:p-6 w-full py-4 px-3 md:px-5">
        <BasicInformation />
        <AddressProfileCard />
      </div>
    </div>
  );
};

export default EditPersonalProfile;
