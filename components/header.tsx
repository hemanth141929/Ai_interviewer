"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 w-full 
      bg-gradient-to-r from-blue-900 via-cyan-700 to-blue-900 
      shadow-[0_0_25px_rgba(0,255,255,0.2)] border-b border-cyan-400/20"
      style={{ minHeight: "90px" }} // 🟦 Makes the navbar taller & full
    >
      <nav className="w-full flex items-center justify-between px-10 py-4 max-w-[1600px] mx-auto">
        {/* 🔹 Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-[0_0_25px_rgba(0,255,255,0.6)] group-hover:scale-110 transition-transform duration-300" />
          <span className="text-2xl font-extrabold tracking-wide">
            <span className="text-cyan-300">AI</span>
            <span className="text-white">nterview</span>
          </span>
        </Link>

        {/* 🌐 Navigation Links */}
        <ul className="hidden md:flex space-x-12 text-[16px] font-semibold tracking-wider">
          {[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
          ].map((link) => (
            <motion.li
              key={link.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 250 }}
            >
              <Link
                href={link.href}
                className="relative text-cyan-100 hover:text-white transition-colors duration-300"
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 hover:w-full"></span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
