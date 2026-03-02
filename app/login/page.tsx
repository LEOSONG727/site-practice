'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError

        // auth.users 생성 후 public.users 에도 동기화
        // (트리거가 설정되어 있으면 자동 처리되고, upsert 이므로 중복 걱정 없음)
        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email!,
            nickname: nickname.trim() || email.split('@')[0],
          })
        }

        setMessage('가입 확인 이메일을 보냈습니다. 받은 편지함의 링크를 클릭해 주세요!')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError

        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#191F28]">커뮤니티</h1>
          <p className="text-sm text-[#8B95A1] mt-2">
            {mode === 'login' ? '계정에 로그인하세요' : '새 계정을 만드세요'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* 모드 탭 */}
          <div className="flex rounded-xl bg-[#F2F4F6] p-1 mb-6">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
                  mode === m ? 'bg-white text-[#191F28] shadow-sm' : 'text-[#8B95A1] hover:text-[#191F28]'
                }`}
              >
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 닉네임 — 회원가입 시만 표시 */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-[#191F28] mb-1.5">
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="사용할 닉네임 (빈칸 시 이메일 앞부분 사용)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition"
                />
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#191F28] mb-1.5">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#191F28] mb-1.5">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition"
              />
            </div>

            {/* 에러 / 성공 메시지 */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5">{message}</p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold text-white bg-[#3182F6] rounded-xl hover:bg-[#2872E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
