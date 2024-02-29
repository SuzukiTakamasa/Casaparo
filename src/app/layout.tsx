"use client"

//export const runtime = 'edge'

import { Inter } from 'next/font/google'
import './globals.css'

import React, { useState } from 'react'
import Link from 'next/link'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faCalendar, faChartBar, faBook, faCog } from '@fortawesome/free-solid-svg-icons'


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
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={toggleMenu} className="hamburger">
                {menuVisible ? 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                 <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
                 : 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                </svg>
                }
              </button>
              <Link href="/" className="ml-4 px-4 py-2 text-white hover:bg-gray-600">Casaparo</Link>
            </div>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${menuVisible ? 'block' : 'hidden'}`} onClick={toggleMenu}></div>
            <div className={`absolute inset-y-0 left-0 transform ${menuVisible ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-800 transition duration-300 ease-in-out top-16`} style={{zIndex: 1000}}>
              <Link href="/household" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                <FontAwesomeIcon icon={faHouse} style={{ marginRight: '16px'}} />
                家計簿
              </Link>
              <Link href="/schedule" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '16px'}} />
                スケジュール
              </Link>
              <Link href="/statistics" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '16px'}} />
                統計
              </Link>
              <Link href="/wiki" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
                <FontAwesomeIcon icon={faBook} style={{ marginRight: '16px'}} />
                Wiki
              </Link>
              <Link href="/setting" onClick={toggleMenu} className="block px-4 py-2 text-white hover:bg-gray-600">
              <FontAwesomeIcon icon={faCog} style={{ marginRight: '16px'}} />
                設定
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
