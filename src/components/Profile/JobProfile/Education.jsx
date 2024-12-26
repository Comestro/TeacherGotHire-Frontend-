import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Input from "../../Input";
import Button from "../../Button";
import {
  getEducationProfile,
  getQualification,
  postEducationProfile,
  putEducationProfile,
  delEducationProfile,
} from "../../../features/jobProfileSlice";

const Education = () => {
  const dispatch = useDispatch();
  const qualification = useSelector(
    (state) => state?.jobProfile?.qualification
  );
  console.log("qualification", qualification);
  const educationData = useSelector(
    (state) => state.jobProfile?.educationData || []
  );
  console.log("educatkjhionData", educationData);

  const [editingIndex, setEditingIndex] = useState(null);
  //const [isEditingExprience, setIsEditingExprience] = useState(false);
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

  // Fetch education data on component mount
  useEffect(() => {
    dispatch(getQualification());
    dispatch(getEducationProfile());
  }, []);

  // Handle saving or updating education data
  const onSubmit = async (data) => {
    try {
      console.log("edudata", data);
      console.log("editindex", editingIndex);
      if (editingIndex !== null) {
        const id = educationData[editingIndex].id;
        // Construct payload with only necessary fields
        const payload = {
          institution: data.institution,
          qualification: data.qualification,
          year_of_passing: data.year_of_passing,
          grade_or_percentage: data.grade_or_percentage,
        };
        console.log("payload",payload,id)

        await dispatch(putEducationProfile({payload, id })).unwrap();
      } else {
        await dispatch(postEducationProfile(data)).unwrap(); // Dispatch with new data
      }

      setIsEditing(false);
      setEditingIndex(null); // Exit editing mode
      reset(); // Reset form
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    const experience = educationData[index];
    Object.keys(experience).forEach((key) => {
      setValue(key, experience[key]);
    });
  };

  const handleDelete = async (index) => {
    // console.log("in", index);
    try {
      const id = educationData[index].id;
      console.log(id);
      await dispatch(delEducationProfile({ id: id })).unwrap();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
        Teacher Education
      </h2>

      {!isEditing ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-2 border border-gray-300">
                  Institution
                </th>
                <th className="px-4 py-2 border border-gray-300">
                  qaulification
                </th>
                <th className="px-4 py-2 border border-gray-300">
                  Year of Passing
                </th>
                <th className="px-4 py-2 border border-gray-300">Grade</th>
                <th className="px-4 py-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {educationData &&
                educationData.map((experience, index) => (
                  <tr key={index} className="bg-white text-gray-700">
                    <td className="px-4 py-2 border border-gray-300">
                      {experience.institution || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {experience.qualification.name || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {experience.year_of_passing || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {experience.grade_or_percentage || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {
                        <button
                          onClick={() => {
                            handleEdit(index);
                            setIsFormVisible(true);
                            setIsEditing(true); // Reset editing state
                            setEditingRowIndex(index);
                          }}
                          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      }
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
              Add Education
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
                qualification
              </label>
              <select
                {...register("qualification", { required: true })}
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {qualification.map((role) => (
                  <option
                    key={role.id}
                    value={role.name}
                    label={role.name}
                  ></option>
                ))}
              </select>
              {errors.qualification && (
                <span className="text-red-500 text-sm">
                  This field is required
                </span>
              )}
            </div>
            <div>
              <Input
                label="Year_of_Passing"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Enter Start Date"
                type="text"
                {...register("year_of_passing")}
              />
              {errors.year_of_passing && (
                <span className="text-red-500 text-sm">
                  {errors.start_date.message}
                </span>
              )}
            </div>
            <div>
              <Input
                label="Grade of percentage"
                className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"
                placeholder="Grade of percentage"
                type="text"
                {...register("grade_or_percentage")}
              />
              {errors.grade_or_percentag && (
                <span className="text-red-500 text-sm">
                  {errors.grade_or_percentag.message}
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

export default Education;
