import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin";



export async function GET(){
    return Response.json({success: true,data: "vapi generate route works!"},{status:200});
}

export async function POST(request: Request){
    const{type, role, level, techstack, amount, userid} = await request.json();

    try {
        const {text:questions} = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt:`Prepare questions for a job interview.
            the jobe role is ${role}.
            the job exprerience level is ${level}.
            the tech stack used in the job is ${techstack}.
            the focus between behavioural and technical questions should lean towards: ${type}.
            the amount of questions required is ${amount}.
            please return only the questions,without any additional text.
            the questions are going to be read by a voice assistant so don not use "/"or "*"or  any other special characters which might break the voice assistant reading.
            return the questions formatted like this:
            ["question 1","question 2","question 3",...,"question n"]
            Thank you! <3`,
        })
        const interview={
            role,type,level,
            techstack:techstack.split(','),
            questions:JSON.parse(questions),
            userid,
            finalized:true,
            createdAt:new Date().toISOString(),
        }
        await db.collection('interviews').add(interview);
        return Response.json({success:true},{status:200});
    } catch (error) {
        console.error("Error in vapi generate route:", error);
        return Response.json({success: false, error: 'Internal Server Error'}, {status: 500});
    }
}