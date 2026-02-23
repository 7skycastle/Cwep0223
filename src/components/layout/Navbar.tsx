'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Lightbulb, Upload, Search, Bell, User, Menu, X,
  LogOut, Settings, BookmarkCheck, ShoppingBag, BarChart3
} from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ username: string; avatar_url?: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/ideas?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navLinks = [
    { href: '/ideas', label: '아이디어 탐색' },
    { href: '/marketplace', label: '마켓플레이스' },
    { href: '/ranking', label: '랭킹' },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-md'
        : 'bg-white border-b border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black gradient-text">아이디어마켓</span>
              <div className="text-[10px] text-slate-400 leading-none -mt-0.5">AI IDEA MARKETPLACE</div>
            </div>
          </Link>

          {/* 검색창 - 데스크탑 */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아이디어 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* 네비게이션 링크 - 데스크탑 */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* 업로드 버튼 */}
                <Link
                  href="/upload"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>아이디어 등록</span>
                </Link>

                {/* 알림 */}
                <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 프로필 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="프로필" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 fade-in">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">@{profile?.username || '사용자'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href={`/profile/${profile?.username}`} onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                          <User className="w-4 h-4 text-slate-400" /> 내 프로필
                        </Link>
                        <Link href="/my-ideas" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                          <BarChart3 className="w-4 h-4 text-slate-400" /> 내 아이디어
                        </Link>
                        <Link href="/bookmarks" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                          <BookmarkCheck className="w-4 h-4 text-slate-400" /> 북마크
                        </Link>
                        <Link href="/purchases" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                          <ShoppingBag className="w-4 h-4 text-slate-400" /> 구매 내역
                        </Link>
                        <Link href="/settings" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                          <Settings className="w-4 h-4 text-slate-400" /> 설정
                        </Link>
                        <hr className="my-2 border-slate-100" />
                        <button onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm text-red-600 transition-colors w-full">
                          <LogOut className="w-4 h-4" /> 로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  로그인
                </Link>
                <Link href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all">
                  회원가입
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1 fade-in">
            {/* 모바일 검색 */}
            <form onSubmit={handleSearch} className="px-2 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="아이디어 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </form>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors mx-2">
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/upload" onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 mx-2 px-3 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold">
                <Upload className="w-4 h-4" /> 아이디어 등록
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 프로필 드롭다운 오버레이 */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
      )}
    </nav>
  )
}
