
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setResume, clearResume } from "../store/profileSlice";

const ResumeUpload = () => {
  const resume = useSelector((state) => state.profile.resume);
  const dispatch = useDispatch();

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(
        setResume({
          fileName: file.name,
          uploadedOn: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })
      );
    }
  };

  const handleDeleteResume = () => {
    dispatch(clearResume());
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-md max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Resume</h3>

      {resume.fileName ? (
        <div className="flex items-center justify-between border border-gray-200 rounded-md p-4 bg-gray-50 mb-5">
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
              className="text-red-500 hover:text-red-700 transition-all"
              title="Delete"
            >
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-400 rounded-md p-5 bg-gray-50 text-center mb-5">
          <p className="text-sm text-gray-500">No resume uploaded yet.</p>
        </div>
      )}

      <label className="block text-center text-blue-500 font-semibold cursor-pointer hover:underline">
        <input
          type="file"
          accept=".doc,.docx,.rtf,.pdf"
          onChange={handleResumeUpload}
          className="hidden"
        />
        Update resume
      </label>
      <p className="text-xs text-gray-400 text-center mt-2">
        Supported Formats: doc, docx, rtf, pdf, up to 2 MB
      </p>
    </div>
  );
};

export default ResumeUpload;
