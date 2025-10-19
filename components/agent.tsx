import React from 'react'
import Headers from '@/components/header'

const agent = ({userName}: AgentProps) => {

    const isSpeaking = true;
    const messages = [
        "what is your name?",
        "my name is AI assistant.",
    ];
    const lastMessage = messages[messages.length - 1];



  return (
    <>
    <div className='flex justify-center items-center w-[400px] h-[300px] bg-gradient-to-r from-blue-500 to-cyan-500 border-3 border-white rounded-lg p-6 fixed top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl'>
    <div><img src="/agent_logo.jpg" alt="vapi" className='w-[100px] h-[100px] rounded-full object-cover '/>
        {isSpeaking && (
            <div className="absolute inset-0 flex justify-center items-center">
            <span className="animate-ping absolute inline-flex h-[120px] w-[120px] rounded-full bg-white opacity-75"></span>
            <span className="absolute inline-flex h-[120px] w-[120px] rounded-full border-2 border-white"></span>
            </div>
        )}</div>
        <h3 className="uppercase text-white font-semibold tracking-widest absolute bottom-5">ai interviewer</h3>
    </div>




    <div className='flex justify-center items-center w-[400px] h-[300px] bg-gradient-to-r from-blue-500 to-cyan-500 border-3 border-white rounded-lg p-6 fixed top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl'>
     <div><img src="/user_logo.jpg" alt="vapi" className='w-[100px] h-[100px] rounded-full object-cover '/>
        {isSpeaking && (
            <div className="absolute inset-0 flex justify-center items-center">
            <span className="animate-ping absolute inline-flex h-[120px] w-[120px] rounded-full bg-white opacity-75"></span>
            <span className="absolute inline-flex h-[120px] w-[120px] rounded-full border-2 border-white"></span>
            </div>
        )}</div>
        <h3 className="uppercase text-white font-semibold tracking-widest absolute bottom-5">{userName}</h3>
    </div>   

        {messages.length > 0 && (
            <div className='w-[800px] h-[50px] bg-opacity-50 border-3 border-white rounded-lg p-3 fixed top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-3xl shadow-black shadow-2xl'>
                <p className='text-white text-center uppercase font-semibold tracking-widest'>{lastMessage}</p>
            </div>
        )}

    <div className='w-full flex justify-center'>
        <button className='bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg absolute bottom-10 left-1/2 transform -translate-x-1/2 hover:bg-red-500 transition cursor-pointer'>End</button>
    </div>
    </>
  )
}

export default agent