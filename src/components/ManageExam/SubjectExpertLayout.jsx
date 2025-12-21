import React from "react";
import Header from "./componets/Header";
import { Outlet } from "react-router-dom";

const SubjectExpertLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default SubjectExpertLayout;
