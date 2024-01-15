"use client"

import { Inter } from 'next/font/google'
import './globals.css'

import React, { useState } from 'react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({children}: {children: React.ReactNode}) {

  const [menuVisible, setMenuVisible] = useState(false)

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4 z-10">
          <nav className="flex justify-between">
            <button onClick={toggleMenu} className="hamburger">
              ≡
            </button>
            <div className={`absolute inset-y-0 left-0 transform ${menuVisible ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-800 transition duration-300 ease-in-out top-12`}>
              <Link href="/household" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                Household
              </Link>
              <Link href="/schedule" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                Schedule
              </Link>
              <Link href="/statistics" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                Statistics
              </Link>
              <Link href="/wiki" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                Wiki
              </Link>
              <Link href="/setting" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                Setting
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
