// app/api/feedback/generate/route.ts
// HANDLES: POST /api/feedback/generate (Generates and saves new feedback)

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin"; // Ensure this path is correct

// --- Interfaces ---

type AnswerText = string; 

interface FeedbackRequestBody {
    interviewId: string;
    // Two separate string arrays: one for questions, one for corresponding answers
    questions: string[]; 
    answers: AnswerText[]; 
    role: string;
    level: string;
    techstack: string;
}

export async function POST(request: Request) {
    try {
        const body: FeedbackRequestBody = await request.json();
        const { interviewId, answers, questions, role, level, techstack } = body;

        // 1. 🛑 Validation
        if (!interviewId || !answers || answers.length === 0 || !questions || questions.length === 0 || !role || answers.length !== questions.length) {
            return Response.json({ error: "Missing required interview data or array length mismatch" }, { status: 400 });
        }

        // 2. 📝 Format the answers for the Gemini prompt
        const formattedTranscript = questions.map((question, index) => 
            `### Question ${index + 1}:\n${question}\n\n### User Answer:\n${answers[index]}`
        ).join('\n\n---\n\n');


        // 3. 🧠 Generate Feedback using Gemini
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
        
        // 4. ⚙️ Safety Check and Parsing
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
        const transcriptData = {
            interviewId: interviewId,
            role: role,
            level: level,
            techstack: techstack,
            questions: questions, 
            answers: answers,
            feedback: feedbackObject, 
            createdAt: new Date().toISOString(),
            finalScore: feedbackObject.score_out_of_10,
        };
        
        // Store in the 'interview_results' collection
        await db.collection("interview_results").doc(interviewId).set(transcriptData);
        
        console.log(`✅ Feedback and transcript successfully saved with ID: ${interviewId}`);

        // 6. ✅ Return the final structured feedback
        return Response.json({ 
            success: true, 
            feedback: feedbackObject,
            role: role,
            level: level,
            techstack: techstack,
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