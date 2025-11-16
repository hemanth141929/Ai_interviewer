"use client"; // Needs to be a Client Component to use useEffect and useState

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/header"; 

// --- Data Interfaces ---
interface AiFeedback {
    score_out_of_10: number; 
    summary: string;
    technical_feedback: string;
    behavioral_feedback: string;
    next_steps: string;
}

interface FeedbackResponse {
    success: boolean;
    feedback: AiFeedback;
    role: string;
    level: string;
    techstack: string;
    interviewId: string;
}

// --- Helper Functions ---

const parseBulletPoints = (text: string | null | undefined): string[] => {
    // FIX: Add safety check for null/undefined/non-string input
    const safeText = typeof text === 'string' ? text : '';
    
    // The regex handles common bullet points (*, -, 1.)
    return safeText.split(/[\*\-]|^\d+\./gm)
        .map(line => line.trim())
        .filter(line => line.length > 5); // Filter out short or empty lines
};

const GlassPanel: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <motion.div
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-4 border-b border-cyan-400/30 pb-2">
            {title}
        </h3>
        {children}
    </motion.div>
);

// --- Main Page Component ---
interface FeedbackPageProps {
    params: {
        interviewId: string;
    };
}

export default function InterviewFeedbackPage({ params }: FeedbackPageProps) {
    // Extract interviewId from the dynamic route parameter
    const interviewId = params.interviewId; 

    const [feedbackResponse, setFeedbackResponse] = useState<FeedbackResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic ---
    useEffect(() => {
        if (!interviewId) {
            setLoading(false);
            setError("No interview ID provided to fetch feedback.");
            return;
        }

        // CORRECT ENDPOINT based on your folder structure app/api/feedback/route.ts
        const FEEDBACK_GET_ENDPOINT = `/api/feedback?interviewId=${interviewId}`;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(FEEDBACK_GET_ENDPOINT);

                if (!response.ok) {
                    // Check for 404 specifically
                    if (response.status === 404) {
                        throw new Error("Interview feedback not found in the database.");
                    }
                    throw new Error(`Server returned status ${response.status}`);
                }

                const data: FeedbackResponse = await response.json();

                if (data.success && data.feedback) {
                    setFeedbackResponse(data);
                } else {
                    setError("Received incomplete or unsuccessful data from API.");
                }
            } catch (e) {
                console.error("Fetch error:", e);
                setError(`Failed to retrieve analysis. Details: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [interviewId]);

    // --- Loading State ---
    if (loading) {
        return (
            <>
                <Header />
                <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
                    <motion.div
                        className="w-16 h-16 border-4 border-t-4 border-cyan-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="ml-4 text-cyan-300 text-lg">Generating Analysis...</p>
                </div>
            </>
        );
    }

    // --- Error State ---
    if (error || !feedbackResponse) {
        return (
            <>
                <Header />
                <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white p-6 text-center">
                    <h1 className="text-4xl text-red-400">Analysis Not Found</h1>
                    <p className="mt-4 text-blue-200">
                        {error || "We could not retrieve the feedback for this interview. Please check the ID."}
                    </p>
                    <Link href="/">
                        <button className="mt-8 px-8 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition">
                            Go Home
                        </button>
                    </Link>
                </div>
            </>
        );
    }

    // --- Display State ---
    const { feedback, role, level, techstack } = feedbackResponse;
    
    const technicalPoints = parseBulletPoints(feedback.technical_feedback);
    const behavioralPoints = parseBulletPoints(feedback.behavioral_feedback);


    return (
        <>
            <Header />
            <div className="relative flex flex-col justify-start items-center min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-blue-950 text-white">
                {/* Background elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent animate-gradientMove"></div>
                <motion.div
                    className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-30 blur-3xl top-1/4 right-1/4"
                    animate={{ x: [0, 40, -40, 0], y: [0, -40, 40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Main Content Container */}
                <motion.div
                    className="relative z-10 flex flex-col items-center p-6 md:p-12 mt-20 mb-10 max-w-4xl w-[95%] space-y-8"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    {/* Header */}
                    <h1 className="uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 text-4xl sm:text-5xl font-extrabold tracking-widest drop-shadow-lg text-center">
                        Interview Analysis Complete
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Role: **{level} {role}** | Tech Stack: **{techstack}** | Score: **{feedback.score_out_of_10}/10**
                    </p>
                    <div className="w-full h-1 bg-cyan-400/30 rounded-full shadow-lg"></div>

                    {/* Overall Summary Panel */}
                    <GlassPanel title="Overall Summary">
                         <p className="text-blue-100 italic">{feedback.summary}</p>
                    </GlassPanel>

                    {/* Key Metrics Section */}
                    <GlassPanel title="Performance Metrics">
                        <div className="flex justify-around items-center text-center">
                            <div>
                                <motion.p
                                    className="text-6xl font-extrabold text-cyan-400 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                >
                                    {feedback.score_out_of_10}
                                    <span className="text-3xl">/10</span>
                                </motion.p>
                                <p className="text-blue-200 mt-2">Final AI Score</p>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Technical Feedback Panel */}
                    <GlassPanel title="⚙️ Technical Deep Dive">
                        <ul className="list-disc list-inside space-y-2 text-blue-100">
                            {technicalPoints.map((s, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i + 0.5 }}
                                    className={`pl-2 border-l-4 ${s.toLowerCase().includes('strength') || s.toLowerCase().includes('good') ? 'border-green-500/80' : 'border-yellow-500/80'}`}
                                >
                                    {s}
                                </motion.li>
                            ))}
                        </ul>
                    </GlassPanel>

                    {/* Behavioral Feedback Panel */}
                    <GlassPanel title="🗣️ Communication & Soft Skills">
                        <ul className="list-disc list-inside space-y-2 text-blue-100">
                            {behavioralPoints.map((w, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i + 0.7 }}
                                    className="pl-2 border-l-4 border-blue-500/80"
                                >
                                    {w}
                                </motion.li>
                            ))}
                        </ul>
                    </GlassPanel>

                    {/* Next Steps Panel */}
                    <GlassPanel title="🚀 Recommended Next Steps">
                        <p className="text-blue-100">{feedback.next_steps}</p>
                    </GlassPanel>

                    {/* Retake CTA Button */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pt-8">
                        <Link href="/interview">
                            <button
                                type="button"
                                className="relative px-10 py-4 font-semibold text-lg rounded-full text-cyan-100 bg-gradient-to-r from-blue-500 to-cyan-400 overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-300 hover:shadow-[0_0_70px_rgba(0,255,255,0.6)] cursor-pointer"
                            >
                                <span className="relative z-10">Practice Another Interview</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-lg opacity-40 -z-10 animate-pulse"></span>
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}