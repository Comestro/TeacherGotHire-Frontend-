import React, { useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";

const ResumeUpload = () => {
  const [resume, setResume] = useState({
    fileName: "",
    uploadedOn: "",
  });

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume({
        fileName: file.name,
        uploadedOn: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    }
  };

  const handleDeleteResume = () => {
    setResume({
      fileName: "",
      uploadedOn: "",
    });
  };

  return (
    <div className="bg-white border-0 rounded-3xl p-5 shadow-md max-w-4xl mx-auto">
      <h3 className="text-lg  font-bold text-gray-600 mb-3">Resume</h3>

      {resume.fileName ? (
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-sm font-medium text-gray-900">{resume.fileName}</p>
            <p className="text-xs text-gray-500">Uploaded on {resume.uploadedOn}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert("Download feature to be implemented!")}
              className="text-blue-500 hover:text-blue-700 transition-all"
              title="Download"
            >
              <i className="fa fa-download" aria-hidden="true"></i>
            </button>
            <button 
              onClick={handleDeleteResume}
              className=" hover:text-teal-700 transition-all text-teal-500 w-8 items-center flex justify-center h-8 border bg-gray-300  rounded-full"
              title="Delete"
            > <MdOutlineDeleteForever className="" />
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="">
          <p className="text-sm text-gray-500 mb-3">No resume uploaded yet.</p>
        </div>
      )}
      <div className="border border-dashed border-gray-400 rounded-md p-5 bg-gray-50 text-center mb-5">

        <label className="block text-center text-blue-500 font-semibold cursor-pointer ">
          <input
            type="file"
            accept=".doc,.docx,.rtf,.pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
          
<span className="text-gray-500 text-sm ">Already have a resume?</span> Upload resume
        </label>
        <p className="text-xs text-gray-400 text-center mt-2">
          Supported Formats: doc, docx, rtf, pdf, up to 2 MB
        </p>
      </div>
    </div>
  );
};

export default ResumeUpload;
