"use client"

//export const runtime = 'edge'

import { Inter } from 'next/font/google'
import './globals.css'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { XMarkIcon, HamburgerIcon } from '@components/Heroicons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faCalendar, faChartBar, faBook, faCog, faReceipt, faTasks, IconDefinition } from '@fortawesome/free-solid-svg-icons'

import SlideAnimation from '@components/SlideAnimation'


const inter = Inter({ subsets: ['latin'] })

type TextLinkWithIconProps = {
  path: string,
  icon: IconDefinition,
  text: string
  toggleMenuCallback: () => void
}

const TextLinkWithIcon = ({path, icon, text, toggleMenuCallback}: TextLinkWithIconProps) => {
  return (
    <Link href={path} onClick={toggleMenuCallback} className="block px-4 py-2 text-white hover:bg-gray-600">
      <FontAwesomeIcon icon={icon} style={{ marginRight: '16px'}} />
      {text}
    </Link>
  )
}

export default function RootLayout({children}: {children: React.ReactNode}) {

  const [menuVisible, setMenuVisible] = useState(false)

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
      .then(registration => console.log("Service Worker registered with scope:", registration.scope))
      .catch(error => console.error("Service Worker registration failed", error))
    }
  }, [])

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
              <Link href="/" className="ml-4 px-4 py-2 text-white font-bold hover:underline hover:bg-gray-600">Casaparo</Link>
            </div>
            <SlideAnimation />
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${menuVisible ? 'block' : 'hidden'}`} onClick={toggleMenu}></div>
            <div className={`absolute inset-y-0 left-0 transform ${menuVisible ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-800 transition duration-300 ease-in-out top-16`} style={{zIndex: 1000}}>
              <TextLinkWithIcon path="/household" icon={faHouse} text="家計簿" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/inventory" icon={faReceipt} text="在庫・買い物メモ" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/schedule" icon={faCalendar} text="スケジュール" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/statistics" icon={faChartBar} text="統計" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/task" icon={faTasks} text="タスク" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/wiki" icon={faBook} text="Wiki" toggleMenuCallback={toggleMenu} />
              <TextLinkWithIcon path="/setting" icon={faCog} text="設定" toggleMenuCallback={toggleMenu} />
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
