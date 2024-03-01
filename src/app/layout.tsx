"use client"

//export const runtime = 'edge'

import { Inter } from 'next/font/google'
import './globals.css'

import React, { useState } from 'react'
import Link from 'next/link'

import { XMarkIcon, HamburgerIcon } from './utils/HeroicIcons'
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
                <XMarkIcon />
                 : 
                <HamburgerIcon />
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
