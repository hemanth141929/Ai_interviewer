"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/actions/vapi.sdk";
import { interviewer } from "@/constants";
// import { createFeedback } from "@/lib/actions/general.action";

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

  // --- VAPI Event Handlers ---
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
    const onError = (error: Error) => console.log("Error:", error);

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

  // --- Handle new messages and call end ---
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      // const { success, feedbackId: id } = await createFeedback({
      //   interviewId: interviewId!,
      //   userId: userId!,
      //   transcript: messages,
      //   feedbackId,
      // });

      // if (success && id) {
      //   router.push(`/interview/${interviewId}/feedback`);
      // } else {
      //   console.log("Error saving feedback");
      //   router.push("/");
      // }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  // --- Start & End Call ---
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: { username: userName, userid: userId },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: { questions: formattedQuestions },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  // ---------------- UI ----------------
  return (
    <>
      {/* AI Interviewer Card */}
      <div className="flex justify-center items-center w-[400px] h-[300px] bg-gradient-to-r from-blue-500 to-cyan-500 border-3 border-white rounded-lg p-6 fixed top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl">
        <div className="relative">
          <Image
            src="/agent_logo.jpg"
            alt="AI Agent"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          {isSpeaking && (
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="animate-ping absolute inline-flex h-[120px] w-[120px] rounded-full bg-white opacity-75"></span>
              <span className="absolute inline-flex h-[120px] w-[120px] rounded-full border-2 border-white"></span>
            </div>
          )}
        </div>
        <h3 className="uppercase text-white font-semibold tracking-widest absolute bottom-5">
          AI Interviewer
        </h3>
      </div>

      {/* User Card */}
      <div className="flex justify-center items-center w-[400px] h-[300px] bg-gradient-to-r from-blue-500 to-cyan-500 border-3 border-white rounded-lg p-6 fixed top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl">
        <div className="relative">
          <Image
            src="/user_logo.jpg"
            alt="User"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          {isSpeaking && (
            <div className="absolute inset-0 flex justify-center items-center">
              <span className="animate-ping absolute inline-flex h-[120px] w-[120px] rounded-full bg-white opacity-75"></span>
              <span className="absolute inline-flex h-[120px] w-[120px] rounded-full border-2 border-white"></span>
            </div>
          )}
        </div>
        <h3 className="uppercase text-white font-semibold tracking-widest absolute bottom-5">
          {userName}
        </h3>
      </div>

      {/* Last Message Display */}
      {lastMessage && (
        <div className="w-[800px] h-[50px] bg-opacity-50 border-3 border-white rounded-lg p-3 fixed top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl">
          <p className="text-white text-center uppercase font-semibold tracking-widest">
            {lastMessage}
          </p>
        </div>
      )}

      {/* End / Call Button */}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button
            onClick={handleCall}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-lg absolute bottom-10 left-1/2 transform -translate-x-1/2 hover:bg-green-500 transition cursor-pointer"
          >
            {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Call"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg absolute bottom-10 left-1/2 transform -translate-x-1/2 hover:bg-red-500 transition cursor-pointer"
          >
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
