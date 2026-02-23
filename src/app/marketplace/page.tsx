export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { ShoppingBag, TrendingUp, DollarSign, Zap, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplacePage() {
  const supabase = await createClient()

  // 추천 아이디어 (피처드)
  const { data: featuredIdeas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  // 인기 아이디어 (구매 요청 많은 순)
  const { data: popularIdeas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('purchase_requests_count', { ascending: false })
    .limit(8)

  // 최신 아이디어
  const { data: latestIdeas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  // 가격대별 아이디어
  const { data: affordableIdeas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('status', 'active')
    .gt('price', 0)
    .lte('price', 100000)
    .order('view_count', { ascending: false })
    .limit(4)

  // 카테고리별 통계
  const categories = ['기술/IT', '패션/뷰티', '식품/음료', '건강/의료', '교육', '환경/지속가능성']
  const categoryStats = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat)
        .eq('status', 'active')
      return { category: cat, count: count || 0 }
    })
  )

  const Section = ({ title, subtitle, ideas, href }: {
    title: string
    subtitle: string
    ideas: Parameters<typeof IdeaCard>[0]['idea'][]
    href?: string
  }) => (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
        </div>
        {href && (
          <Link href={href}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline">
            더 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {ideas && ideas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400">
          아이디어가 없습니다
        </div>
      )}
    </section>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 히어로 */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">아이디어 마켓플레이스</h1>
              <p className="text-white/70">구매하고 싶은 아이디어를 발견하세요</p>
            </div>
          </div>

          {/* 통계 배지 */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: TrendingUp, label: '오늘 신규', value: '127' },
              { icon: DollarSign, label: '거래 완료', value: '1,284' },
              { icon: Zap, label: '활성 협상', value: '89' },
              { icon: Shield, label: '저작권 보호', value: '100%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Icon className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-white/80">{label}</span>
                <span className="font-black text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 카테고리 빠른 탐색 */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-slate-900 mb-4">카테고리별 탐색</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categoryStats.map(({ category, count }) => {
              const EMOJIS: Record<string, string> = {
                '기술/IT': '💻', '패션/뷰티': '💄', '식품/음료': '🍕',
                '건강/의료': '🏥', '교육': '📚', '환경/지속가능성': '🌱'
              }
              return (
                <Link key={category} href={`/ideas?category=${encodeURIComponent(category)}`}
                  className="text-center p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{EMOJIS[category]}</div>
                  <div className="text-xs font-semibold text-slate-700">{category}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{count}개</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 추천 아이디어 */}
        {featuredIdeas && featuredIdeas.length > 0 && (
          <Section
            title="⭐ 에디터 추천"
            subtitle="아이디어마켓이 엄선한 주목할 만한 아이디어"
            ideas={featuredIdeas}
          />
        )}

        {/* 인기 아이디어 */}
        <Section
          title="🔥 구매 요청 많은 아이디어"
          subtitle="구매자들의 관심이 집중된 인기 아이디어"
          ideas={popularIdeas || []}
          href="/ideas?sort=popular"
        />

        {/* 가격대별 아이디어 */}
        {affordableIdeas && affordableIdeas.length > 0 && (
          <Section
            title="💰 10만원 이하 아이디어"
            subtitle="합리적인 가격의 좋은 아이디어들"
            ideas={affordableIdeas}
            href="/ideas?max_price=100000"
          />
        )}

        {/* 최신 아이디어 */}
        <Section
          title="✨ 최신 등록"
          subtitle="방금 등록된 새 아이디어들"
          ideas={latestIdeas || []}
          href="/ideas?sort=latest"
        />

        {/* 아이디어 등록 CTA */}
        <div className="mt-8 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white text-center">
          <h2 className="text-2xl font-black mb-3">아이디어가 있으신가요?</h2>
          <p className="text-white/80 mb-6">지금 바로 등록하고 전 세계 구매자들에게 선보이세요</p>
          <Link href="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all">
            아이디어 등록하기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
