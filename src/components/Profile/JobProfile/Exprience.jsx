
import React, { useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import Input from "../../Input";
import { updateExprienceProfile } from "../../../services/jobProfileService";
import { fetchExprienceProfile } from "../../../services/jobProfileService";
import { FiEdit2 } from "react-icons/fi"

const Exprience = () => {
    const exprience = useSelector((state) => state); // Redux education state
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
    
      dispatch((fetchExprienceProfile));
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await updateExprienceProfile(data);
      console.log(response)
      dispatch(postExprience(data));
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

    return (
    <div className="p-6">

      {/* header section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Exprience</h3>
        <button
          onClick={() => setIsModalOpen(true)} // Open modal for adding new education
          className="text-blue-500 hover:underline text-sm flex items-center gap-1"
        >
          <FiEdit2 />
          Add Exprience
        </button>
      </div>
      {/* Profile Section */}
      <div className="space-y-4">
        {exprience.length > 0 ? (
          exprience.map((add, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-gray-100">
              <p>
                <strong>Qualification:</strong> {add.city}
              </p>
              <p>
                <strong>Institution:</strong> {add.state}
              </p>
              <p>
                <strong>Year of passing:</strong> {add.state}
              </p>
              <p>
                <strong>Grade or percentage:</strong> {add.state}
              </p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => handleOpenModal(index)} // Open modal for editing
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                {/* <button
                  onClick={() => handleRemoveEducation(index)} // Remove education
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No Education added yet.</p>
        )}
      </div>

      {/* Modal for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg h-[90%] p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold">Edit Exprience</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4 mt-4">
              <Input label="Qualification" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Qualification" type="text" {...register("user_id", { required: true })} />
              <Input label="Institution" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Institution" type="text" {...register("address_type", { required: true })} />
              <Input label="Year of passinge" className="w-full border-2 border-gray-300 text-sm rounded-xl p-3" placeholder="Year of passing" type="text" {...register("state", { required: true })} />
              <Input label="Grade or percentage"className="w-full border-2 border-gray-300 text-sm rounded-xl p-3"  placeholder="Grade or percentage" type="text" {...register("division")} />
              
              <div className="flex justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    );
  
};

export default  Exprience;