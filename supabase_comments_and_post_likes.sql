-- =============================================
-- comments & post_likes 테이블 + RLS
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- =============================================

-- -----------------------------------------------
-- 1. comments 테이블
--    (supabase_schema.sql에 이미 있을 경우 충돌 방지를 위해 IF NOT EXISTS 사용)
-- -----------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.posts(id)  on delete cascade,
  author_id  uuid not null references public.users(id)  on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_post_id   on public.comments(post_id);
create index if not exists idx_comments_author_id on public.comments(author_id);

alter table public.comments enable row level security;

drop policy if exists "comments: public read"          on public.comments;
drop policy if exists "comments: insert authenticated" on public.comments;
drop policy if exists "comments: update own"           on public.comments;
drop policy if exists "comments: delete own"           on public.comments;

create policy "comments: public read"
  on public.comments for select using (true);

create policy "comments: insert authenticated"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "comments: update own"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "comments: delete own"
  on public.comments for delete
  using (auth.uid() = author_id);


-- -----------------------------------------------
-- 2. post_likes 테이블 (좋아요/싫어요)
--    기존 likes 테이블과 별개로, type 컬럼으로 좋아요/싫어요 구분
-- -----------------------------------------------
create table if not exists public.post_likes (
  id       uuid primary key default uuid_generate_v4(),
  user_id  uuid not null references public.users(id)  on delete cascade,
  post_id  uuid not null references public.posts(id)  on delete cascade,
  type     text not null check (type in ('like', 'dislike')),
  unique (user_id, post_id)   -- 한 유저는 글 하나에 like 또는 dislike 하나만 가능
);

create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_likes_user_id on public.post_likes(user_id);

alter table public.post_likes enable row level security;

drop policy if exists "post_likes: public read"          on public.post_likes;
drop policy if exists "post_likes: insert authenticated" on public.post_likes;
drop policy if exists "post_likes: update own"           on public.post_likes;
drop policy if exists "post_likes: delete own"           on public.post_likes;

create policy "post_likes: public read"
  on public.post_likes for select using (true);

create policy "post_likes: insert authenticated"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "post_likes: update own"
  on public.post_likes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "post_likes: delete own"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- =============================================
-- 완료!
-- =============================================
