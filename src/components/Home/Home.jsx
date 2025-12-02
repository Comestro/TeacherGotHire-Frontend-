import React from "react";
import { useNavigate } from "react-router-dom";
import TeacherSection from "../HomePage/TeacherSection";
import SchoolSection from "../HomePage/SchoolSection";
import FeaturesSection from "../HomePage/FeaturesSection";
import ExamSection from "../HomePage/ExamSection";
import DetailSection from "../HomePage/DetailSection";
import { Helmet } from "react-helmet-async";
import HeroSection from "./components/HeroSection";

const Home = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <>
      <Helmet>
        <title>Home | PTPI</title>
      </Helmet>
      <div className="space-y-20 pb-20">
        <HeroSection />
        <TeacherSection onSelectRole={handleRoleSelection} />
        <SchoolSection onSelectRole={handleRoleSelection} />
        <ExamSection />
        <FeaturesSection />
        <DetailSection />
      </div>
    </>
  );
};

export default Home;
