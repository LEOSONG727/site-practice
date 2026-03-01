import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Supabase 이메일 인증 링크 클릭 시 호출되는 콜백 라우트입니다.
 * code를 세션으로 교환하고, users 테이블을 동기화한 뒤 홈으로 리다이렉트합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // users 테이블에 레코드가 없으면 생성 (이메일 인증 완료 시점에 한 번 더 보장)
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        nickname: data.user.user_metadata?.nickname || data.user.email!.split('@')[0],
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 코드가 없거나 교환 실패 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
