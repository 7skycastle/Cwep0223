export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Shield, User, Trophy, TrendingUp, Clock, Calendar, Crown } from 'lucide-react'

export default async function RankingPage() {
  const supabase = await createClient()

  const fetchRanking = async (orderBy: string, limit = 20) => {
    const { data } = await supabase
      .from('ideas')
      .select('*, author:profiles(id, username, full_name, avatar_url)')
      .eq('status', 'active')
      .order(orderBy, { ascending: false })
      .limit(limit)
    return data || []
  }

  const [dailyRanking, weeklyRanking, monthlyRanking, allTimeRanking] = await Promise.all([
    fetchRanking('daily_views'),
    fetchRanking('weekly_views'),
    fetchRanking('monthly_views'),
    fetchRanking('view_count'),
  ])

  const RANK_MEDALS = ['🥇', '🥈', '🥉']
  const RANK_COLORS = [
    'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50',
    'border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50',
    'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50',
  ]

  const RankingList = ({
    items,
    viewField,
    label
  }: {
    items: {
      id: string; title: string; images: string[]; price: number;
      view_count: number; daily_views: number; weekly_views: number;
      monthly_views: number; category: string; author: { username: string; avatar_url?: string }
    }[]
    viewField: 'daily_views' | 'weekly_views' | 'monthly_views' | 'view_count'
    label: string
  }) => (
    <div className="space-y-3">
      {items.map((idea, idx) => (
        <Link key={idea.id} href={`/ideas/${idea.id}`}>
          <div className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all hover:shadow-md ${
            idx < 3 ? RANK_COLORS[idx] : 'border-slate-100 hover:border-indigo-100'
          }`}>
            {/* 순위 */}
            <div className="w-12 text-center flex-shrink-0">
              {idx < 3 ? (
                <span className="text-3xl">{RANK_MEDALS[idx]}</span>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
                  <span className="text-lg font-black text-slate-500">#{idx + 1}</span>
                </div>
              )}
            </div>

            {/* 썸네일 */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 flex-shrink-0">
              {idea.images?.[0] ? (
                <img src={idea.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{idea.category}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate">{idea.title}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                {idea.author.avatar_url ? (
                  <img src={idea.author.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
                )}
                <span className="text-xs text-slate-400">@{idea.author.username}</span>
                <span className="flex items-center gap-0.5 text-xs text-green-600 ml-2">
                  <Shield className="w-3 h-3" /> 보호됨
                </span>
              </div>
            </div>

            {/* 조회수 & 가격 */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-indigo-600 font-black justify-end">
                <Eye className="w-3.5 h-3.5" />
                <span>{(idea[viewField] || 0).toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-400">{label}</div>
              <div className="text-sm font-bold text-slate-700 mt-1">
                {idea.price === 0 ? '가격협의' : `₩${idea.price.toLocaleString()}`}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-sm font-semibold mb-4">
            <Crown className="w-4 h-4 text-yellow-500" />
            실시간 랭킹
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">🏆 인기 아이디어 랭킹</h1>
          <p className="text-slate-500">조회수 기반으로 집계된 실시간 아이디어 랭킹입니다</p>
        </div>

        {/* TOP 3 하이라이트 */}
        {dailyRanking.slice(0, 3).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" /> 오늘의 TOP 3
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dailyRanking.slice(0, 3).map((idea, idx) => (
                <Link key={idea.id} href={`/ideas/${idea.id}`}>
                  <div className={`relative rounded-3xl overflow-hidden border-2 group hover:shadow-xl transition-all ${
                    idx === 0 ? 'border-yellow-400 sm:scale-105 sm:z-10' :
                    idx === 1 ? 'border-slate-300' : 'border-amber-500'
                  }`}>
                    <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 relative">
                      {idea.images?.[0] && (
                        <img src={idea.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      )}
                      <div className="absolute top-3 left-3 text-3xl">{RANK_MEDALS[idx]}</div>
                    </div>
                    <div className="bg-white p-4">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2">{idea.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold">
                          <Eye className="w-4 h-4" />
                          {(idea.daily_views || 0).toLocaleString()}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {idea.price === 0 ? '협의' : `₩${idea.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 랭킹 탭 */}
        <div className="space-y-10">
          {/* 일간 */}
          <div>
            <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl p-4 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">일간 랭킹</h2>
                <p className="text-xs text-slate-500">오늘 하루 가장 많이 본 아이디어</p>
              </div>
            </div>
            <RankingList items={dailyRanking} viewField="daily_views" label="오늘 조회" />
          </div>

          {/* 주간 */}
          <div>
            <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl p-4 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">주간 랭킹</h2>
                <p className="text-xs text-slate-500">이번 주 가장 주목받은 아이디어</p>
              </div>
            </div>
            <RankingList items={weeklyRanking} viewField="weekly_views" label="이번 주 조회" />
          </div>

          {/* 월간 */}
          <div>
            <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl p-4 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">월간 랭킹</h2>
                <p className="text-xs text-slate-500">이번 달 가장 인기 있는 아이디어</p>
              </div>
            </div>
            <RankingList items={monthlyRanking} viewField="monthly_views" label="이번 달 조회" />
          </div>

          {/* 전체 */}
          <div>
            <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl p-4 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">역대 랭킹</h2>
                <p className="text-xs text-slate-500">역대 가장 많이 조회된 아이디어</p>
              </div>
            </div>
            <RankingList items={allTimeRanking} viewField="view_count" label="누적 조회" />
          </div>
        </div>
      </div>
    </div>
  )
}
