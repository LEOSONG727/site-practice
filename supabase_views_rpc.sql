-- 조회수 증가용 RPC 함수 (RLS 우회 — SECURITY DEFINER)
-- Supabase SQL Editor에서 실행해 주세요.
CREATE OR REPLACE FUNCTION increment_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$$;
