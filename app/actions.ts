'use server'

import { revalidatePath } from 'next/cache'

/**
 * 메인 페이지(/)의 캐시를 무효화합니다.
 * 클라이언트 컴포넌트에서는 revalidatePath를 직접 쓸 수 없으므로
 * 이 Server Action을 import해서 호출합니다.
 */
export async function revalidateHome() {
  revalidatePath('/')
}
