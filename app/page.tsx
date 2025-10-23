"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [uid, setUid] = useState(null);
  

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User UID:", user.uid);
        setUid(user.uid);
      } else {
        console.log("No user is signed in");
        setUid(null);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <div
        className="border border-solid border-gray-300 p-4 shadow w-200 h-150 flex justify-center items-center mx-auto my-auto rounded-3xl"
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: "0.8",
          background: "linear-gradient(to right, #1e3a8a, #3b82f6)",
          borderWidth: "4px",
        }}
      >
        <h1
          className="uppercase text-white absolute top-20 left-60 font-semibold text-5xl"
          style={{ textShadow: "5px 5px 6px rgba(0, 0, 0, 0.8)" }}
        >
          ai assistant
        </h1>
        <p className="text-white absolute top-40 text-xl">
          Ace your next Interview with personalized AI feedback
        </p>
        <Link href="/interview">
          <button className="bg-white text-blue-700 font-bold py-2 px-6 rounded-full shadow-lg absolute bottom-10 left-1/2 transform -translate-x-1/2 hover:bg-blue-100 transition cursor-pointer">
            Start Interview
          </button>
        </Link>
      </div>

    </>
    
  );
}
