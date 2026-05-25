import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import ClientHeader from '@components/ClientHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  description: 'Casaparo - 家計簿、在庫・買い物メモ、スケジュール、統計、タスク、Wiki、設定を管理するアプリです。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Casaparo</title>
        <link rel="icon-any" href="/icon512_rounded.png" />
        <link rel="icon-maskable" href="/icon512_maskable.png" />
        <link rel="apple-touch-icon" href="/icon512_rounded.png" />
      </head>
      <body className={inter.className}>
        <ClientHeader />
        {children}
      </body>
    </html>
  )
}
