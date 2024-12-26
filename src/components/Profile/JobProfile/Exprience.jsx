
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

const Experience = () => {
  const dispatch = useDispatch();
  const experienceData = useSelector(
    (state) => state?.jobProfile?.exprienceData || []
  );
  console.log("experienceData",experienceData)
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  console.log("newJOb",jobRole)
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
          role: data.role.id,
          qualification: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
        };
        console.log("payload",payload,id)

        await dispatch(putExprienceProfile({payload, id })).unwrap();
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
      await dispatch(delExprienceProfile({id:id})).unwrap();
      //dispatch(putExprienceProfile({id:id})).unwrap();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
        Teacher Experience
      </h2>

      {!isEditing ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-2 border border-gray-300">Institution</th>
                <th className="px-4 py-2 border border-gray-300">Job Role</th>
                <th className="px-4 py-2 border border-gray-300">Start Date</th>
                <th className="px-4 py-2 border border-gray-300">End Date</th>
                <th className="px-4 py-2 border border-gray-300">Achievements</th>
                <th className="px-4 py-2 border border-gray-300">Description</th>
                <th className="px-4 py-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experienceData && experienceData.map((experience, index) => (
                <tr key={index} className="bg-white text-gray-700">
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.institution || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.job_role || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.start_date || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.end_date || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.achievements || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {experience.description || "N/A"}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                  { (
                        <button
                          onClick={() => {
                            handleEdit(index)
                            setIsFormVisible(true);
                            setIsEditing(true); // Reset editing state
                            setEditingRowIndex(index);
                          }}
                          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button
              className="text-white bg-teal-600 hover:bg-teal-700 transition-colors px-6 py-2 rounded-md text-sm font-medium"
              onClick={() => {
                reset();
                setIsEditing(true);
              }}
            >
              Add Experience
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Institution"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter Institution"
                type="text"
                {...register("institution", { required: true })}
              />
              {errors.institution && (
                <span className="text-red-500 text-sm">
                  {errors.institution.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <select
                {...register("job_role", { required: true })}
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {jobRole.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    label={role.jobrole_name}
                  ></option>
                  
                ))}
              </select>
              {errors.jobRole && (
                <span className="text-red-500 text-sm">
                  This field is required
                </span>
              )}
            </div>
            <div>
              <Input
                label="Start Date"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter Start Date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <span className="text-red-500 text-sm">
                  {errors.start_date.message}
                </span>
              )}
            </div>
            <div>
              <Input
                label="End Date"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter End Date"
                type="date"
                {...register("end_date")}
              />
              {errors.end_date && (
                <span className="text-red-500 text-sm">
                  {errors.end_date.message}
                </span>
              )}
            </div>
            <div>
              <Input
                label="Achievements"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter Achievements"
                type="text"
                {...register("achievements", { required: true })}
              />
              {errors.achievements && (
                <span className="text-red-500 text-sm">
                  {errors.achievements.message}
                </span>
              )}
            </div>
            <div>
              <Input
                label="Description"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter Description"
                type="text"
                {...register("description", { required: true })}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              type="button"
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded-md"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Experience;

