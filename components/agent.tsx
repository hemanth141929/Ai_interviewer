"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/actions/vapi.sdk";
import { interviewer } from "@/constants";
import { motion } from "framer-motion";

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

// Assuming AgentProps is defined elsewhere and includes userId, type, etc.
interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "fetch" | string;
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  type,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  
  // State to manage the questions and ID after generation
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentInterviewId, setCurrentInterviewId] = useState<string>(''); // Used to track if generation is complete

// --- Helper function for starting the interview call (Call 2) ---
  const handleInterviewStart = useCallback(async (questions: string[], interviewId: string) => {
  const Interviewer_assistant_id = process.env.NEXT_PUBLIC_VAPI_INTERVIEWER_ASSISTANT_ID!;
    try {
      const formattedQuestions = questions.map((q: string) => `- ${q}`).join("\n");
      
      setCallStatus(CallStatus.CONNECTING);
      
      // Start the second call with the Interviewer Assistant
      await vapi.start(interviewer, {
        variableValues: { 
          questions: formattedQuestions,
          interviewId: interviewId // Pass the ID to the Vapi Assistant
        }, 
      });
      console.log(`Starting Interview Call for ID: ${interviewId}`);

    } catch (error) {
      console.error("Error starting interview call:", error);
      setCallStatus(CallStatus.INACTIVE);
      alert("Failed to start the interview. Please try again.");
    }
  }, [interviewer]);


// --- useEffect for Vapi Event Listeners ---
  useEffect(() => {
  console.log("interview id",currentInterviewId)
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("Error:", error);


    const onCallEnd = async () => {
      // Check if the GENERATE call just ended and we haven't started the interview yet
      if (type === "generate" && currentInterviewId === '') {
        console.log("Generation call ended. Fetching results to start interview...");

        // 1. Fetch the newly created questions and ID from your backend
        const response = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Use 'action: "fetch"' to get the latest saved interview record
          body: JSON.stringify({ userid: userId, action: "fetch" }), 
        });

        const data = await response.json();

        if (data.questions && data.questions.length > 0 && data.interviewId) {
          // 2. Store the data in state
          setInterviewQuestions(data.questions);
          setCurrentInterviewId(data.interviewId);

          // 3. Immediately start the second Vapi call (The Interview)
          await handleInterviewStart(data.questions, data.interviewId);

        } else {
          console.error("❌ Failed to retrieve generated questions/ID.");
          setCallStatus(CallStatus.INACTIVE); 
        }
      } else {
        // Condition: The final interview call has ended, or it was a non-generate flow.
        setCallStatus(CallStatus.FINISHED);
      }
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
  }, [userId, type, currentInterviewId, handleInterviewStart]); // Added dependencies


// --- useEffect for Message/Status updates (Kept mostly as is) ---
  useEffect(() => {
    if (messages.length > 0) setLastMessage(messages[messages.length - 1].content);

    const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
      console.log("Feedback messages:", msgs);
      // You would use currentInterviewId here to save the feedback linked to the interview
      if (currentInterviewId) {
        console.log(`Ready to save feedback for ID: ${currentInterviewId}`);
        // API call to save feedback using currentInterviewId
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      // Only redirect after the interview (the second call) is finished.
      if (type === "generate" && currentInterviewId) {
        handleGenerateFeedback(messages); // Get final feedback
        router.push(`/feedback/${currentInterviewId}`); // Example redirect to feedback page
      } else if (type !== "generate") {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, router, currentInterviewId]); // Added currentInterviewId

// --- handleCall Function (Initiates Call 1 or Call 2 directly) ---
  const handleCall = async () => {
  try {
    setCallStatus(CallStatus.CONNECTING);

    // 🔹 Case 1: Generate Mode (Start the GENERATOR Assistant)
    // This assistant collects user input, calls your API, and ENDS the call.
    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: { userid: userId },
      });
      console.log("Started generate flow for user:", userId);
      return;
    }

    // 🔹 Case 2: Interview Mode (Fetch existing questions and start interview directly)
    // Fetch questions from your backend (which reads from Firestore)
    const response = await fetch("/api/vapi/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: userId, action: "fetch" }),
    });

    const data = await response.json();

    if (!data.questions || data.questions.length === 0 || !data.interviewId) {
      alert("No questions found for this user.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }
    
    // Start the interview call directly
    await handleInterviewStart(data.questions, data.interviewId);

  } catch (err) {
    console.error("Error starting Vapi call:", err);
    setCallStatus(CallStatus.INACTIVE);
  }
};
;

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    // ... (JSX remains the same)
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
      {/* ... */}
      {/* Main Content - Centered */}
      <div className="flex flex-col justify-center items-center gap-5 w-full h-screen">
        {/* AI & User Row */}
        <div className="flex justify-center items-center gap-8">
          {/* AI Interviewer Card */}
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
              {isSpeaking ? "Listening carefully..." : "Waiting for response..."}
            </p>
          </motion.div>

          {/* User Card */}
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

        {/* Message Box */}
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

        {/* Control Buttons */}
        <div className="flex gap-6 mt-3">
          {callStatus !== CallStatus.ACTIVE ? (
            <motion.button
              onClick={handleCall}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-2 font-bold text-base rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-[0_0_40px_rgba(0,255,150,0.3)] hover:shadow-[0_0_70px_rgba(0,255,150,0.5)] transition-all duration-500"
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