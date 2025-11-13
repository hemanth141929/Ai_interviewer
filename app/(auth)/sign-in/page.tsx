'use client'

import React from 'react'
import { auth } from '@/firebase/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useState } from 'react'
import Header from '@/components/header'
import { motion } from "framer-motion"

const Page = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Sign-in successful!', { position: "top-center" })
      router.push('/')
    } catch (error) {
      toast.error('Sign-in failed, please check your credentials', { position: "top-center" })
    }
  }

  return (
    <>
      <Header />

      {/* SAME BACKGROUND AS HOME PAGE */}
      <div className="relative flex flex-col justify-center items-center min-h-screen 
        overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">

        {/* Background Glow Animation */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
        from-cyan-900/30 via-transparent to-transparent animate-gradientMove"></div>

        {/* Floating Glow Orbs */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r 
          from-cyan-400 to-blue-600 opacity-30 blur-3xl"
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.12, 0.9, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sign-In Card */}
        <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl 
          border border-white/20 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.2)] p-8">

          <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <label className="block text-cyan-200 text-sm mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded bg-transparent border border-cyan-400 
                text-white placeholder-cyan-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-cyan-200 text-sm mb-2">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded bg-transparent border border-cyan-400 
                text-white placeholder-cyan-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-2 
              rounded-full font-semibold shadow-lg hover:opacity-90 transition"
              type="submit"
            >
              Sign In
            </button>

            <p className="text-center text-cyan-200 mt-4">
              Create an account?{" "}
              <a href="/sign-up" className="text-blue-300 underline">
                Sign-Up
              </a>
            </p>
          </form>
        </div>

        {/* Background Orbs */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/40 rounded-full blur-3xl"></div>
      </div>
    </>
  )
}

export default Page
