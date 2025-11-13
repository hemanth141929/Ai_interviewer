"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo / Brand */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_25px_rgba(0,255,255,0.6)]"></div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 text-lg font-bold tracking-wide">
              AI<span className="text-white">nterview</span>
            </h1>
          </motion.div>

          {/* Navbar Links */}
          <motion.ul
            className="hidden md:flex space-x-8 text-sm font-semibold tracking-wider"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <li>
              <Link
                href="/"
                className="text-cyan-200 hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.9)] transition-all"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/sign-in"
                className="text-cyan-200 hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.9)] transition-all"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-cyan-200 hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.9)] transition-all"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-cyan-200 hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.9)] transition-all"
              >
                Contact
              </Link>
            </li>
          </motion.ul>

          {/* Mobile Menu Icon */}
          <div className="md:hidden text-cyan-300 font-bold text-xl">☰</div>
        </div>
      </nav>
  );
};

export default Header;
