import React from "react";
import { FaFilePdf, FaHandsHelping, FaShieldAlt, FaClipboardList, FaCheckCircle } from "react-icons/fa"; // You can use other icons based on your needs

const FeaturesSection = () => {
  return (
    <section className="bg-white py-12 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Everything you need to create and conduct comprehensive exams
        </h2>
        <p className="text-gray-600 mb-12">
          We simplify all the moving pieces so you can administer your exams
          securely and with confidence without technical complexity.
        </p>

        <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-8">
          <div className=" flex justify-center">
            <div className="feature-item flex flex-col items-center p-6">
              <FaFilePdf className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Create an exam in minutes</h3>
              <p className="text-gray-600 text-center">
                by uploading an existing exam as PDF
              </p>
            </div>

            <div className="feature-item flex flex-col items-center p-6">
              <FaHandsHelping className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Empower every Teacher</h3>
              <p className="text-gray-600 text-center">
                by customizing exams to each teacher's individual needs
              </p>
            </div>

            <div className="feature-item flex flex-col items-center p-6">
              <FaShieldAlt className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Prevent cheating</h3>
              <p className="text-gray-600 text-center">
                with our secure browser lockdown mode
              </p>
            </div>
          </div>

          <div className="flex mt-10 w-full ">
            <div className="feature-item w-3/6 flex flex-col items-center">
              <FaClipboardList className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Collect the exams your way</h3>
              <p className="text-gray-600 text-center">
                Stand alone or through an LMS. Online or offline. With or without
                handwritten attachments.
              </p>
            </div>

            <div className="feature-item w-3/6 flex flex-col items-center">
              <FaCheckCircle className="text-4xl text-teal-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Auto-mark your exams</h3>
              <p className="text-gray-600 text-center">
                based on the rules you’ve set up or choose to mark manually
              </p>
            </div>


          </div>

        </div>

        <div className="flex justify-center gap-6">
          <button className="px-8 py-3 text-white  bg-teal-600">
            Discover more features
          </button>
          <button className="px-8 py-3 text-teal-500 border-2 border-teal-500 rounded-lg hover:bg-teal-100">
            See video
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
