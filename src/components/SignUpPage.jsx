import React from 'react';
import {useForm} from 'react-hook-form';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {signup}  from '../store/profileSlice'
import Input from './Input';
import Button from './Button';

import { useParams, useNavigate } from 'react-router-dom';
import { createaccount } from '../services/authServices';


function SignUpPage() {
    const { role } = useParams(); // Get the role from the URL
    const navigate = useNavigate();
    const dispatch = useDispatch(); 
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');

    const signup = async (data) => {
        console.log(data);
        let username,email,password; 
        username = email  = data.email;
        password= data.password;
        setError('');
        try{

           const response = await createaccount({username,email,password});
           if(response){
            dispatch({
              type:'SET_USER',
              payload:{
                name:username,
                email:email,
              }
        });
            navigate('/login')
           }
        }catch (error) {
          setError(error.message);
        }
      
        // if(role==='teacher'){
        //   navigate('/teacherdashbord')
        // }else{
        //   navigate('/schooladmindashboard')
        // }
      };
    
    return (

    
    <div>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="mx-auto w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-center text-3xl font-semibold mb-4 text-gray-800">
         Please Create Your Account
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}
        
                <form onSubmit={handleSubmit(signup)} className="space-y-6">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  {...register('username', { required: true })}
                />
      
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  {...register('email', {
                    required: true,
                    validate: {
                      matchPattern: (value) =>
                        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        'Email address must be valid',
                    },
                  })}
                />
      
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  {...register('password', { required: true })}
                />
                 {/* <Input
                  label="Confirm_Password"
                  placeholder="Enter your password"
                  type="password"
                  {...register('password', { required: true })}
                /> */}
                  {/* {role === 'teacher' && 
                  (<Input
                    label=""
                    placeholder="Enter your role"
                    {...register('name', { required: true })}/>)
                    
                // } */ }  
                 {/* later I willcheck for later             */}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200">
                  Sign Up
                </Button>
              </form>
       

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
    </div>
  );
}

export default SignUpPage