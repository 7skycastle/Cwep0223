'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, TrendingUp, Calendar, Clock, Shield, User } from 'lucide-react'

interface RankingIdea {
  id: string
  title: string
  category: string
  price: number
  images: string[]
  view_count: number
  daily_views: number
  weekly_views: number
  monthly_views: number
  author: {
    username: string
    avatar_url?: string
  }
}

interface RankingSectionProps {
  dailyRanking: RankingIdea[]
  weeklyRanking: RankingIdea[]
  monthlyRanking: RankingIdea[]
}

type Period = 'daily' | 'weekly' | 'monthly'

const RANK_MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'border-yellow-400 bg-yellow-50',
  'border-slate-300 bg-slate-50',
  'border-amber-600 bg-amber-50',
]

export function RankingSection({ dailyRanking, weeklyRanking, monthlyRanking }: RankingSectionProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('daily')

  const rankingData = {
    daily: dailyRanking,
    weekly: weeklyRanking,
    monthly: monthlyRanking,
  }

  const getViewCount = (idea: RankingIdea) => {
    if (activePeriod === 'daily') return idea.daily_views
    if (activePeriod === 'weekly') return idea.weekly_views
    return idea.monthly_views
  }

  const tabs = [
    { key: 'daily', label: '일간', icon: Clock },
    { key: 'weekly', label: '주간', icon: TrendingUp },
    { key: 'monthly', label: '월간', icon: Calendar },
  ] as const

  const currentRanking = rankingData[activePeriod]

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActivePeriod(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activePeriod === key
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label} 랭킹
          </button>
        ))}
      </div>

      {/* 랭킹 목록 */}
      {currentRanking.length > 0 ? (
        <div className="space-y-3">
          {currentRanking.map((idea, idx) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <div className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer ${
                idx < 3 ? RANK_COLORS[idx] : 'border-slate-100 hover:border-indigo-100'
              }`}>
                {/* 순위 */}
                <div className="w-10 text-center">
                  {idx < 3 ? (
                    <span className="text-2xl">{RANK_MEDALS[idx]}</span>
                  ) : (
                    <span className="text-lg font-black text-slate-400">#{idx + 1}</span>
                  )}
                </div>

                {/* 썸네일 */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 flex-shrink-0">
                  {idea.images?.[0] ? (
                    <img src={idea.images[0]} alt={idea.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{idea.category}</span>
                    <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                      <Shield className="w-3 h-3" /> 보호됨
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{idea.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {idea.author.avatar_url ? (
                      <img src={idea.author.avatar_url} alt={idea.author.username} className="w-4 h-4 rounded-full" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="text-xs text-slate-400">@{idea.author.username}</span>
                  </div>
                </div>

                {/* 조회수 & 가격 */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm justify-end">
                    <Eye className="w-3.5 h-3.5" />
                    {getViewCount(idea).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">조회</div>
                  <div className="text-sm font-bold text-slate-700 mt-1">
                    {idea.price === 0 ? '가격협의' : `₩${idea.price.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">랭킹 데이터를 불러오는 중입니다...</p>
          <p className="text-slate-400 text-sm mt-1">아이디어를 등록하면 랭킹이 시작됩니다</p>
        </div>
      )}
    </div>
  )
}
