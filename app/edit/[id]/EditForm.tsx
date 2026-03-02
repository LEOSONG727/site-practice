'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost } from '@/app/actions'

type Props = {
  postId: string
  initialTitle: string
  initialContent: string
}

export default function EditForm({ postId, initialTitle, initialContent }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updatePost(postId, title.trim(), content.trim())
      router.push(`/post/${postId}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4">

        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#8B95A1] hover:text-[#191F28] transition-colors text-xl leading-none"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-[#191F28]">글 수정</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#191F28] mb-1.5">
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[#191F28] mb-1.5">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] focus:border-transparent transition resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-semibold text-[#8B95A1] bg-[#F2F4F6] rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-[#3182F6] rounded-xl hover:bg-[#2872E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>

      </div>
    </main>
  )
}
