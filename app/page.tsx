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
  views: number
  author: {
    nickname: string
    avatar_url: string | null
  } | null   // Supabase many-to-one 조인은 배열이 아닌 단일 객체를 반환
  post_likes: { type: string }[]
  comments: { id: string }[]
}

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, created_at, views, author:users(nickname, avatar_url), post_likes(type), comments(id)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('글 목록 불러오기 실패:', error.message)
  }

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">

        <h1 className="text-2xl font-bold text-[#191F28] mb-6">최신 글</h1>

        {/* 글 목록 */}
        {!posts || posts.length === 0 ? (
          <p className="text-center text-[#8B95A1] py-20">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {(posts as unknown as Post[]).map((post) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  {/* 작성자 정보 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#3182F6] font-semibold text-xs">
                      {post.author?.nickname?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-sm font-medium text-[#191F28]">
                      {post.author?.nickname ?? '익명'}
                    </span>
                    <span className="text-xs text-[#8B95A1] ml-auto">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h2 className="text-base font-semibold text-[#191F28] mb-1.5 leading-snug">
                    {post.title}
                  </h2>

                  {/* 내용 미리보기 (최대 2줄) */}
                  <p className="text-sm text-[#8B95A1] line-clamp-2 leading-relaxed mb-3">
                    {post.content}
                  </p>

                  {/* 통계 */}
                  <div className="flex items-center gap-2 text-xs text-[#8B95A1]">
                    <span>👁️ {post.views ?? 0}</span>
                    <span>·</span>
                    <span>❤️ {post.post_likes.filter((l) => l.type === 'like').length}</span>
                    <span>·</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

      </div>
    </main>
  )
}
