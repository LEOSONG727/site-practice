// 서버 컴포넌트 — 접속할 때마다 DB에서 최신 데이터를 가져옵니다.
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// 정적 캐시를 비활성화 — 매 요청마다 Supabase에서 최신 글 목록을 조회합니다.
export const dynamic = 'force-dynamic'

type Post = {
  id: string
  title: string
  content: string
  created_at: string
  author: {
    nickname: string
    avatar_url: string | null
  }[] | null
}

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, created_at, author:users(nickname, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('글 목록 불러오기 실패:', error.message)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
          <Link
            href="/write"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            글쓰기
          </Link>
        </div>

        {/* 글 목록 */}
        {!posts || posts.length === 0 ? (
          <p className="text-center text-gray-400 py-20">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {(posts as Post[]).map((post) => (
              <li key={post.id}>
              <Link
                href={`/post/${post.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* 작성자 정보 */}
                <div className="flex items-center gap-2 mb-3">
                  {post.author?.[0]?.avatar_url ? (
                    <img
                      src={post.author[0].avatar_url!}
                      alt={post.author[0].nickname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {post.author?.[0]?.nickname?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {post.author?.[0]?.nickname ?? '익명'}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {/* 제목 */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                  {post.title}
                </h2>

                {/* 내용 미리보기 (최대 2줄) */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </Link>
              </li>
            ))}
          </ul>
        )}

      </div>
    </main>
  )
}
