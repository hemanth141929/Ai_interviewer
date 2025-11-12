"use client";

import { motion } from "framer-motion";
import { FaEnvelope, FaGithub, FaLinkedin, FaPhoneAlt } from "react-icons/fa";

export default function ContactPage() {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95, rotateX: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        delay: i * 0.2,
        type: "spring",
        stiffness: 70,
      },
    }),
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
      {/* 🌌 Animated background glows */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-20 blur-3xl"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 15, -15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🧠 Title */}
      <motion.h1
        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 text-5xl font-extrabold tracking-widest mb-12 drop-shadow-[0_0_25px_rgba(0,255,255,0.4)]"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Contact Information
      </motion.h1>

      {/* ✨ Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-[90%] max-w-5xl">
        {[
          {
            icon: <FaEnvelope className="text-5xl text-cyan-300" />,
            title: "Email",
            info: "contact@example.com",
            effect: "pulse",
          },
          {
            icon: <FaPhoneAlt className="text-5xl text-cyan-300" />,
            title: "Phone",
            info: "+91 98765 43210",
            effect: "bounce",
          },
          {
            icon: <FaGithub className="text-5xl text-cyan-300" />,
            title: "GitHub",
            info: "github.com/yourusername",
            effect: "rotate",
          },
          {
            icon: <FaLinkedin className="text-5xl text-cyan-300" />,
            title: "LinkedIn",
            info: "linkedin.com/in/yourprofile",
            effect: "float",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative flex flex-col items-center justify-center text-center rounded-3xl p-8 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(0,255,255,0.4)] hover:-translate-y-1 group"
          >
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-cyan-400/30 blur-lg opacity-0 group-hover:opacity-100"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>

            <motion.div
              whileHover={{
                rotateY: 10,
                scale: 1.05,
              }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              {card.icon}
            </motion.div>

            <motion.h3
              className="text-lg font-semibold text-cyan-200 mt-4"
              whileHover={{ scale: 1.1 }}
            >
              {card.title}
            </motion.h3>
            <p className="text-gray-300 mt-1 text-sm">{card.info}</p>
          </motion.div>
        ))}
      </div>

      {/* Floating light particles */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-cyan-400/30 rounded-full blur-3xl"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-16 right-10 w-28 h-28 bg-blue-500/40 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
}