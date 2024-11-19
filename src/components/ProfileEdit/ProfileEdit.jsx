// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { updateProfile } from "../../store/profileSlice";
// import { useNavigate } from "react-router-dom";
// import Input from "../Input";
// import { useForm } from "react-hook-form";
// import Button from "../Button";
// import Navbar from "../Navbar/Navbar";
// import ProfileButton from '../Profile_Button/Profile_Button';

// const ProfileEdit = () => {
//   // const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { register, handleSubmit,watch } = useForm();
//   const [error, setError] = useState('');
//   const [preview, setPreview] = useState(null);
//   // const profile = useSelector((state) => state.profile);


//   const handleImagePreview = (file) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       setPreview(reader.result); // Base64 string
//     };
//     reader.readAsDataURL(file);
//   };

//   const EditPortfolio = async (data)=>{
//     console.log(data);
//     //send data from here to backend
//   }

//   // Watch for changes to the file input
//   const watchImage = watch("image");
//   if (watchImage && watchImage.length > 0) {
//     handleImagePreview(watchImage[0]);
//   }



//   return (
//     <>
//     <nav>
//     <div className=''>
//           <Navbar
//               links={[
//                   {id:'1', label: "Contact US", to: "/contact" },
//                   {id:"2", label: "AboutUs", href: "/about" },
//                 ]}
//                 variant="dark"
//                 // notifications={notifications}
//                 externalComponent={ProfileButton}
//               />
//         </div>
//     </nav>
//     <div className="max-w-lg mx-auto p-4 bg-white shadow rounded-md">
//       <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
//       {error && (
//           <p className="text-red-600 text-center mb-4">{error}</p>
//         )}
        
//                 <form onSubmit={handleSubmit(EditPortfolio)} className="space-y-6">
//                 <Input
//                   label="Full Name"
//                   placeholder="Enter your full name"
//                   {...register('name', { required: true })}
//                 />
//                 <Input
//                 label="Email"
//                 placeholder="Enter your Address"
//                 />
//                 <Input
//                 label="Full Address"
//                 placeholder="Enter your Address"
//                 />
//                 <Input
//                 label="Phone number"
//                 placeholder="Enter your phone number"
//                 {...register('name', { required: true })}
//                 />
//                 <Input
//                 label = "Upload file"
//                 type="file"
//                {...register("image", {
//                   required: true,
//                   validate: (file) => file[0]?.size < 5 * 1024 * 1024 || "File size should be less than 5MB",
//                 })}
//                 accept="image/*" />
//                         {preview && (
//                   <div className="mb-4">
//                     <img src={preview} alt="Preview" className="w-32 h-32 rounded-full" />
//                   </div>
//                 )}
//                 <Button>
//                   Upadte Profile
//                 </Button>

//                 </form>
//     </div>
//     </>
    
//   );
// };

// export default ProfileEdit;


import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../Navbar/Navbar";
import ProfileButton from '../Profile_Button/Profile_Button';
import EditableCard from "../EditableCard";

const ProfileEdit = ()=>{
  const profile = useSelector((state) => state.profile);

  const handleSave = (updatedData) => {
    console.log("Updated Data:", updatedData);
    // You can update the backend or state here
  };

  // const userData = {
  //   name: "Jane Doe",
  //   email: "jane.doe@example.com",
  //   phone: "123-456-7890",
  // };
  // const userData1 = {
  //   Education: "Mca",
  //   Subject: "Python",
  //   phone: "123-456-7890",
  // };
  // const lable ={
  //  Education:"Education"
  // }

    return(
      <div className="bg-gray-200">
        <Navbar
              links={[
                  {id:'1', label: "Contact US", to: "/contact" },
                  {id:"2", label: "AboutUs", to: "/about" },
                ]}
                variant="dark"
                // notifications={notifications}
                externalComponent={ProfileButton}
              />
        <div className="bg-white space-x-10 shadow-2xl rounded-lg flex justify-center items-center mx-56 mt-10">
            <div className="relative inline-block">
                <img
                  src={profile.image || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border border-gray-300 shadow-sm"
                />
                <div
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 text-xs text-white font-semibold bg-blue-500 rounded-full px-2 py-1 shadow-lg"
                >
                  {profile.completion || 0}%
                </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{profile.name || 'your name'}</h3>
              <p className="text-sm text-gray-600">{profile.email || "youremail@gmail.com"}</p>
            </div>
        </div>
        <div className="bg-white gap-6 shadow-2xl rounded-lg flex flex-col justify-center items-center mx-56 mt-10">
        <EditableCard  onSave={handleSave}/>
        <EditableCard  onSave={handleSave}/>
          </div>
         
      </div>
    )
}

export default ProfileEdit
