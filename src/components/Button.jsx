import React ,{forwardRef} from 'react'

const Button = forwardRef(function Button(
    {
    children,
    type='button',
    bgcolor = 'bg-teal-600',
    textColor = 'text-white',
    className="",
    ... props    
    },ref, value
){
return(
    <button
    ref={ref}
    type={type}
    className={`px-4 py-2 rounded ${bgcolor} ${textColor} ${className}`}
    {...props}
  >
    {children}
  </button>
)
})

export default Button