import Link from 'next/link'
import { Lightbulb, Shield, Zap, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* 브랜드 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">아이디어마켓</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI로 생성된 혁신적인 아이디어를 안전하게 보호하고,<br />
              가치 있는 연결을 만드는 플랫폼입니다.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Shield, label: '저작권 보호', color: 'from-green-500 to-emerald-600' },
                { icon: Zap, label: 'AI 기반', color: 'from-yellow-500 to-orange-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${color} rounded-lg text-xs font-semibold`}>
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-bold text-white mb-4">서비스</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/ideas', label: '아이디어 탐색' },
                { href: '/marketplace', label: '마켓플레이스' },
                { href: '/ranking', label: '인기 랭킹' },
                { href: '/upload', label: '아이디어 등록' },
                { href: '/categories', label: '카테고리' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 저작권 보호 */}
          <div>
            <h4 className="font-bold text-white mb-4">저작권 보호</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/copyright/guide', label: '저작권 안내' },
                { href: '/copyright/verify', label: '저작권 검증' },
                { href: '/copyright/register', label: '저작권 등록' },
                { href: '/terms', label: '이용약관' },
                { href: '/privacy', label: '개인정보처리방침' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="font-bold text-white mb-4">고객지원</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/faq', label: '자주 묻는 질문' },
                { href: '/contact', label: '문의하기' },
                { href: '/notice', label: '공지사항' },
                { href: '/about', label: '서비스 소개' },
                { href: '/blog', label: '블로그' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 아이디어마켓. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-1" />
            <span>in Korea</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
