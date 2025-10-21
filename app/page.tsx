import Link from "next/link";
import Header from "../components/header";
import { redirect } from "next/navigation";
export default function Home() {
  redirect('/sign-in');
  return (
    <>
    <Header/>
    <div 
      className="border border-solid border-gray-300 p-4 shadow w-200 h-150 flex justify-center items-center mx-auto my-auto rounded-3xl" 
      style={{ 
      position: "absolute", 
      top: "55%", 
      left: "50%", 
      transform: "translate(-50%, -50%)", 
      opacity: '0.8', 
      background: "linear-gradient(to right, #1e3a8a, #3b82f6)",
      borderWidth:"4px"
      }}
    >
      <h1 className="uppercase text-white absolute top-20 left-60 font-semibold text-5xl" style={{ textShadow: "5px 5px 6px rgba(0, 0, 0, 0.8)" }}>ai assistant</h1>
      <p className="text-white absolute top-40 text-xl">Ace your next Interview with personalized AI feedback</p>
      <Link href="/interview">
        <button
          className="bg-white text-blue-700 font-bold py-2 px-6 rounded-full shadow-lg absolute bottom-10 left-1/2 transform -translate-x-1/2 hover:bg-blue-100 transition cursor-pointer"
        >
          Start Interview
        </button>
      </Link>
    </div>
    </>
  );
}
