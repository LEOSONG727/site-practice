import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LikeButtons from './LikeButtons'
import CommentSection from './CommentSection'
import PostActions from './PostActions'

export const dynamic = 'force-dynamic'

type PostAuthor = {
  nickname: string
  avatar_url: string | null
}

export type CommentRow = {
  id: string
  content: string
  created_at: string
  author_id: string
  author: { nickname: string; avatar_url: string | null } | null  // 단일 객체
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 현재 로그인 유저
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // 글 조회
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, created_at, author_id, author:users(nickname, avatar_url)')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const postAuthor = post.author as unknown as PostAuthor | null

  // 댓글 조회
  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, author_id, author:users(nickname, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // 좋아요/싫어요 조회
  const { data: likeRows } = await supabase
    .from('post_likes')
    .select('type, user_id')
    .eq('post_id', id)

  const likeCount    = likeRows?.filter((r) => r.type === 'like').length    ?? 0
  const dislikeCount = likeRows?.filter((r) => r.type === 'dislike').length ?? 0
  const userLikeType = currentUser
    ? (likeRows?.find((r) => r.user_id === currentUser.id)?.type as
        | 'like'
        | 'dislike'
        | undefined) ?? null
    : null

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* 뒤로가기 */}
        <Link href="/" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
          ← 목록으로
        </Link>

        {/* 글 본문 */}
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {/* 작성자 + 날짜 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {postAuthor?.nickname?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {postAuthor?.nickname ?? '익명'}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* 본문 */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </article>

        {/* 수정/삭제 버튼 — 본인 글일 때만 표시 */}
        {currentUser?.id === post.author_id && (
          <PostActions postId={id} />
        )}

        {/* 좋아요/싫어요 */}
        <LikeButtons
          postId={id}
          initialLikes={likeCount}
          initialDislikes={dislikeCount}
          initialUserType={userLikeType}
          isLoggedIn={!!currentUser}
        />

        {/* 댓글 */}
        <CommentSection
          postId={id}
          initialComments={(comments ?? []) as unknown as CommentRow[]}
          currentUserId={currentUser?.id ?? null}
        />

      </div>
    </main>
  )
}
