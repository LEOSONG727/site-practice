'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { CommentRow } from './page'

type Props = {
  postId: string
  initialComments: CommentRow[]
  currentUserId: string | null
}

export default function CommentSection({ postId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || !content.trim()) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUserId,
          content: content.trim(),
        })
        .select('id, content, created_at, author_id, author:users(nickname, avatar_url)')
        .single()

      if (insertError) throw insertError

      setComments((prev) => [...prev, data as unknown as CommentRow])
      setContent('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-bold text-[#191F28] mb-4">댓글 {comments.length}개</h2>

      {/* 댓글 작성 폼 */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            required
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#191F28] placeholder-[#8B95A1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition resize-none mb-2"
          />
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#3182F6] rounded-xl hover:bg-[#2872E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-[#8B95A1] mb-6 bg-[#F2F4F6] rounded-xl px-4 py-3">
          댓글을 작성하려면{' '}
          <a href="/login" className="text-[#3182F6] hover:underline">
            로그인
          </a>
          이 필요합니다.
        </p>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-[#8B95A1] text-center py-4">첫 댓글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#3182F6] font-semibold text-xs flex-shrink-0 mt-0.5">
                {comment.author?.nickname?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#191F28]">
                    {comment.author?.nickname ?? '익명'}
                  </span>
                  <span className="text-xs text-[#8B95A1]">
                    {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  {currentUserId === comment.author_id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-[#8B95A1] hover:text-red-500 ml-auto transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#333D4B] leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
