import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'

export const metadata: Metadata = {
  title: '커뮤니티',
  description: 'Next.js + Supabase 커뮤니티 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#F2F4F6]">
          <Header />
          {children}
        </body>
    </html>
  )
}
