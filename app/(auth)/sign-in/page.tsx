'use client'

import React from 'react'
import {auth} from '@/firebase/client'
import {signInWithEmailAndPassword} from 'firebase/auth'
import {useRouter} from 'next/navigation'
import {toast} from 'react-toastify';
import { useState,useEffect } from 'react';

const page = () => {

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handlesignin = async(e:React.FormEvent) =>{
        e.preventDefault();
        try{
            await signInWithEmailAndPassword(auth,email,password);
            console.log('User signed in:',auth.currentUser);
            toast.success('Sign-in successful!',{position: "top-center"});
            router.push('/');
        }catch(error){
            console.error('Error signing in:',error);
            toast.error('Sign-in failed,Please check your credentials',{position: "top-center"});
        }
    }

    return (
        <>
        <div className="flex items-center justify-center min-h-screen ">
            <form
            onSubmit={handlesignin}
            className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-cyan-600 mb-6 text-center">Sign In</h2>
                <div className="mb-4">
                    <label className="block text-cyan-700 text-sm font-medium mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="w-full px-3 py-2 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        onChange={(e)=>setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-cyan-700 text-sm font-medium mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="w-full px-3 py-2 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        onChange={(e)=>setPassword(e.target.value)}

                    />
                </div>
                <button
                    className="w-full bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700 transition-colors"
                    type="submit"
                >
                    Sign In
                </button>
                <p>Create an account! <a href="/sign-up" className='text-blue-800'>Sign-up</a></p>
            </form>
        </div>
        </>
    )
}

export default page