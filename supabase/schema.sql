-- ================================================================
-- 아이디어 마켓플레이스 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 프로필 테이블 (auth.users 연동)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  ideas_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 아이디어 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'KRW',
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft', 'under_review')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  view_count INTEGER DEFAULT 0,
  daily_views INTEGER DEFAULT 0,
  weekly_views INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  copyright_hash TEXT UNIQUE NOT NULL,
  copyright_registered_at TIMESTAMPTZ DEFAULT NOW(),
  blockchain_tx_id TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  purchase_requests_count INTEGER DEFAULT 0,
  ai_generated_description TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 조회수 추적 테이블 (일별)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.idea_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_date DATE DEFAULT CURRENT_DATE
);

-- ================================================================
-- 구매 요청 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  offered_price DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  response_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 메시지 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  purchase_request_id UUID REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 저작권 등록 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.copyrights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  copyright_hash TEXT UNIQUE NOT NULL,
  registration_number TEXT UNIQUE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE
);

-- ================================================================
-- 즐겨찾기/북마크 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- ================================================================
-- 신고 테이블
-- ================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 인덱스 생성
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_ideas_author_id ON public.ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_daily_views ON public.ideas(daily_views DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_weekly_views ON public.ideas(weekly_views DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_monthly_views ON public.ideas(monthly_views DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_views_idea_id ON public.idea_views(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_views_date ON public.idea_views(view_date);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_idea_id ON public.purchase_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer_id ON public.purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);

-- ================================================================
-- Row Level Security (RLS) 활성화
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyrights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS 정책 - profiles
-- ================================================================
CREATE POLICY "프로필은 누구나 볼 수 있음" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "본인 프로필만 수정 가능" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "회원가입 시 프로필 생성" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================================
-- RLS 정책 - ideas
-- ================================================================
CREATE POLICY "활성 아이디어는 누구나 볼 수 있음" ON public.ideas
  FOR SELECT USING (status != 'draft' OR author_id = auth.uid());

CREATE POLICY "인증된 사용자만 아이디어 등록" ON public.ideas
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "본인 아이디어만 수정 가능" ON public.ideas
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "본인 아이디어만 삭제 가능" ON public.ideas
  FOR DELETE USING (auth.uid() = author_id);

-- ================================================================
-- RLS 정책 - idea_views
-- ================================================================
CREATE POLICY "조회수는 누구나 추가 가능" ON public.idea_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "조회수는 누구나 볼 수 있음" ON public.idea_views
  FOR SELECT USING (true);

-- ================================================================
-- RLS 정책 - purchase_requests
-- ================================================================
CREATE POLICY "본인 구매요청 조회" ON public.purchase_requests
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "인증된 사용자만 구매요청" ON public.purchase_requests
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "판매자만 구매요청 상태 변경" ON public.purchase_requests
  FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- ================================================================
-- RLS 정책 - messages
-- ================================================================
CREATE POLICY "본인 메시지 조회" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "인증된 사용자만 메시지 전송" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "본인 메시지 읽음 처리" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ================================================================
-- RLS 정책 - copyrights
-- ================================================================
CREATE POLICY "저작권은 누구나 볼 수 있음" ON public.copyrights
  FOR SELECT USING (true);

CREATE POLICY "본인만 저작권 등록" ON public.copyrights
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- ================================================================
-- RLS 정책 - bookmarks
-- ================================================================
CREATE POLICY "본인 북마크 조회" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인만 북마크 추가/삭제" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- 트리거 함수 - 새 사용자 가입 시 프로필 자동 생성
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 함수 - 조회수 업데이트
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_idea_views(
  p_idea_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_ip TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- 조회수 기록
  INSERT INTO public.idea_views (idea_id, viewer_id, viewer_ip)
  VALUES (p_idea_id, p_viewer_id, p_viewer_ip);

  -- 전체 조회수 업데이트
  UPDATE public.ideas
  SET
    view_count = view_count + 1,
    daily_views = (
      SELECT COUNT(*) FROM public.idea_views
      WHERE idea_id = p_idea_id AND view_date = CURRENT_DATE
    ),
    weekly_views = (
      SELECT COUNT(*) FROM public.idea_views
      WHERE idea_id = p_idea_id AND view_date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    monthly_views = (
      SELECT COUNT(*) FROM public.idea_views
      WHERE idea_id = p_idea_id AND view_date >= CURRENT_DATE - INTERVAL '30 days'
    )
  WHERE id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 함수 - 저작권 해시 생성
-- ================================================================
CREATE OR REPLACE FUNCTION public.generate_copyright_hash(
  p_title TEXT,
  p_description TEXT,
  p_author_id UUID,
  p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      p_title || p_description || p_author_id::TEXT || p_timestamp::TEXT,
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Storage 버킷 설정 (Supabase Dashboard에서 수동으로 해야 함)
-- 버킷: 'idea-images' (public), 'idea-videos' (public)
-- ================================================================
