import React from "react";
import Navbar from "../Navbar/Navbar";
import Input from "../Input";
import Button from "../Button";
import { IoSearchOutline } from "react-icons/io5";
import Footer from "../Footer/Footer";
import RoleSelection from "../RoleSelection";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div>
      <nav>
        <Navbar
          links={[
            {id:'1', label: "SignIn", to: "/login" },
            {id:'2', label: "Contact US", to: "/contact" },
            {id:"3", label: "AboutUs", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>
      <div className="hero h-screen w-full flex items-center justify-center">
        <div className="flex flex-col w-[65%] text-gray-800 mb-10 ">
          <p className="mb-8 font-bold text-6xl leading-none">
            PTPI – Connect with top teachers and great teaching jobs.
          </p>
          <div className=" relative">
            <Input
              placeholder="Please enter subject and location"
              className="p-4 rounded-xl w-full shadow-xl border-2 pl-10 "
            />
            <IoSearchOutline className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="mt-4 flex gap-4">
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl opacity-3"
            >
              Math
            </Button>
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
          </div>
        </div>
      </div>
      <RoleSelection onSelectRole={handleRoleSelection} />
      <Footer />
    </div>
  );
}

export default Home;
