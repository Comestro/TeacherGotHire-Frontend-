import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Navbar from '../Navbar/Navbar'
import { useNavigate } from 'react-router-dom';
//import ProfileButton from '../Profile_Button/Profile_Button';
import Footer from '../Footer/Footer';
import ResultCard from '../Result/Result';


function TeacherDashboard() {
    const profile = useSelector((state) => state.personalProfile.profileData|| []);
    const navigate = useNavigate();

   

  return (
    <div >
      <nav className=''>
          <Navbar
              links={[
                  {id:'1',label:"Home", to:"/"},
                  {id:'2', label: "Contact US", to: "/contact" },
                  {id:"3", label: "AboutUs", to: "/about" },
                ]}
                variant="dark"
                // notifications={notifications}
                //externalComponent={ProfileButton}
              />
        </nav>
       
              
              <div className='flex w-full justify-center  mt-10'>
              <aside className='w-[25%]'>
              {/* 
               */}
                 <div className="relative w-24 h-24 mx-auto mb-6">
            
              {/* Profile Image */}
              
              {profile.map((profile)=>(
                <div className="">
                <img
                src={profile.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300 z-10"
              />
                {/* Name and Email */}
              <div className="text-center mb-6">
              <h2 className="font-bold text-lg">{profile.fullname || "Your Name"}</h2>
              <p className="text-sm text-gray-500">{profile.email || "your-email@example.com"}</p>
              <p className="text-sm text-gray-500">{profile.phone || "your-email@example.com"}</p>
            </div>
            {/* View Profile Button */}
            <button
                  onClick={() => navigate("/personalprofile")}
                  className="block w-full mt-5 bg-blue-500 text-white py-2 rounded-md text-center hover:bg-blue-600 transition"
                >
                  Edit your Profile
                </button>
                <button
                  onClick={() => navigate("/jobprofile")}
                  className="block w-full mt-5 bg-blue-500 text-white py-2 rounded-md text-center hover:bg-blue-600 transition"
                >
                  Edit Your Job profile
                </button>
                </div>
            
               ))}
              
           

              
               

                
              </div> 
       </aside>
       <div>
        <ResultCard/>
        </div>
       <section className=''>
            <div className="w-2xl p-6 mt-8 bg-gray-100 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-600 text-center mb-4">
              Become a Certified Tutor!
            </h1>
            <p className="text-lg text-gray-700 mb-4">
              Join our network of professional tutors by completing a simple exam. Here's how the process works:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              <li className="mb-2">Pay a minimal registration fee to enroll for the exam.</li>
              <li className="mb-2">Take the exam to demonstrate your teaching skills.</li>
              <li>Start your journey as a certified tutor with us!</li>
            </ul>
            <p className="text-lg font-medium text-gray-800 mb-6">
              Registration Fee: <span className="text-green-600 font-bold">₹500</span>
            </p>
            <div className="text-center">
              <button
                // onClick={handleExamStart}
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
              >
                Proceed to Exam
              </button>
            </div>
          </div>  
                   
            </section>
       </div>
       <Footer/>
   </div>
    
  )
}

export default TeacherDashboard