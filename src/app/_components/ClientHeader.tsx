"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { XMarkIcon, HamburgerIcon } from '@components/Heroicons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faCalendar, faChartBar, faBook, faCog, faReceipt, faTasks, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import SlideAnimation from '@components/SlideAnimation'

type TextLinkWithIconProps = {
  path: string
  icon: IconDefinition
  text: string
  toggleMenuCallback: () => void
}

const TextLinkWithIcon = ({ path, icon, text, toggleMenuCallback }: TextLinkWithIconProps) => (
  <Link href={path} onClick={toggleMenuCallback} className="block px-4 py-2 text-white hover:bg-gray-600">
    <FontAwesomeIcon icon={icon} style={{ marginRight: '16px' }} />
    {text}
  </Link>
)

export default function ClientHeader() {
  const [menuVisible, setMenuVisible] = useState(false)
  const toggleMenu = () => setMenuVisible(v => !v)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(r => console.log('Service Worker registered:', r.scope))
        .catch(e => console.error('Service Worker registration failed', e))
    }
  }, [])

  return (
    <header className="bg-gray-800 text-white p-4 z-10">
      <nav className="flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleMenu} className="hamburger">
            {menuVisible ? <XMarkIcon /> : <HamburgerIcon />}
          </button>
          <Link href="/" className="ml-4 px-4 py-2 text-white font-bold hover:underline hover:bg-gray-600">
            Casaparo
          </Link>
        </div>
        <SlideAnimation />
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${menuVisible ? 'block' : 'hidden'}`}
          onClick={toggleMenu}
        />
        <div
          className={`absolute inset-y-0 left-0 transform ${menuVisible ? 'translate-x-0' : '-translate-x-full'} w-64 bg-gray-800 transition duration-300 ease-in-out top-16`}
          style={{ zIndex: 1000 }}
        >
          <TextLinkWithIcon path="/household"  icon={faHouse}     text="家計簿"           toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/inventory"  icon={faReceipt}   text="在庫・買い物メモ" toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/schedule"   icon={faCalendar}  text="スケジュール"     toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/statistics" icon={faChartBar}  text="統計"             toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/task"       icon={faTasks}     text="タスク"           toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/wiki"       icon={faBook}      text="Wiki"             toggleMenuCallback={toggleMenu} />
          <TextLinkWithIcon path="/setting"    icon={faCog}       text="設定"             toggleMenuCallback={toggleMenu} />
        </div>
      </nav>
    </header>
  )
}
