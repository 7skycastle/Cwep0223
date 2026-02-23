'use client'

import Link from 'next/link'
import { Eye, Shield, Tag, User, Video } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface IdeaCardProps {
  idea: {
    id: string
    title: string
    description: string
    category: string
    price: number
    currency: string
    images: string[]
    video_url?: string
    tags: string[]
    view_count: number
    copyright_hash: string
    created_at: string
    author: {
      id: string
      username: string
      full_name?: string
      avatar_url?: string
    }
    status: string
    purchase_requests_count?: number
  }
  rank?: number
  rankPeriod?: 'daily' | 'weekly' | 'monthly'
}

const CATEGORY_COLORS: Record<string, string> = {
  '기술/IT': 'bg-blue-100 text-blue-700',
  '패션/뷰티': 'bg-pink-100 text-pink-700',
  '식품/음료': 'bg-orange-100 text-orange-700',
  '건강/의료': 'bg-green-100 text-green-700',
  '교육': 'bg-purple-100 text-purple-700',
  '엔터테인먼트': 'bg-yellow-100 text-yellow-700',
  '환경/지속가능성': 'bg-emerald-100 text-emerald-700',
  '스마트홈': 'bg-cyan-100 text-cyan-700',
  '반려동물': 'bg-amber-100 text-amber-700',
  '여행/레저': 'bg-teal-100 text-teal-700',
  '금융/핀테크': 'bg-indigo-100 text-indigo-700',
  '소셜/커뮤니티': 'bg-rose-100 text-rose-700',
  '기타': 'bg-slate-100 text-slate-700',
}

const RANK_MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export function IdeaCard({ idea, rank, rankPeriod }: IdeaCardProps) {
  const categoryColor = CATEGORY_COLORS[idea.category] || 'bg-slate-100 text-slate-700'
  const formattedPrice = idea.price === 0
    ? '가격협의'
    : `₩${idea.price.toLocaleString()}`

  const timeAgo = formatDistanceToNow(new Date(idea.created_at), {
    addSuffix: true,
    locale: ko
  })

  const thumbnailUrl = idea.images?.[0] || null

  return (
    <Link href={`/ideas/${idea.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover shadow-sm">
        {/* 썸네일 */}
        <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={idea.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">💡</div>
            </div>
          )}

          {/* 랭크 배지 */}
          {rank !== undefined && (
            <div className="absolute top-3 left-3 text-2xl">
              {RANK_MEDALS[rank - 1] || `#${rank}`}
            </div>
          )}

          {/* 비디오 배지 */}
          {idea.video_url && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-lg text-xs">
              <Video className="w-3 h-3" /> 영상
            </div>
          )}

          {/* 저작권 배지 */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold">
            <Shield className="w-3 h-3" /> 저작권 보호
          </div>

          {/* 판매 완료 오버레이 */}
          {idea.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-lg">판매완료</span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="p-4">
          {/* 카테고리 */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
              {idea.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Eye className="w-3 h-3" />
              <span>{idea.view_count.toLocaleString()}</span>
            </div>
          </div>

          {/* 제목 */}
          <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {idea.title}
          </h3>

          {/* 설명 */}
          <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
            {idea.description}
          </p>

          {/* 태그 */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              <Tag className="w-3 h-3 text-slate-400" />
              {idea.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-slate-400">#{tag}</span>
              ))}
            </div>
          )}

          {/* 하단 */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
              {idea.author.avatar_url ? (
                <img src={idea.author.avatar_url} alt={idea.author.username}
                  className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xs text-slate-500 font-medium">@{idea.author.username}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-indigo-600">{formattedPrice}</div>
              <div className="text-xs text-slate-400">{timeAgo}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
