import React from 'react'
 import { Link, useNavigate } from 'react-router-dom'
import { useState} from 'react'
import { useDispatch } from 'react-redux'
import {useForm} from 'react-hook-form'
import { login as authlogin } from '../store/authSlice'
import { login as loginService} from '../services/authServices'
import Input from './Input'
import Button from './Button'




function Login() {
    const dispatch = useDispatch() 
    const navigate = useNavigate()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState('')

    const login = async(data)=>{
        console.log(data)
       setError('');

            try{
                const userData = await loginService(data);
                console.log("login ");
                if (userData){
                    dispatch(authlogin(userData))
                    navigate('/teacherdashbord')
                }
                // await getUser(dispatch);
            }catch(error){
        setError(error.message)
       }
    
    }
  return (
    <div
    className='flex items-center justify-center w-full'
    >
        <div className={` top-12 right-0 bg-gray-100 rounded-xl p-10 border border-black/10`}>
        <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
        <p className="mt-2 text-center text-base text-black/60">
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                    </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        
        <form onSubmit={handleSubmit(login)} className='mt-8'>
            {/* above handleSumbit is function from useForm where we have to pass our function that how it will handel the form and now handleSumbit is treated as keyword so we should use other name for our function and handleSumbit is an event which is call and take input and manage with register */}
            <div className='space-y-5'>
                <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                {...register("email", {   
                    required: true, // these are option for email that we need for email input field 
                    validate: {
                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        "Email address must be a valid address",
                    }
                })}
                />
                <Input
                label="Password: "
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                    required: true,
                })}
                />
                <Button
                type="submit"
                className="w-full" >Login</Button>
            </div>
        </form>
        </div>
    </div>
  )
}

export default Login