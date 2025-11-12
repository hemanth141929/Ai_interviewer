
"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white px-6">
      {/* 🌌 Animated background glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-30 blur-3xl"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ✨ Page Title */}
      <motion.h1
        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 text-5xl font-extrabold tracking-widest mb-10 drop-shadow-[0_0_25px_rgba(0,255,255,0.4)] text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        About Our Project
      </motion.h1>

      {/* 🧊 Main content box */}
      <motion.div
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(0,255,255,0.2)] p-8 sm:p-10 w-[95%] max-w-4xl text-center leading-relaxed"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <p className="text-gray-300 text-base sm:text-lg mb-6">
          <span className="text-cyan-300 font-semibold">AI Interview Assistant</span> is an
          intelligent web application designed to help job seekers prepare for interviews
          in a realistic and interactive way. Instead of answering static questions, users
          engage in a real-time conversation with an AI interviewer — just like a real
          interview environment.
        </p>

        <p className="text-gray-300 text-base sm:text-lg mb-6">
          The system generates domain-specific interview questions based on the job role
          chosen by the user. The AI listens to the user’s answers using speech
          recognition, analyzes their tone, word choice, and fluency, and provides instant
          feedback. This allows users to practice communication skills and improve
          confidence before real interviews.
        </p>

        <motion.div
          className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-cyan-300/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
            <h3 className="text-cyan-300 font-semibold mb-2 text-lg">🎯 Key Objectives</h3>
            <ul className="text-gray-300 text-sm list-disc list-inside">
              <li>To help job seekers practice interviews realistically.</li>
              <li>To analyze speech, tone, and language fluency.</li>
              <li>To generate AI-driven feedback for improvement.</li>
              <li>To support various job roles and domains.</li>
            </ul>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-cyan-300/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
            <h3 className="text-cyan-300 font-semibold mb-2 text-lg">🧠 Technologies Used</h3>
            <ul className="text-gray-300 text-sm list-disc list-inside">
              <li>Next.js (React Framework)</li>
              <li>Firebase for Authentication & Data Storage</li>
              <li>Framer Motion for Animations</li>
              <li>Tailwind CSS for Styling</li>
              <li>AI APIs for Question Generation & Speech Feedback</li>
            </ul>
          </div>
        </motion.div>

        <p className="text-gray-300 text-base sm:text-lg">
          Our goal is to make interview preparation smarter, more engaging, and accessible
          for everyone. By combining <span className="text-cyan-300">Artificial Intelligence</span> and 
          <span className="text-blue-400"> Natural Language Processing</span>, we empower users to 
          learn effectively and confidently tackle real-world interviews.
        </p>
      </motion.div>

      {/* Decorative floating glows */}
      <motion.div
        className="absolute bottom-20 left-10 w-28 h-28 bg-blue-500/30 rounded-full blur-3xl"
        animate={{ y: [0, 20, -20, 0], opacity: [0.6, 1, 0.6, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-10 right-20 w-20 h-20 bg-cyan-400/40 rounded-full blur-3xl"
        animate={{ y: [0, -15, 15, 0], opacity: [1, 0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
}

