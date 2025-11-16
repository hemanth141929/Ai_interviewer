"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/actions/vapi.sdk";
import { motion } from "framer-motion";

// --- Enums and Interfaces ---

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  type: "generate" | "fetch" | string;
}

// --- Main Component ---

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  // State to manage the ID after generation for the two-call transition
  const [currentInterviewId, setCurrentInterviewId] = useState<string>('');
  

  // --- Helper function for starting the Interviewer Call (Call 2) ---
  const handleInterviewStart = useCallback(async (questions: string[], interviewId: string, role: string, level: string, techstack: string[]) => {
    // IMPORTANT: Make sure this environment variable is set in your .env file
    const Interviewer_assistant_id = process.env.NEXT_PUBLIC_VAPI_INTERVIEWER_ASSISTANT_ID!;

    try {
      const formattedQuestionsString = JSON.stringify(questions);
      // Ensure techstack is an array of strings before stringifying
      const formattedtechstackstring = JSON.stringify(techstack);
      
      setCallStatus(CallStatus.CONNECTING);
      
      await vapi.start(Interviewer_assistant_id, {
        variableValues: { 
          questions: formattedQuestionsString,
          interviewId: interviewId,
          role: role,
          level: level,
          techstack: formattedtechstackstring
        }, 
      });
      console.log(`Starting Interview Call for ID: ${interviewId}`);

    } catch (error) {
      console.error("Error starting interview call:", error);
      setCallStatus(CallStatus.INACTIVE);
      alert("Failed to start the interview. Please try again.");
    }
  }, []);

  // --- Main Vapi Event Listeners (useEffect) ---
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    
    const onMessage = (message: any) => {
      // Save final transcripts to messages state
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        if (message.role === "assistant") {
          setLastMessage(message.transcript);
        }
      }
    };
    
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("Vapi Error:", error);

    const onCallEnd = async () => {
      setCallStatus(CallStatus.INACTIVE); // Default status change
      
      // Logic for the transition from Generator (Call 1) to Interviewer (Call 2)
      if (type === "generate" && currentInterviewId === '') {
        console.log("Generation call ended. Fetching latest results by User ID...");

        try {
          // ✅ FETCH: Uses the POST method with 'action: "fetch"' and 'userid'
          const response = await fetch("/api/vapi/generate", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            // Pass the userId and the fetch action to get the most recent interview
            body: JSON.stringify({ action: "fetch", userid: userId }), 
          });

          const data = await response.json();
          const { questions, interviewId, role, level, techstack } = data; // Destructure all fields

          // Check for questions and interviewId
          if (questions?.length > 0 && interviewId) {
            setCurrentInterviewId(interviewId);
            await handleInterviewStart(questions, interviewId, role, level, techstack); // Start Call 2
          } else {
            console.error("❌ Failed to retrieve generated questions/ID. No recent interview found.");
            setCallStatus(CallStatus.INACTIVE); 
          }
        } catch (error) {
          console.error("Error fetching generated data:", error);
          setCallStatus(CallStatus.INACTIVE);
        }}
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [userId, type, currentInterviewId, handleInterviewStart, router]);

  // --- Update lastMessage from the final messages list ---
  useEffect(() => {
    if (messages.length > 0) {
      const lastTranscript = messages.filter(m => m.role === 'assistant' || m.role === 'user').pop();
      if (lastTranscript) {
        setLastMessage(lastTranscript.content);
      }
    }
  }, [messages]);

  // --- Call Initiation Handler ---
  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      if (type === "generate") {
        // Case 1: Start the GENERATOR Assistant (Call 1, hits the POST route)
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: { userid: userId },
        });
        console.log("Started generate flow for user:", userId);
        return;
      }

      // Case 2: Fetch Mode (Directly load a known interview, must have currentInterviewId set)
      if (type === "fetch" && currentInterviewId) {
        setCallStatus(CallStatus.CONNECTING);
        
        // Use the POST method with action: "fetch" and the known interview ID
        const response = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Note: If currentInterviewId is set, the backend will prioritize fetching by ID.
          body: JSON.stringify({ action: "fetch", userid: userId, interviewId: currentInterviewId }), 
        });

        const data = await response.json();
        
        if (!data.questions?.length) {
          alert("No questions found for this interview ID.");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }
        
        await handleInterviewStart(data.questions, data.interviewId, data.role, data.level, data.techstack);
        return;
      }


    } catch (err) {
      console.error("Error starting Vapi call:", err);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.INACTIVE); // Set to INACTIVE on manual disconnect
    vapi.stop();
    if (currentInterviewId) {
        console.log(`Manually ending interview. Navigating to feedback page: /feedback/${currentInterviewId}`);
        router.push(`/feedback/${currentInterviewId}`);
    } else {
        console.warn("Call ended, but currentInterviewId is missing. Navigating to home.");
        router.push("/");
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
      <div className="flex flex-col justify-center items-center gap-5 w-full h-screen">
        {/* AI & User Row */}
        <div className="flex justify-center items-center gap-8">
          <motion.div
            className="relative flex flex-col items-center justify-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 w-[260px] h-[230px] text-center shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:shadow-[0_0_60px_rgba(0,255,255,0.3)] transition-all duration-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <Image
              src="/agent_logo.jpg"
              alt="AI Interviewer"
              width={80}
              height={80}
              className="rounded-full border-4 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.4)] object-cover"
            />
            {isSpeaking && (
              <motion.span
                className="absolute top-8 left-1/2 -translate-x-1/2 h-[100px] w-[100px] rounded-full border-4 border-cyan-300 opacity-70 animate-ping"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              ></motion.span>
            )}
            <h3 className="mt-3 text-cyan-300 font-semibold uppercase tracking-widest text-sm">
              AI Interviewer
            </h3>
            <p className="text-gray-300 text-xs mt-1">
              {isSpeaking ? "Speaking..." : "Waiting for response..."}
            </p>
          </motion.div>

          <motion.div
            className="relative flex flex-col items-center justify-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 w-[260px] h-[230px] text-center shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:shadow-[0_0_60px_rgba(0,255,255,0.3)] transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Image
              src="/user_logo.jpg"
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full border-4 border-blue-400/30 shadow-[0_0_25px_rgba(0,255,255,0.3)] object-cover"
            />
            <h3 className="mt-3 text-cyan-200 font-semibold uppercase tracking-widest text-sm">
              {userName || "You"}
            </h3>
            <p className="text-gray-300 text-xs mt-1">
              {callStatus === CallStatus.ACTIVE ? "In conversation..." : "Idle"}
            </p>
          </motion.div>
        </div>

        {lastMessage && (
          <motion.div
            className="mt-3 w-[85%] max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white text-sm italic">“{lastMessage}”</p>
          </motion.div>
        )}

        <div className="flex gap-6 mt-3">
          {callStatus !== CallStatus.ACTIVE ? (
            <motion.button
              onClick={handleCall}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.FINISHED}
              className="relative px-8 py-2 font-bold text-base rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-[0_0_40px_rgba(0,255,150,0.3)] hover:shadow-[0_0_70px_rgba(0,255,150,0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start"}
              <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 blur-lg opacity-40 -z-10 animate-pulse"></span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleDisconnect}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-2 font-bold text-base rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-[0_0_40px_rgba(255,100,100,0.3)] hover:shadow-[0_0_70px_rgba(255,100,100,0.5)] transition-all duration-500"
            >
              End
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 blur-lg opacity-40 -z-10 animate-pulse"></span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;