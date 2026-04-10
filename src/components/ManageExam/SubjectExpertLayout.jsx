import React from "react";
import UniversalHeader from "../commons/UniversalHeader";
import { Outlet } from "react-router-dom";

const SubjectExpertLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <UniversalHeader />
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default SubjectExpertLayout;
