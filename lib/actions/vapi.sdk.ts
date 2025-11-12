import Vapi from '@vapi-ai/web';
console.log("🔑 VAPI KEY:", process.env.NEXT_PUBLIC_vAPI_WEB_TOKEN);
export const vapi = new Vapi(process.env.NEXT_PUBLIC_vAPI_WEB_TOKEN!);