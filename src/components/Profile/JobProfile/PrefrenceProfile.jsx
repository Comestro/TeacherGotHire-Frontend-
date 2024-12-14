import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../Button";
import { useDispatch, useSelector } from "react-redux";
import { getClassCategory, getJob, getPrefrence,getSubject,postPrefrence,getTeacherjobType } from "../../../features/jobProfileSlice";
import { updateTeacherPrefrence } from "../../../services/jobProfileService";

const PrefrenceProfile = () => {
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getSubject());
    dispatch(getTeacherjobType());
  }, []);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const subject = useSelector((state) => state?.jobProfile?.subject);
  const teacherjobRole = useSelector((state) => state?.jobProfile.teacherjobRole);



  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);
  const [error, setError] = useState("");
 
  const { register, handleSubmit,formState: { errors }} = useForm();

  useEffect(() => {

    dispatch(getPrefrence())
      .then((response) => {
        console.log("Responsed:", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [dispatch]);


  const onSubmit = async (data) => {
    try {
      console.log("form data",data);
      await updateTeacherPrefrence(data);
      dispatch(postPrefrence(data));
      setIsEditingPrefrence(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl px-5 mt-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700 text-center underline">
        Prefrence Information
      </h2>
      <div className="mb-4 pl-2">
        <p className="text-gray-700 font-semibold mb-2">Prefrence</p>
        {!isEditingPrefrence ? (
          <div className="flex justify-between items-center">
            {/* <p className="text-gray-500">{category.name || "N/A"}</p> */}
            <button
              className="text-gray-700 border border-1 border-gray-400 px-8 py-2 rounded-md text-sm"
              onClick={() => setIsEditingPrefrence(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Category
                </label>
                <select
                  {...register("class_category", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {category.map((category) => (
                 <option key={category.id} value={category.name} label={category.name}>
                  </option>
                  ))}
                </select>
                
                    {errors.category && (
                      <span className="text-red-500 text-sm">
                        This field is required
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
                 {jobRole.map((jobRole) => (
                 <option key={jobRole.id} value={jobRole.jobrole_name} label={jobRole.jobrole_name}>
                 </option>
                  ))}
                </select>
                
                    {errors.jobRole && (
                      <span className="text-red-500 text-sm">
                        This field is required
                      </span>
                    )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefered Subject
                </label>
                <select
                  {...register("prefered_subject", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {subject.map((subject) => (
                 <option key={subject.id} value={subject.subject_name} label={subject.subject_name}>
                 </option>
                  ))}
                </select>
                
                    {errors.subject && (
                      <span className="text-red-500 text-sm">
                        This field is required
                      </span>
                    )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher job type
                </label>
                <select
                  {...register("teacher_job_type", { required: true })}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {teacherjobRole.map((teacherjobRole) => (
                 <option key={teacherjobRole.id} value={teacherjobRole.teacher_job_name} label={teacherjobRole.teacher_job_name}>
                 </option>
                  ))}
                </select>
                
                    {errors.category && (
                      <span className="text-red-500 text-sm">
                        This field is required
                      </span>
                    )}
              </div>
             
            </div>
            <Button
                 onClick={() => {
                  setIsEditingPrefrence(false);
               }}
              type="button"
              className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
              
            >
              Cancle
            </Button>
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition"
            >
              Save
            </Button>
          </form>
        )}
      </div>
      <hr className="mb-4" />
    </div>
  );
};

export default PrefrenceProfile;
