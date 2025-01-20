import React ,{forwardRef} from 'react'

const Input = forwardRef(function Input({
    label,
    type = 'text',
    classname = "",
    ...props
},ref){
    
    const {id} = props
    return(
        <div className="w-full">
            {label && <label
            className=""
            htmlFor={id}>
            {label}</label>}

            <input
            type={type}
            className={`${classname}`}
            {...props}
            ref = {ref}
            id = {id}
            ></input>
        </div>
       
    )
})

export default Input