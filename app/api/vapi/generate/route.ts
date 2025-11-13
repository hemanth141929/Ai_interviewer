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

    // ✅ 1️⃣ FETCH mode — when Assistant wants existing questions
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
    return Response.json({ questions: [] }, { status: 200 });
  }

  const interview = snapshot.docs[0].data();
  console.log("✅ Firestore query result:", interview);

  const questions = interview.questions || [];
  console.log("🧠 Extracted questions:", questions);

  return Response.json({ questions }, { status: 200 });
}


    // ✅ 2️⃣ GENERATE mode — default behavior
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
    const generatedQuestions = JSON.parse(questions);
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

    // Get the unique ID from the DocumentReference
    const interviewId = docRef.id;

   return Response.json({ 
    success: true, 
    questions: generatedQuestions,
    interviewId: interviewId // <--- Return the questions here!
}, { status: 200 });
  } catch (error) {
    console.error("Error in vapi generate route:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
