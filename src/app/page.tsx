export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { RankingSection } from '@/components/ranking/RankingSection'
import {
  Lightbulb, Shield, TrendingUp, Users, Upload,
  ArrowRight, Sparkles, Lock, Star, Zap
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // 최신 아이디어
  const { data: latestIdeas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  // 일간/주간/월간 랭킹
  const { data: dailyRanking } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('daily_views', { ascending: false })
    .limit(5)

  const { data: weeklyRanking } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('weekly_views', { ascending: false })
    .limit(5)

  const { data: monthlyRanking } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('monthly_views', { ascending: false })
    .limit(5)

  // 통계
  const { count: totalIdeas } = await supabase
    .from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: totalUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
  const { count: totalPurchases } = await supabase
    .from('purchase_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed')

  return (
    <div className="fade-in">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>AI 기반 아이디어 저작권 보호 플랫폼</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              당신의 혁신적인 아이디어를<br />
              <span className="text-yellow-300">안전하게 보호</span>하고<br />
              <span className="underline decoration-wavy decoration-pink-400">가치있게 거래</span>하세요
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI로 생성한 가상의 아이디어 상품을 업로드하면, 즉시 저작권 해시로 보호되고 구매자와 연결됩니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/upload"
                className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all">
                <Upload className="w-5 h-5" /> 아이디어 등록하기
              </Link>
              <Link href="/ideas"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-2xl text-lg font-semibold hover:bg-white/20 transition-all">
                아이디어 탐색 <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { label: '등록 아이디어', value: `${(totalIdeas || 0).toLocaleString()}+`, icon: Lightbulb },
                { label: '활성 회원', value: `${(totalUsers || 0).toLocaleString()}+`, icon: Users },
                { label: '거래 완료', value: `${(totalPurchases || 0).toLocaleString()}+`, icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-xs text-white/70 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* 핵심 기능 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              왜 <span className="gradient-text">아이디어마켓</span>인가요?
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">AI 시대의 혁신적인 아이디어를 안전하고 공정하게 거래할 수 있는 환경을 제공합니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, color: 'from-green-400 to-emerald-500', title: 'AI 저작권 보호', desc: '업로드 즉시 SHA-256 해시값으로 타임스탬프가 생성되어 아이디어의 최초 등록 시간과 내용이 영구 보존됩니다.' },
              { icon: Zap, color: 'from-indigo-400 to-purple-500', title: '즉시 구매자 연결', desc: '관심 있는 구매자가 직접 구매 요청을 보내면 실시간 메시지로 협상하고 계약을 완료할 수 있습니다.' },
              { icon: Star, color: 'from-yellow-400 to-orange-500', title: '공정한 랭킹 시스템', desc: '일간/주간/월간 조회수 기반의 투명한 랭킹으로 좋은 아이디어가 자연스럽게 주목받습니다.' },
              { icon: Lock, color: 'from-pink-400 to-rose-500', title: '안전한 거래', desc: '구매자와 판매자 간의 모든 협상은 플랫폼 내에서 안전하게 진행되며 거래 내역이 기록됩니다.' },
              { icon: Lightbulb, color: 'from-cyan-400 to-blue-500', title: 'AI 아이디어 분석', desc: 'AI가 업로드된 아이디어를 분석하여 유사 아이디어 검색, 카테고리 추천, 가격 제안을 도와줍니다.' },
              { icon: Users, color: 'from-violet-400 to-purple-500', title: '활발한 커뮤니티', desc: '아이디어 창작자, 투자자, 기업 모두가 참여하는 생태계에서 더 많은 기회를 발견하세요.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 랭킹 섹션 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-1">🏆 인기 아이디어 랭킹</h2>
              <p className="text-slate-500">가장 많은 관심을 받고 있는 아이디어들</p>
            </div>
            <Link href="/ranking"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all">
              전체 랭킹 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <RankingSection
            dailyRanking={dailyRanking || []}
            weeklyRanking={weeklyRanking || []}
            monthlyRanking={monthlyRanking || []}
          />
        </div>
      </section>

      {/* 최신 아이디어 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-1">✨ 최신 아이디어</h2>
              <p className="text-slate-500">방금 등록된 따끈따끈한 아이디어들</p>
            </div>
            <Link href="/ideas"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
              더 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestIdeas && latestIdeas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl">
              <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">아직 등록된 아이디어가 없습니다</h3>
              <p className="text-slate-400 mb-6">첫 번째 아이디어를 등록해보세요!</p>
              <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                <Upload className="w-4 h-4" /> 아이디어 등록
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">지금 바로 아이디어를 등록하세요</h2>
          <p className="text-white/80 text-lg mb-10">무료로 가입하고 혁신적인 아이디어를 전 세계 구매자에게 선보이세요.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all">
              무료로 시작하기 →
            </Link>
            <Link href="/ideas"
              className="flex items-center gap-2 px-8 py-4 border border-white/30 text-white rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all">
              아이디어 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
