import React from 'react'

const PersonalSidebar = () => {
  return (
    <div className="h-screen bg-white shadow-md flex flex-col rounded-xl justify-between p-2">
      <div>
        <div className="px-6 py-4">
          <h1 className="text-2xl text-center  font-bold text-teal-500" style={{ fontFamily: '"Edu AU VIC WA NT Arrows", cursive' }}>
            Q<span className="text-black">uick links</span>
          </h1>
        </div>

        <nav className="mt-6">
          <ul>
            <li className="flex items-center px-6 py-3 text-gray-500 hover:bg-gray-100 hover:text-black transition">
              <span className="material-icons text-lg mr-4"></span>
              <span>Dashboard</span>
            </li>
            <li className="flex items-center px-6 py-3 text-white bg-teal-500 rounded-lg transition">
              <span className="material-icons text-lg mr-4"></span>
              <span>Courses</span>
            </li>
            
            
          </ul>
        </nav>
      </div>

      {/* Bottom Section */}
      {/* <div className="px-6 py-4">
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700">
            Upgrade your Account to Pro
          </h3>
          <p className="text-xs text-gray-500 mt-2">
            Upgrade to premium to get premium features.
          </p>
          <button className="mt-4 px-4 py-2 w-full bg-teal-500 text-white rounded-lg hover:bg-teal-600">
            Upgrade
          </button>
        </div>
      </div> */}
    </div>
  )
}

export default PersonalSidebar