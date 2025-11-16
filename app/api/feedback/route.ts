// app/api/feedback/route.ts
// HANDLES: GET /api/feedback?interviewId=... (Retrieves saved feedback)

import { db } from "@/firebase/admin"; 
import { NextRequest, NextResponse } from 'next/server';

// --- Interfaces (Should match data stored by POST handler) ---
interface StoredFeedbackData {
    interviewId: string;
    role: string;
    level: string;
    techstack: string;
    feedback: {
        score_out_of_10: number;
        summary: string;
        technical_feedback: string;
        behavioral_feedback: string;
        next_steps: string;
    };
    createdAt: string;
    finalScore: number;
    questions: string[];
    answers: string[];
}


export async function GET(request: NextRequest) {
    try {
        // 1. Extract interviewId from query parameters
        const { searchParams } = new URL(request.url);
        const interviewId = searchParams.get('interviewId');

        // 2. 🛑 Validation
        if (!interviewId) {
            return NextResponse.json({ success: false, error: "Missing interviewId query parameter" }, { status: 400 });
        }

        // 3. 🔍 Fetch data from Firestore
        // Collection name: "interview_results"
        const docRef = db.collection("interview_results").doc(interviewId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, error: "Interview feedback not found" }, { status: 404 });
        }

        // 4. ✅ Process and Return Data
        const data = docSnap.data() as StoredFeedbackData;

        // Structure the response exactly as the frontend expects
        const responseData = {
            success: true,
            interviewId: data.interviewId,
            role: data.role,
            level: data.level,
            techstack: data.techstack,
            feedback: data.feedback, // This contains the structured AI feedback
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error", details: String(error) },
            { status: 500 }
        );
    }
}