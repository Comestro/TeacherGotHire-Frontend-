import React from 'react'
import { useSelector } from 'react-redux';
import Navbar from '../Navbar/Navbar'
import { useNavigate } from 'react-router-dom';
import ProfileButton from '../Profile_Button/Profile_Button';
import Footer from '../Footer/Footer';
import SubjectSelection from '../SubjectSelection';

function TeacherDashboard() {
  const profile = useSelector((state) => state.profile);
    const navigate = useNavigate();

    const handleExamStart = () => {
      navigate('/payment'); // Redirect to payment page
    };

    const calculateCompletion = () => {
      const totalFields = 5 + profile.skills.length + profile.experience.length + profile.education.length;
      const filledFields = [
        profile.name,
        profile.email,
        profile.phone,
        profile.address,
        profile.profileImage,
        ...profile.skills,
        ...profile.experience,
        ...profile.education,
      ].filter(Boolean).length;
  
      return Math.round((filledFields / totalFields) * 100);
    };

  return (
    <div >
      <nav className=''>
        <div className=''>
          <Navbar
              links={[
                  {id:'1',label:"Home", to:"/"},
                  {id:'2', label: "Contact US", to: "/contact" },
                  {id:"3", label: "AboutUs", to: "/about" },
                ]}
                variant="dark"
                // notifications={notifications}
                externalComponent={ProfileButton}
              />
                </div>
              </nav>
              
              <div className='flex w-full justify-center  mt-10'>
              <aside className='w-[25%]'>
              <div className="w-64 p-6 bg-gray-100 h-screen">
               
                  <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Completion Border */}
              <div
                className="absolute inset-0 w-full h-full rounded-full border-4 border-blue-500 z-0"
                style={{
                  clipPath: `circle(${calculateCompletion()}% at 50% 50%)`,
                }}
              ></div>
              {/* Profile Image */}
              <img
                src={profile.profileImage || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300 z-10"
              />
            </div>

                {/* Name and Email */}
                <div className="text-center mb-6">
                  <h2 className="font-bold text-lg">{profile.name || "Your Name"}</h2>
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
       </aside>
       <section className=''>
            
            <SubjectSelection/>
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
                onClick={handleExamStart}
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