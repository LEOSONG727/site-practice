'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // 로그인/로그아웃 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-[#191F28]">
          커뮤니티
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm text-[#8B95A1] hover:text-[#3182F6] transition-colors"
              >
                마이페이지
              </Link>
              <Link
                href="/write"
                className="bg-[#3182F6] text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-[#2872E0] transition-colors"
              >
                글쓰기
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-[#8B95A1] hover:text-[#191F28] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#3182F6] text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-[#2872E0] transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
