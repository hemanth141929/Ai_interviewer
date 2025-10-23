"use client"

import { useEffect, useState } from 'react'
import React from 'react'
import Headers from '@/components/header'
import Agent from '@/components/agent'
import { auth } from '@/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

const Interview = () => {
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
      return () => unsubscribe();
  }, []);
 
  return (
    <>
    <Headers/>
    <Agent username="you" userid={uid} type="generate"/>
    </>
  )
}

export default Interview