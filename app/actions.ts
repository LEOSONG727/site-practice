'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function revalidateHome() {
  revalidatePath('/')
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id) // RLS + 이중 안전장치

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/profile')
}

export async function updatePost(postId: string, title: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { error } = await supabase
    .from('posts')
    .update({ title, content })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath(`/post/${postId}`)
  revalidatePath('/profile')
}

export async function updateNickname(nickname: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { error } = await supabase
    .from('users')
    .update({ nickname })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/profile')
}
