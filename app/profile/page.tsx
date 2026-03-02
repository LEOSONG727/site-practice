import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 유저 프로필
  const { data: profile } = await supabase
    .from('users')
    .select('nickname, avatar_url')
    .eq('id', user.id)
    .single()

  // 내가 쓴 글
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // 내가 쓴 댓글 (원본 글 제목 포함)
  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, post:posts(id, title)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient
      nickname={profile?.nickname ?? ''}
      posts={posts ?? []}
      comments={(comments ?? []) as ProfileComment[]}
    />
  )
}

// ProfileClient에서도 쓸 수 있도록 export
export type ProfilePost = { id: string; title: string; created_at: string }
export type ProfileComment = {
  id: string
  content: string
  created_at: string
  post: { id: string; title: string }[] | null
}
