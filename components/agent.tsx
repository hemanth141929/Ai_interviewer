"use client";

import React, { useState, useEffect } from "react";
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


const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.error("Error:", error);

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
  }, []);

  useEffect(() => {
    if (messages.length > 0) setLastMessage(messages[messages.length - 1].content);

    const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
      console.log("Feedback messages:", msgs);
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") router.push("/");
      else handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, type, router]);

  const handleCall = async () => {
  try {
    setCallStatus(CallStatus.CONNECTING);

    // 🔹 Case 1: Generate Mode (still the same)
    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: { userid: userId },
      });
      console.log("Started generate flow for user:", userId);
      return;
    }

    // 🔹 Case 2: Interview Mode (Fetch questions from Firestore)
    // Fetch questions from your backend (which reads from Firestore)
    const response = await fetch("/api/vapi/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: userId, action: "fetch" }),
    });

    const data = await response.json();

    if (!data.questions || data.questions.length === 0) {
      alert("No questions found for this user.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    // Format questions nicely for Vapi Assistant
    const formattedQuestions = data.questions.map((q: string) => `- ${q}`).join("\n");

    // 🔹 Start the call with the interviewer Assistant
    await vapi.start(interviewer, {
      variableValues: { questions: formattedQuestions },
    });

    console.log("Interview started with Firestore questions for user:", userId);
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
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
      {/* Background Glow */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-30 blur-3xl top-20"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

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
