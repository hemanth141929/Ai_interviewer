"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import Header from "@/components/header";

export default function Home() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setUid(null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
    <Header/>
    <div className="relative flex flex-col justify-start items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent animate-gradientMove"></div>

      {/* 💠 Navbar */}
      

      {/* Floating Glow Orbs */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-30 blur-3xl"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.12, 0.9, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Glass Card */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_30px_rgba(0,255,255,0.2)] p-10 mt-32 max-w-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Glowing AI Sphere */}
        <motion.div
          className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_60px_rgba(0,255,255,0.6)] mb-6"
          animate={{
            y: [0, -10, 0],
            boxShadow: [
              "0 0 40px rgba(0,255,255,0.6)",
              "0 0 60px rgba(0,255,255,0.8)",
              "0 0 40px rgba(0,255,255,0.6)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <h1 className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 text-4xl sm:text-5xl font-extrabold tracking-widest drop-shadow-lg">
          AI Interview Assistant
        </h1>

        <p className="text-blue-100 mt-4 text-base sm:text-lg max-w-md">
          Prepare like a pro with real-time AI voice interviews, personalized questions, and smart feedback.
        </p>

        {/* Futuristic CTA Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-10">
          <Link href="/interview">
            <button
              type="button"
              className="relative px-10 py-4 font-semibold text-lg rounded-full text-cyan-100 bg-gradient-to-r from-blue-500 to-cyan-400 overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-300 hover:shadow-[0_0_70px_rgba(0,255,255,0.6)] cursor-pointer"
            >
              <span className="relative z-10">Start Interview</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-lg opacity-40 -z-10 animate-pulse"></span>
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/40 rounded-full blur-3xl animate-ping"></div>
    </div>
    </>
  );
}
