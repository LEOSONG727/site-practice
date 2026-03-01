-- =============================================
-- Supabase Auth 연동 트리거
-- 새 유저가 회원가입할 때 auth.users → public.users 를 자동 동기화합니다.
-- Supabase SQL Editor에 붙여넣고 한 번만 실행하세요.
-- =============================================

-- 1. 트리거 함수 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, nickname)
  values (
    new.id,
    new.email,
    -- 닉네임: 회원가입 시 전달한 user_metadata.nickname 우선, 없으면 이메일 앞부분 사용
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing; -- 이미 존재하면 건너뜀 (중복 실행 안전)

  return new;
end;
$$;

-- 2. 트리거 등록 (auth.users INSERT 시 자동 실행)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- =============================================
-- 완료! 이 트리거가 설정되면 회원가입 즉시 public.users 에 레코드가 자동 생성됩니다.
-- =============================================
