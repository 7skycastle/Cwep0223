# 🚀 아이디어마켓 배포 가이드

## 1단계: Supabase 프로젝트 설정

### 1.1 계정 생성
1. https://supabase.com 접속 → 무료 계정 생성

### 1.2 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트명: `idea-marketplace`
3. 데이터베이스 비밀번호 설정
4. 지역: **Northeast Asia (Seoul)** 선택

### 1.3 데이터베이스 스키마 적용
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일 내용 전체 복사 후 실행

### 1.4 Storage 버킷 생성
1. Storage 메뉴 → "New Bucket"
2. `idea-images` 버킷 생성 (Public: ON)
3. `idea-videos` 버킷 생성 (Public: ON)

### 1.5 Storage 정책 설정 (SQL Editor에서 실행)
```sql
-- idea-images 버킷 정책
CREATE POLICY "누구나 이미지 조회 가능" ON storage.objects
  FOR SELECT USING (bucket_id = 'idea-images');

CREATE POLICY "인증된 사용자만 이미지 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'idea-images' AND auth.role() = 'authenticated');

CREATE POLICY "본인 이미지만 삭제" ON storage.objects
  FOR DELETE USING (bucket_id = 'idea-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- idea-videos 버킷 정책
CREATE POLICY "누구나 영상 조회 가능" ON storage.objects
  FOR SELECT USING (bucket_id = 'idea-videos');

CREATE POLICY "인증된 사용자만 영상 업로드" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'idea-videos' AND auth.role() = 'authenticated');

CREATE POLICY "본인 영상만 삭제" ON storage.objects
  FOR DELETE USING (bucket_id = 'idea-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.6 API 키 확인
- Settings → API
- `Project URL` 복사
- `anon public` 키 복사

---

## 2단계: Google OAuth 설정 (선택사항)

1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 → OAuth 2.0 클라이언트 ID 생성
3. Supabase → Authentication → Providers → Google 활성화
4. Client ID, Client Secret 입력

---

## 3단계: Vercel 배포

### 3.1 GitHub에 코드 푸시
```bash
cd idea-marketplace
git init
git add .
git commit -m "feat: 아이디어마켓 초기 버전"
git remote add origin https://github.com/YOUR_USERNAME/idea-marketplace.git
git push -u origin main
```

### 3.2 Vercel 프로젝트 생성
1. https://vercel.com 접속 → "Add New Project"
2. GitHub 저장소 연결
3. Framework: **Next.js** (자동 감지)

### 3.3 환경변수 설정 (Vercel Dashboard → Settings → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY = eyJ...your-service-role-key
NEXT_PUBLIC_SITE_URL = https://YOUR_PROJECT.vercel.app
```

### 3.4 배포 완료
- "Deploy" 클릭 후 배포 완료 대기 (약 2-3분)
- 배포 URL 확인

---

## 4단계: Supabase에 사이트 URL 등록

1. Supabase → Authentication → URL Configuration
2. Site URL: `https://YOUR_PROJECT.vercel.app`
3. Redirect URLs에 추가:
   - `https://YOUR_PROJECT.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (로컬 개발용)

---

## 로컬 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local 파일 편집)
# NEXT_PUBLIC_SUPABASE_URL 실제 URL로 교체
# NEXT_PUBLIC_SUPABASE_ANON_KEY 실제 키로 교체

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

---

## 주요 기능 확인 체크리스트

- [ ] 회원가입 → 이메일 인증 확인
- [ ] 로그인 / 로그아웃
- [ ] 아이디어 업로드 (이미지 + 영상)
- [ ] 저작권 해시 생성 확인
- [ ] 아이디어 목록/검색/필터
- [ ] 랭킹 (일간/주간/월간)
- [ ] 구매 요청 전송
- [ ] 프로필 페이지
