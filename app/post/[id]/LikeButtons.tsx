'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Props = {
  postId: string
  initialLikes: number
  initialDislikes: number
  initialUserType: 'like' | 'dislike' | null
  isLoggedIn: boolean
}

export default function LikeButtons({
  postId,
  initialLikes,
  initialDislikes,
  initialUserType,
  isLoggedIn,
}: Props) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userType, setUserType] = useState<'like' | 'dislike' | null>(initialUserType)
  const [loading, setLoading] = useState(false)

  async function handleVote(type: 'like' | 'dislike') {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (userType === type) {
        // 같은 버튼 재클릭 → 취소
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (type === 'like') setLikes((n) => n - 1)
        else setDislikes((n) => n - 1)
        setUserType(null)
      } else {
        // 새로 누르거나 반대 버튼으로 전환
        await supabase
          .from('post_likes')
          .upsert(
            { post_id: postId, user_id: user.id, type },
            { onConflict: 'user_id,post_id' },
          )

        if (userType === 'like')    setLikes((n) => n - 1)
        if (userType === 'dislike') setDislikes((n) => n - 1)
        if (type === 'like')    setLikes((n) => n + 1)
        else setDislikes((n) => n + 1)
        setUserType(type)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => handleVote('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          userType === 'like'
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50'
        }`}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          userType === 'dislike'
            ? 'bg-red-500 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-red-50'
        }`}
      >
        👎 {dislikes}
      </button>
    </div>
  )
}
