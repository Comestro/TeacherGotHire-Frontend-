import React, { useState } from 'react'


//in the place of message we need api for real notification
const Notification = ()=>{
   const[isVisible, setIsVisible] = useState(true);


if(!isVisible) return null;

    return(
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg  w-80 flex items-center`}>
        <span className="flex-1">{message}</span>
        <button
          className="ml-3 text-xl font-semibold text-white hover:text-gray-200"
          onClick={() => setIsVisible(false)}
        >
        </button>
      </div>
    )
}

export default Notification
   
