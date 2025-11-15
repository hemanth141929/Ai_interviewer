import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid, action } = body;

    if (!userid) {
      return Response.json({ error: "Missing userid" }, { status: 400 });
    }

    // ✅ 1️⃣ FETCH mode — used by the client to get questions after generation (Call 1 ends)
    if (action === "fetch") {
      const snapshot = await db
        .collection("interviews")
        .where("userid", "==", userid)
        .where("finalized", "==", true)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log("❌ No interview found for userId:", userid);
        // Ensure structure matches client expectation even if empty
        return Response.json({ questions: [], interviewId: "" }, { status: 200 }); 
      }

      const interview = snapshot.docs[0].data();
      const interviewId = snapshot.docs[0].id; // CRITICAL FIX: Get the Firestore Document ID
      const questions = interview.questions || [];
      const role = interview.role || "";
      const level = interview.level || "";
      const techstack = interview.techstack || [];

      console.log("✅ Firestore query result:", { interviewId, questions: questions.length });

      // Return both questions AND interviewId
      return Response.json({ questions, interviewId,role,level,techstack }, { status: 200 });
    }


    // ✅ 2️⃣ GENERATE mode — default behavior when Vapi's Generator Assistant calls this route
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
    const f_role = interview.role;
    const f_level = interview.level;
    const f_techstack = interview.techstack;

    return Response.json({ 
      success: true, 
      questions: generatedQuestions,
      interviewId: interviewId,
      role: f_role,
      level: f_level,
      techstack: f_techstack
    }, { status: 200 });
  } catch (error) {
    console.error("Error in vapi generate route:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}