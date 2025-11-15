import { google } from "@ai-sdk/google";
import { generateText } from "ai";
// Ensure this path correctly points to your initialized Firestore Admin SDK
import { db } from "@/firebase/admin"; 

// --- Interfaces ---

// The Answer type is now just a string, corresponding to the new 'answers' array
type AnswerText = string; 

interface FeedbackRequestBody {
  interviewId: string;
  // Two separate string arrays: one for questions, one for corresponding answers
  questions: string[]; 
  answers: AnswerText[]; // <-- Changed to a simple array of strings
  role: string;
  level: string;
  techstack: string;
}

export async function POST(request: Request) {
  try {
    const body: FeedbackRequestBody = await request.json();
    // Destructure as separate arrays
    const { interviewId, answers, questions, role, level, techstack } = body;

    // 1. 🛑 Validation
    // Now also validate that the two arrays have the same length
    if (!interviewId || !answers || answers.length === 0 || !questions || questions.length === 0 || !role || answers.length !== questions.length) {
      return Response.json({ error: "Missing required interview data or array length mismatch" }, { status: 400 });
    }

    // 2. 📝 Format the answers for the Gemini prompt
    // Combine questions (from questions array) and answers (from answers array) using a loop
    const formattedTranscript = questions.map((question, index) => 
      `### Question ${index + 1}:\n${question}\n\n### User Answer:\n${answers[index]}`
    ).join('\n\n---\n\n');


    // 3. 🧠 Generate Feedback using Gemini (Prompt remains the same)
    const systemInstruction = `You are an expert technical interviewer and performance reviewer. Your task is to analyze the provided interview transcript and generate comprehensive, constructive feedback.`;

    const prompt = `
      Analyze the following interview session for a ${level} ${role} role focusing on the ${techstack} stack.

      --- INTERVIEW TRANSCRIPT ---
      ${formattedTranscript}
      --- END OF TRANSCRIPT ---

      Generate the final output in **STRICT, VALID, RFC 8259 JSON format**. Do not include any text outside the JSON object.

      {
        "score_out_of_10": [A single integer number from 1 to 10],
        "summary": "[A concise, one-paragraph summary of the user's overall performance]",
        "technical_feedback": "[A bulleted list of 3-5 specific technical strengths and weaknesses]",
        "behavioral_feedback": "[A bulleted list of 3-5 specific communication and soft skill observations]",
        "next_steps": "[A short paragraph suggesting 2-3 concrete steps the user should take to improve their skills and interview performance]"
      }
    `;
    
    const { text: geminiResponse } = await generateText({
      model: google("gemini-2.5-flash"), 
      system: systemInstruction,
      prompt: prompt,
    });
    
    // 4. ⚙️ Safety Check and Parsing (Retaining your cleanup logic)
    let feedbackObject: any;
    try {
        const jsonMatch = geminiResponse.trim().match(/^{([\s\S]*)}$/); 
        let cleanedResponse = geminiResponse;
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        } else {
          cleanedResponse = geminiResponse.trim().replace(/^```json\s*|[\s\n]*```$/g, '');
        }
        feedbackObject = JSON.parse(cleanedResponse); 
    } catch (e) {
        console.error("Failed to parse AI generated JSON feedback:", geminiResponse);
        return Response.json({ error: "Invalid JSON response from AI model", rawResponse: geminiResponse }, { status: 500 });
    }

    // 5. 💾 Store Transcript Data 
    // Store both arrays for complete logging
    const transcriptData = {
      interviewId: interviewId,
      role: role,
      level: level,
      techstack: techstack,
      questions: questions, 
      answers: answers,     // Stored as a simple array of strings
      feedback: feedbackObject, 
      createdAt: new Date().toISOString(),
      finalScore: feedbackObject.score_out_of_10,
    };
    
    await db.collection("interview_results").doc(interviewId).set(transcriptData);
    
    console.log(`✅ Feedback and transcript successfully saved to 'interview_results' collection with ID: ${interviewId}`);

    // 6. ✅ Return the final structured feedback
    return Response.json({ 
      success: true, 
      feedback: feedbackObject,
      interviewId: interviewId
    }, { status: 200 });

  } catch (error) {
    console.error("Error generating feedback:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}