import React, { useEffect } from "react";
import BasicInformation from "./BasicInformation";
import AddressProfileCard from "./AddressProfileCard";
import { useDispatch, useSelector } from "react-redux";
import { getBasic } from "../../../features/personalProfileSlice";

const EditPersonalProfile = () => {


  return (
    <div className="flex">
      <div className="flex flex-col w-full">
        <BasicInformation />
        <AddressProfileCard />
      </div>
    </div>
  );
};

export default EditPersonalProfile;
