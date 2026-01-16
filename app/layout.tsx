import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '专注星球 - Focus Planet',
  description: '与朋友一起专注，让星球共同成长',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
