'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateNickname, deletePost } from '@/app/actions'
import type { ProfilePost, ProfileComment } from './page'

type Props = {
  nickname: string
  posts: ProfilePost[]
  comments: ProfileComment[]
}

type Tab = 'posts' | 'comments'

export default function ProfileClient({ nickname, posts, comments }: Props) {
  const [tab, setTab] = useState<Tab>('posts')
  const [currentNickname, setCurrentNickname] = useState(nickname)
  const [nicknameInput, setNicknameInput] = useState(nickname)
  const [nicknameLoading, setNicknameLoading] = useState(false)
  const [nicknameMsg, setNicknameMsg] = useState<string | null>(null)
  const [postList, setPostList] = useState<ProfilePost[]>(posts)

  async function handleNicknameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nicknameInput.trim() || nicknameInput.trim() === currentNickname) return

    setNicknameLoading(true)
    setNicknameMsg(null)
    try {
      await updateNickname(nicknameInput.trim())
      setCurrentNickname(nicknameInput.trim())
      setNicknameMsg('닉네임이 변경되었습니다!')
    } catch {
      setNicknameMsg('변경에 실패했습니다.')
    } finally {
      setNicknameLoading(false)
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('이 글을 삭제할까요?\n댓글과 좋아요도 함께 삭제됩니다.')) return
    try {
      await deletePost(postId)
      setPostList((prev) => prev.filter((p) => p.id !== postId))
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* 닉네임 수정 카드 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">내 프로필</h1>
          <p className="text-sm text-gray-400 mb-4">현재 닉네임: <span className="font-medium text-gray-700">{currentNickname}</span></p>
          <form onSubmit={handleNicknameSubmit} className="flex gap-2">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="새 닉네임 입력"
              required
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={nicknameLoading || nicknameInput.trim() === currentNickname}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {nicknameLoading ? '저장 중...' : '변경'}
            </button>
          </form>
          {nicknameMsg && (
            <p className={`text-sm mt-2 ${nicknameMsg.includes('실패') ? 'text-red-500' : 'text-green-600'}`}>
              {nicknameMsg}
            </p>
          )}
        </section>

        {/* 활동 내역 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 탭 */}
          <div className="flex border-b border-gray-100">
            {(['posts', 'comments'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'posts'
                  ? `내가 쓴 글 (${postList.length})`
                  : `내가 쓴 댓글 (${comments.length})`}
              </button>
            ))}
          </div>

          {/* 내가 쓴 글 탭 */}
          {tab === 'posts' && (
            <ul className="divide-y divide-gray-50">
              {postList.length === 0 ? (
                <li className="py-12 text-center text-sm text-gray-400">작성한 글이 없습니다.</li>
              ) : (
                postList.map((post) => (
                  <li key={post.id} className="flex items-center gap-3 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/post/${post.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                      >
                        {post.title}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <Link
                        href={`/edit/${post.id}`}
                        className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          {/* 내가 쓴 댓글 탭 */}
          {tab === 'comments' && (
            <ul className="divide-y divide-gray-50">
              {comments.length === 0 ? (
                <li className="py-12 text-center text-sm text-gray-400">작성한 댓글이 없습니다.</li>
              ) : (
                comments.map((comment) => (
                  <li key={comment.id} className="px-6 py-4">
                    <Link
                      href={`/post/${comment.post?.[0]?.id}`}
                      className="text-xs text-indigo-500 hover:underline block mb-1 truncate"
                    >
                      ↩ {comment.post?.[0]?.title ?? '(삭제된 글)'}
                    </Link>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-1">{comment.content}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}
