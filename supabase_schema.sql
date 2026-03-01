-- =============================================
-- Community Service - Supabase Schema + RLS
-- =============================================


-- =============================================
-- 1. EXTENSIONS
-- =============================================
create extension if not exists "uuid-ossp";


-- =============================================
-- 2. TABLES
-- =============================================

-- users
create table public.users (
  id          uuid primary key default auth.uid(),
  email       text not null unique,
  nickname    text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- posts
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.users(id) on delete cascade,
  title       text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- comments
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- likes  (user 당 post 1개만 좋아요 가능)
create table public.likes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  post_id     uuid not null references public.posts(id) on delete cascade,
  unique (user_id, post_id)   -- 중복 좋아요 방지
);


-- =============================================
-- 3. INDEXES  (조회 성능 향상)
-- =============================================
create index idx_posts_author_id    on public.posts(author_id);
create index idx_comments_post_id   on public.comments(post_id);
create index idx_comments_author_id on public.comments(author_id);
create index idx_likes_post_id      on public.likes(post_id);
create index idx_likes_user_id      on public.likes(user_id);


-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) 활성화
-- =============================================
alter table public.users    enable row level security;
alter table public.posts    enable row level security;
alter table public.comments enable row level security;
alter table public.likes    enable row level security;


-- =============================================
-- 5. RLS POLICIES
-- =============================================

-- ----- users -----
-- 누구나 프로필 조회 가능
create policy "users: public read"
  on public.users for select
  using (true);

-- 본인 프로필만 생성 가능 (auth.uid() = id)
create policy "users: insert own"
  on public.users for insert
  with check (auth.uid() = id);

-- 본인 프로필만 수정 가능
create policy "users: update own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 본인 계정만 삭제 가능
create policy "users: delete own"
  on public.users for delete
  using (auth.uid() = id);


-- ----- posts -----
-- 누구나 글 조회 가능
create policy "posts: public read"
  on public.posts for select
  using (true);

-- 로그인한 사용자만 글 작성 가능
create policy "posts: insert authenticated"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- 본인 글만 수정 가능
create policy "posts: update own"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 본인 글만 삭제 가능
create policy "posts: delete own"
  on public.posts for delete
  using (auth.uid() = author_id);


-- ----- comments -----
-- 누구나 댓글 조회 가능
create policy "comments: public read"
  on public.comments for select
  using (true);

-- 로그인한 사용자만 댓글 작성 가능
create policy "comments: insert authenticated"
  on public.comments for insert
  with check (auth.uid() = author_id);

-- 본인 댓글만 수정 가능
create policy "comments: update own"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 본인 댓글만 삭제 가능
create policy "comments: delete own"
  on public.comments for delete
  using (auth.uid() = author_id);


-- ----- likes -----
-- 누구나 좋아요 목록 조회 가능
create policy "likes: public read"
  on public.likes for select
  using (true);

-- 로그인한 사용자만 좋아요 가능
create policy "likes: insert authenticated"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- 본인 좋아요만 취소(삭제) 가능
create policy "likes: delete own"
  on public.likes for delete
  using (auth.uid() = user_id);


-- =============================================
-- 완료! Supabase SQL Editor에 전체 붙여넣기 후 실행하세요.
-- =============================================
