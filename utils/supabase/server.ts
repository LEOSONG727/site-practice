import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버(서버 컴포넌트, Route Handler, Server Action)에서 Supabase를 호출할 때 사용하는 클라이언트입니다.
 * 쿠키를 통해 로그인 세션을 읽고 씁니다.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // 서버 컴포넌트에서 호출된 경우 쿠키 쓰기가 불가능하므로 무시합니다.
            // 세션 갱신은 미들웨어가 처리합니다.
          }
        },
      },
    },
  )
}
