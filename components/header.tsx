import React from 'react'
import Link from 'next/link'
const Header = () => {
  return (

    // ...
<header className="fixed left-0 right-0 py-10 z-50">
  {/* CHANGE 'justify-end' to 'justify-between' */}
  <nav className="container flex items-center justify-between mx-auto"> 
    {/* This logo link will now be on the far left */}
    <Link href="/">
      <img src="/logo.jpg" alt="" className='w-20 rounded-full' />
    </Link>
    {/* Wrap the rest of the links in a div to manage their gap/layout */}
    <div className="flex gap-20 px-50"> 
      <Link href="/" className=" uppercase font-semibold text-white tracking-widest hover:text-shadow-[0_0_10px_#3b82f6,0_0_20px_#3b82f6] transition duration-300">
        Home
      </Link>
      <Link href="/contact" className="uppercase font-semibold text-white tracking-widest hover:text-shadow-[0_0_10px_#3b82f6,0_0_20px_#3b82f6] transition duration-300">
        Contact Us
      </Link>
      <Link href="/about" className="uppercase font-semibold text-white tracking-widest hover:text-shadow-[0_0_10px_#3b82f6,0_0_20px_#3b82f6] transition duration-300">
        About
      </Link>
    </div>
  </nav>
</header>
// ...
  )
}

export default Header