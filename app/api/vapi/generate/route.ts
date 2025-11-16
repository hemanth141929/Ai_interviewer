// /api/vapi/generate/route.ts

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure all expected fields, including the optional 'action'
    const { type, role, level, techstack, amount, userid, action, interviewId: receivedInterviewId } = body; 

    if (!userid) {
      // userid is required for both generation and fetching the latest interview
      return Response.json({ error: "Missing required identifier (userid)" }, { status: 400 });
    }

    // ➡️ 1️⃣ FETCH mode (Client uses this to get the latest interview by UserID)
    if (action === "fetch") {
      console.log("Fetching latest interview for User ID:", userid);
      
      // Query Firestore for the most recent, finalized interview for this user
      const snapshot = await db
        .collection("interviews")
        .where("userId", "==", userid)
        .where("finalized", "==", true)
        .orderBy("createdAt", "desc")
        .limit(1) // <-- Ensures only the most recent one is returned
        .get();

      if (snapshot.empty) {
        console.log("❌ No recent interview found for userId:", userid);
        return Response.json({ questions: [], interviewId: "" }, { status: 200 }); 
      }
      
      const docSnapshot = snapshot.docs[0];
      const interview = docSnapshot.data();
      const interviewIdToUse = docSnapshot.id; // CRITICAL: Get the Firestore ID

      const questions = interview?.questions || [];
      const role = interview?.role || "";
      const level = interview?.level || "";
      const techstack = interview?.techstack || [];

      console.log("✅ Firestore query result: Found interview ID:", interviewIdToUse);

      // Return the complete data set
      return Response.json({ 
          questions, 
          interviewId: interviewIdToUse, 
          role, 
          level, 
          techstack 
      }, { status: 200 });
    }


    // ➡️ 2️⃣ GENERATE mode (Vapi uses this for the initial generation)
    console.log("Starting AI question generation...");
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is ${amount}.
      Please return only the questions, without any additional text.
      Return questions formatted like this: ["question 1","question 2","question 3",...]
      Thank you!`,
    });
    
    // Safety check for JSON parsing
    let generatedQuestions = [];
    try {
      generatedQuestions = JSON.parse(questions);
    } catch (e) {
      console.error("Failed to parse AI generated questions JSON:", questions);
      return Response.json({ error: "Invalid response from AI model" }, { status: 500 });
    }

    // Save to Firestore
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: generatedQuestions,
      userId: userid,
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);
    const interviewId = docRef.id;
    
    // Return data to Vapi (Vapi confirms success with this 200)
    return Response.json({ 
      success: true, 
      questions: generatedQuestions,
      interviewId: interviewId, 
      role: interview.role,
      level: interview.level,
      techstack: interview.techstack
    }, { status: 200 });
  } catch (error) {
    console.error("Error in vapi generate route:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}