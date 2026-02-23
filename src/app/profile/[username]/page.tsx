export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { User, Shield, Lightbulb, ShoppingBag, Calendar, Mail, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('author_id', profile.id)
    .neq('status', 'draft')
    .order('created_at', { ascending: false })

  const { data: soldIdeas } = await supabase
    .from('ideas')
    .select('id')
    .eq('author_id', profile.id)
    .eq('status', 'sold')

  const totalViews = ideas?.reduce((sum, idea) => sum + (idea.view_count || 0), 0) || 0
  const isOwner = currentUser?.id === profile.id
  const joinDate = format(new Date(profile.created_at), 'yyyy년 MM월', { locale: ko })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 프로필 헤더 */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-16 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* 아바타 */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl" />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center">
                  <User className="w-14 h-14 text-white/70" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left text-white flex-1">
              <h1 className="text-3xl font-black mb-1">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-white/70 text-lg">@{profile.username}</p>
              {profile.bio && (
                <p className="text-white/80 mt-3 max-w-xl leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {joinDate} 가입
                </span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Globe className="w-4 h-4" /> 웹사이트
                  </a>
                )}
              </div>
            </div>

            {isOwner && (
              <Link href="/settings"
                className="flex-shrink-0 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all text-sm">
                프로필 수정
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: '등록 아이디어', value: ideas?.length || 0, icon: Lightbulb, color: 'text-indigo-600' },
            { label: '거래 완료', value: soldIdeas?.length || 0, icon: ShoppingBag, color: 'text-green-600' },
            { label: '총 조회수', value: totalViews.toLocaleString(), icon: Shield, color: 'text-purple-600' },
            { label: '구매 요청', value: ideas?.reduce((s, i) => s + (i.purchase_requests_count || 0), 0) || 0, icon: Mail, color: 'text-orange-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* 아이디어 목록 */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6">
            등록한 아이디어 <span className="text-indigo-600">{ideas?.length || 0}</span>
          </h2>

          {ideas && ideas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ideas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                {isOwner ? '아직 등록한 아이디어가 없습니다' : '등록한 아이디어가 없습니다'}
              </h3>
              {isOwner && (
                <Link href="/upload"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                  첫 아이디어 등록하기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
