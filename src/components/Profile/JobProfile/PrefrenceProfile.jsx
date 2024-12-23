import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../Button";
import { useDispatch, useSelector } from "react-redux";
import { getClassCategory,getJob, getPrefrence,getSubject,postPrefrence,getTeacherjobType,} from "../../../features/jobProfileSlice";
import { updateTeacherPrefrence } from "../../../services/jobProfileService";

const PrefrenceProfile = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();


  useEffect(() => {
    dispatch(getClassCategory());
    dispatch(getJob());
    dispatch(getSubject());
    dispatch(getTeacherjobType());
    dispatch(getPrefrence());
  }, []);

  const category = useSelector((state) => state?.jobProfile?.classCategories);
  const jobRole = useSelector((state) => state?.jobProfile?.jobRole);
  const subject = useSelector((state) => state?.jobProfile?.subject);
  const teacherjobRole = useSelector((state) => state?.jobProfile?.teacherjobRole);
  const teacherprefrence = useSelector((state) => state?.jobProfile?.prefrence);

  console.log("teacherprefrence",teacherprefrence);
  console.log("Role:", teacherprefrence.teacher_job_type);


  const [isEditingPrefrence, setIsEditingPrefrence] = useState(false);
  const [error, setError] = useState("");

 

  const fetchPreferences = () => {
    dispatch(getPrefrence());
  };
  useEffect(() => {
    if (teacherprefrence) {
      Object.entries(teacherprefrence).forEach(([key, value]) =>
        setValue(key, value)
      );

    }
  }, [teacherprefrence, setValue]);


  const onSubmit = async (data) => {
    try {
      console.log("form data", data);
      await updateTeacherPrefrence(data);
      dispatch(postPrefrence(data));
      fetchPreferences();
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
          <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Class Category
                </h3>
                <p className="text-gray-700 text-md">
                  {teacherprefrence.class_category && teacherprefrence.class_category.name || 'N/A'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Job Role
                </h3>
                <p className="text-gray-700 text-md">
                  {teacherprefrence.job_role && teacherprefrence.job_role.jobrole_name || 'N/A'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                Subject
                </h3>
                <p className="text-gray-700 text-md">
                  
                  {teacherprefrence.prefered_subject && teacherprefrence.prefered_subject.length > 0
                    ? teacherprefrence.prefered_subject
                        .map((subject) => subject.subject_name)
                        .join(", ") // Combine subject names into a comma-separated string
                    : "N/A"}
                </p>
               
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-600 uppercase">
                  Preferred Job
                </h3>
                <p className="text-gray-700 text-md">
                  {
                    teacherprefrence.teacher_job_type && teacherprefrence.teacher_job_type.length > 0
                    ? teacherprefrence.teacher_job_type
                    .map((jobrole)=>jobrole.teacher_job_name)
                     .join(",")
                     :"N/A"
                  }
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="text-white bg-teal-600 hover:bg-teal-700 transition-colors px-6 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsEditingPrefrence(true)}
              >
                Edit Preferences
              </button>
            </div>
          </div>
)  : (
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
                  {category && category.map((category) => (
                    <option
                      key={category.id}
                      value={category.name}
                      label={category.name}
                    ></option>
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
                    <option
                      key={jobRole.id}
                      value={jobRole.jobrole_name}
                      label={jobRole.jobrole_name}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Subject
                </label>
                <div className="space-y-2">
                  {subject.map((subject) => (
                    <div key={subject.id} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("prefered_subject", { required: true })}
                        value={subject.id}
                        id={`subject-${subject.id}`}
                        className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      />
                      <label
                        htmlFor={`subject-${subject.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {subject.subject_name}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.prefered_subject && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher job type
                </label>
                <div className="space-y-2">
                  {teacherjobRole.map((teacherjobRole) => (
                    <div key={teacherjobRole.id} className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("teacher_job_type", { required: true })}
                        value={teacherjobRole.id}
                        id={`teacherjobRole-${teacherjobRole.id}`}
                        className="h-4 w-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      />
           
           
                      <label
                        htmlFor={`teacherjobRole-${teacherjobRole.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {teacherjobRole.teacher_job_name}
                      </label>
                    </div>
                  ))}
                </div>

                {errors.teacher_job_name && (
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
