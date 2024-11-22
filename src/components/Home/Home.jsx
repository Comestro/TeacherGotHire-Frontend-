import React from "react";
import Navbar from "../Navbar/Navbar";
import Input from "../Input";
import Button from "../Button";
import { IoSearchOutline } from "react-icons/io5";
import Footer from "../Footer/Footer";
import RoleSelection from "../RoleSelection";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import TeacherProfiles from "../Review/TeacherProfile";

function Home() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div
      className="object-center bg-no-repeat"
      // style={{
      //   backgroundImage: `url('https://images.unsplash.com/photo-1509078302641-7553084efc8f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
      // }}
    >
      <nav>
        <Navbar
          links={[
            { id: "1", label: "SignIn", to: "/login" },
            { id: "2", label: "Contact US", to: "/contact" },
            { id: "3", label: "AboutUs", to: "/about" },
          ]}
          variant="dark"
        />
      </nav>
      <div className="hero h-screen w-full flex flex-col items-center justify-center px-4 ">
        <div className="flex justify-center items-center mx-auto flex-col w-full lg:w-[65%] text-gray-800 mb-2">
          <p className="mb-8 font-bold text-4xl md:text-5xl leading-none">
            <span className="font-bold text-5xl md:text-6xl text-teal-600">
              PTPI
            </span>{" "}
            – Connect with top teachers and great teaching jobs.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full lg:w-[65%] px-14">
          <div className="flex items-center rounded-full border-2 p-2 bg-white mr-4">
            <input
              type="text"
              placeholder="What subject do you need help with?"
              className="flex-1 p-2 px-2 border-none focus:outline-none text-gray-600  placeholder-gray-400 placeholder:font-semibold placeholder:px-4"
            />
            <div className="h-6 w-px bg-gray-300 mx-4 hidden sm:block"></div>
            <IoLocationOutline className="text-gray-600 hidden sm:block" />
            <input
              type="text"
              placeholder="Pin code"
              className="hidden sm:block w-20 md:w-28 p-3 border-none focus:outline-none text-gray-600 placeholder-gray-400"
            />
            <button className="bg-teal-700 hover:bg-blue-500 p-2 rounded-full flex items-center justify-center">
              <IoSearchOutline className="text-white w-5 h-5 md:w-7 md:h-7 p-1" />
            </button>
          </div>

          <div className="mt-4 flex flex-nowrap gap-4 justify-center">
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-full"
            >
              Math
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              English
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              Science
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              History
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              Geography
            </Button>
            <Button
              textColor="text-teal-700 font-medium"
              bgcolor="bg-teal-100"
              className="rounded-2xl"
            >
              Music
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 py-8 bg-white -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Item 1 */}
          <div>
            <h2 className="text-4xl font-semibold text-gray-900">16+</h2>
            <p className="mt-2 text-lg text-gray-600">years helping learners</p>
          </div>
          {/* Item 2 */}
          <div>
            <h2 className="text-4xl font-semibold text-gray-900">
              10 million+
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              hours of 1-on-1 instruction
            </p>
          </div>
          {/* Item 3 */}
          <div>
            <h2 className="text-4xl font-semibold text-gray-900">3,000+</h2>
            <p className="mt-2 text-lg text-gray-600">subjects to explore</p>
          </div>
        </div>
      </div>
      <div className="relative bg-teal-600 overflow-hidden mt-10">
        {/* Header */}
        {/* <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <button className="text-xl">
          <span className="font-bold">☰</span>
        </button>
        <button className="text-sm font-medium text-blue-600 bg-blue-100 px-4 py-2 rounded-full shadow-md">
          📞 Call Now (800) 803-4058
        </button>
      </div> */}

        {/* Content */}
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center px-6 sm:px-12 ">
          {/* Left Section */}
          <div className="text-white ml-20">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-loose">
              क्या आप शिक्षक बनना चाहते हैं?
            </h1>
            <p className="text-lg sm:text-xl mb-6 leading-relaxed font-serif ">
              क्या आप अपने शिक्षण करियर को नई दिशा देना चाहते हैं? आज ही आवेदन
              करें और शिक्षा को बदलने के हमारे मिशन का हिस्सा बनें!
            </p>
            <button className="bg-white text-teal-600 font-medium text-lg px-6 py-3 rounded-full shadow-lg hover:bg-gray-100">
              Explore More..
            </button>
          </div>

          {/* Right Section */}
          <div className="relative mt-10 text-center flex items-center justify-center">
            <div className="w-64 h-64 lg:w-96 lg:h-96 mx-auto lg:mx-0">
              <img
                src="https://pngimg.com/d/teacher_PNG84.png"
                alt="Classroom"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      <TeacherProfiles />
      <RoleSelection onSelectRole={handleRoleSelection} />
      <Footer />
    </div>
  );
}

export default Home;
