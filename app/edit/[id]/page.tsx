import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditForm from './EditForm'

export const dynamic = 'force-dynamic'

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, author_id')
    .eq('id', id)
    .single()

  if (!post) notFound()

  // 본인 글이 아니면 홈으로 차단
  if (post.author_id !== user.id) redirect('/')

  return (
    <EditForm
      postId={id}
      initialTitle={post.title}
      initialContent={post.content}
    />
  )
}
