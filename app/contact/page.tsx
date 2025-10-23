import Header from '@/components/header'
import React from 'react'

const Contact = () => {
  return (
    <>
    <Header/>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Contact Us</h1>

        <p className="text-gray-600 mb-8">
          We’d love to hear from you! Whether you have questions, feedback, or
          partnership ideas — feel free to reach out to us anytime using the
          details below.
        </p>

        <div className="space-y-4 text-gray-700">
          <div>
            <h2 className="text-lg font-medium text-gray-800">📧 Email</h2>
            <p>support@example.com</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-800">📞 Phone</h2>
            <p>+91 98765 43210</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-800">🏢 Address</h2>
            <p>123 Innovation Street, Bengaluru, India</p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-800">🕒 Support Hours</h2>
            <p>Mon–Fri: 9:00 AM – 6:00 PM (IST)</p>
            <p>Sat: 10:00 AM – 2:00 PM</p>
            <p>Sun: Closed</p>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            🌐 Follow Us
          </h2>
          <div className="flex justify-center space-x-6 text-blue-600 font-medium">
            <a href="https://twitter.com/example" className="hover:underline">
              Twitter
            </a>
            <a href="https://linkedin.com/company/example" className="hover:underline">
              LinkedIn
            </a>
            <a href="https://instagram.com/exampleapp" className="hover:underline">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Contact