import React from 'react'
import Button from './Button'

function RoleSelection({onSelectRole}) {
  return (
    <div>
         <div className='flex item-center justify-center  pt-32 mb-12'>
          <div className='flex flex-col '>
              <p className='mb-8  text-2xl font-sans'>Effective Learning for Real Progress</p>
              <div className='grid grid-cols-1 gap-4'>
                  <Button
                    onClick={() => onSelectRole('teacher')}
                    textColor='text-white' bgcolor='bg-teal-500'
                    className="w-56 rounded-2xl">I am a Teacher
                  </Button>
                  <Button
                     onClick={() => onSelectRole('school')}
                    textColor='text-white' bgcolor='bg-teal-500'
                    className=" w-56 rounded-2xl">I am a School admistrator
                  </Button>
                  {/* <Button
                     onClick={() => onSelectRole('parent')}
                    textColor='text-white' bgcolor='bg-teal-500'
                    className="w-56 rounded-2xl">I am a Parent
                  </Button> */}
              </div>
          </div>
         
        </div> 
    </div>
  )
}

export default RoleSelection


