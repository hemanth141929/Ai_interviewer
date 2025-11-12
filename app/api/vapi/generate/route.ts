import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin"; // no need for auth unless you're verifying a real token

export async function GET() {
  return Response.json(
    { success: true, data: "vapi generate route works!" },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    if (!userid) {
      console.error("No userId received in request body");
      return Response.json({ error: "Missing userid" }, { status: 400 });
    }

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is ${amount}.
      Please return only the questions, without any additional text.
      The questions are going to be read by a voice assistant, so do not use "/" or "*" or any other special characters.
      Return the questions formatted like this:
      ["question 1","question 2","question 3",...,"question n"]
      Thank you! <3`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid, // ✅ using the userid from request body
      finalized: true,
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in vapi generate route:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
