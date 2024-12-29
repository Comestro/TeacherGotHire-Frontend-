import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Input from "../../Input";
import Button from "../../Button";
import {
  getJob,
  putExprienceProfile,
  getExprienceProfile,
  postExprienceProfile,
  delExprienceProfile,
} from "../../../features/jobProfileSlice";
import { IoMdAddCircleOutline } from "react-icons/io";
import { HiOutlineTrash, HiPencil } from "react-icons/hi";

const Experience = () => {
  const dispatch = useDispatch();
  const experienceData = useSelector(
    (state) => state?.jobProfile?.exprienceData || []
  );
  console.log("experienceData", experienceData);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  console.log("newJOb", jobRole);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(getJob());
    dispatch(getExprienceProfile());
  }, []);

  const onSubmit = async (data) => {
    try {
      console.log("expata", data);
      console.log("editindex", editingIndex);
      if (editingIndex !== null) {
        const id = experienceData[editingIndex].id;
        // Construct payload with only necessary fields
        const payload = {
          institution: data.institution,
          achievements: data.achievements,
          role: data.role,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        };
        console.log("payload", payload, id);

        await dispatch(putExprienceProfile({ payload, id })).unwrap();
      } else {
        await dispatch(postExprienceProfile(data)).unwrap(); // Dispatch with new data
      }

      setEditingIndex(null);
      setIsEditing(false);
      reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    const experience = experienceData[index];
    Object.keys(experience).forEach((key) => {
      setValue(key, experience[key]);
    });
  };

  const handleDelete = async (index) => {
    try {
      const id = experienceData[index].id;
      await dispatch(delExprienceProfile({ id: id })).unwrap();
      //dispatch(putExprienceProfile({id:id})).unwrap();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="px-5 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-600">Teacher Experience</h2>
        {!isEditing && (
          <button
            className="text-white flex items-center bg-[#3E98C7] transition-colors px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => {
              reset();
              setIsEditing(true);
            }}
          >
            Add Experience <IoMdAddCircleOutline className="size-4 ml-1 mt-1" />
          </button>
        )}
      </div>

      {!isEditing ? (
        // <div className="relative overflow-x-auto shadow sm:rounded-lg">
        //   <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        //     <thead className="text-xs text-gray-700 uppercase bg-gray-100">
        //       <tr>
        //         <th scope="col" className="px-6 py-3">
        //           Institution
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           Job Role
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           Start Date
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           End Date
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           Achievements
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           Description
        //         </th>
        //         <th scope="col" className="px-6 py-3">
        //           <span className="sr-only">Edit</span>
        //         </th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       {experienceData &&
        //         experienceData.map((experience, index) => (
        //           <tr
        //             key={index}
        //             className="bg-white border-b hover:bg-gray-50 "
        //           >
        //             <th
        //               scope="row"
        //               className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
        //             >
        //               {experience.institution || "N/A"}
        //             </th>
        //             <td className="px-6 py-4">
        //               {experience.role.jobrole_name || "N/A"}
        //             </td>
        //             <td className="px-6 py-4">
        //               {experience.start_date || "N/A"}
        //             </td>
        //             <td className="px-6 py-4">
        //               {experience.start_date || "N/A"}
        //             </td>
        //             <td className="px-6 py-4 ">
        //               {experience.achievements || "N/A"}
        //             </td>
        //             <td className="px-6 py-4">
        //               {experience.description || "N/A"}
        //             </td>
        //             <td className="pr-6 py-4 text-right flex justify-center items-center">
        //               <button
        //                 onClick={() => {
        //                   handleEdit(index);
        //                   setIsFormVisible(true);
        //                   setIsEditing(true); // Reset editing state
        //                   setEditingRowIndex(index);
        //                 }}
        //                 className="font-medium text-[#3E98C7] dark:text-blue-500"
        //               >
        //                 <HiPencil className="size-5" />
        //               </button>
        //               <button
        //                 onClick={() => handleDelete(index)}
        //                 className="font-medium text-red-600 dark:text-red-600 ml-2"
        //               >
        //                 <HiOutlineTrash className="size-5" />
        //               </button>
        //             </td>
        //           </tr>
        //         ))}
        //     </tbody>
        //   </table>
        // </div>
        <div className="flex flex-col gap-4 border bg-slate-50 rounded-md px-4 py-4">
          {experienceData &&
            experienceData.map((experience, index) => (
              <div
                key={index}
                className="transition-shadow  px-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {experience.institution || "N/A"}
                  </h2>
                  <div className="flex space-x-4 items-center">
                    <button
                      onClick={() => {
                        handleEdit(index);
                        setIsFormVisible(true);
                        setIsEditing(true);
                        setEditingRowIndex(index);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <HiPencil className="h-6 w-6 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <HiOutlineTrash className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold mr-2">Job Role:</span>{" "}
                    {experience.role.jobrole_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold mr-2">Start Date:</span>{" "}
                    {experience.start_date || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold mr-2">End Date:</span>{" "}
                    {experience.end_date || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold mr-2">Achievements:</span>{" "}
                    {experience.achievements || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold mr-2">Description:</span>{" "}
                    {experience.description || "N/A"}
                  </p>
                </div>
                <hr className="mt-4"/>
              </div>
            ))}
            
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg space-y-4 border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Institution
              </label>
              <input
                type="text"
                placeholder="Enter Institution"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("institution", { required: true })}
              />
              {errors.institution && (
                <span className="text-sm text-red-500">
                  {errors.institution.message || "This field is required"}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Job Role
              </label>
              <select
                className="w-full border-b border-gray-300  p-2 focus:outline-none focus:ring-blue-400"
                {...register("job_role", { required: true })}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {jobRole.map((role) => (
                  <option key={role.id} value={role.job_role}>
                    {role.jobrole_name}
                  </option>
                ))}
              </select>
              {errors.job_role && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("start_date")}
              />
              {errors.start_date && (
                <span className="text-sm text-red-500">
                  {errors.start_date.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                End Date
              </label>
              <input
                type="date"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("end_date")}
              />
              {errors.end_date && (
                <span className="text-sm text-red-500">
                  {errors.end_date.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Achievements
              </label>
              <textarea
                rows="3"
                placeholder="Enter Achievements"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("achievements", { required: true })}
              ></textarea>
              {errors.achievements && (
                <span className="text-sm text-red-500">
                  {errors.achievements.message || "This field is required"}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Enter Description"
                className="w-full border-b border-gray-300 p-2 focus:outline-none focus:ring-blue-400"
                {...register("description", { required: true })}
              ></textarea>
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description.message || "This field is required"}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center mt-2">
            <button
              type="button"
              className="border border-[#3E98C7] text-[#3E98C7] py-1.5 px-5 rounded-lg"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#3E98C7] text-white py-1.5 px-7 rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Experience;
