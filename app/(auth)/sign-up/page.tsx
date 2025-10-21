"use client";

import React, { useState } from 'react';
import Headers from '@/components/header';
import { auth , db } from '@/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {toast} from 'react-toastify';
import { useRouter } from 'next/navigation';


const Page = () => {

    const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log('User signed up:', user);
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          username: username,
          email: email,
        });
        toast.success('Sign up successful!,Please sign-in',{position: "top-center"});
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <>
      
      <div className="flex items-center justify-center min-h-screen">
        <form
          onSubmit={handleSignUp}
          className="bg-white p-8 rounded-3xl shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-cyan-600 mb-6 text-center">Sign Up</h2>
          
          <div className="mb-4">
            <label className="block text-cyan-700 text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="w-full px-3 py-2 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              type="text"
              id="username"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-cyan-700 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              type="email"
              id="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
          
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded hover:bg-cyan-700 transition-colors"
            type="submit"
          >
            Sign Up
          </button>
          <p>Already have an account?<a href="/sign-in" className='text-blue-800'>Sign-in</a></p>
        </form >
      </div>
    </>
  );
};

export default Page;
    