"use client";

import React from "react";
import { motion } from "framer-motion";

// No Card, Button, or icon libraries used — everything is Tailwind-based

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/30">
          <div className="p-8">

            {/* Header Section */}
            <div className="flex flex-col items-center gap-4">
              
              {/* Name */}
              <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-2">
                👤 John Doe
              </h1>

              {/* Bio */}
              <p className="text-white/80 text-center max-w-sm">
                Passionate Web Developer specializing in frontend technologies,
                UI/UX, and building modern web experiences.
              </p>
            </div>

            {/* Information Section */}
            <div className="mt-8 space-y-4">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md"
              >
                📧
                <span className="text-white text-lg">
                  john.doe@example.com
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md"
              >
                📞
                <span className="text-white text-lg">+91 9876543210</span>
              </motion.div>
            </div>

            {/* Edit Button */}
            <div className="mt-8 flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button className="px-6 py-3 text-lg font-semibold rounded-xl shadow-lg bg-white text-purple-600 flex items-center gap-2">
                  ✏️ Edit Profile
                </button>
              </motion.div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
