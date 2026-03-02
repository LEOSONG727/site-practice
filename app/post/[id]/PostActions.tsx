'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/app/actions'

type Props = { postId: string }

export default function PostActions({ postId }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('이 글을 삭제할까요?\n댓글과 좋아요도 함께 삭제됩니다.')) return
    try {
      await deletePost(postId)
      router.push('/')
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  return (
    <div className="flex justify-end gap-3 mb-2">
      <Link
        href={`/edit/${postId}`}
        className="text-sm text-gray-500 hover:text-[#3182F6] transition-colors"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        className="text-sm text-gray-400 hover:text-red-500 transition-colors"
      >
        삭제
      </button>
    </div>
  )
}
