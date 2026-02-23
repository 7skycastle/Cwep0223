export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import Link from 'next/link'
import { Lightbulb, Upload, Eye, ShoppingBag, TrendingUp, Plus } from 'lucide-react'

export default async function MyIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/my-ideas')

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const activeIdeas = ideas?.filter(i => i.status === 'active') || []
  const soldIdeas = ideas?.filter(i => i.status === 'sold') || []
  const draftIdeas = ideas?.filter(i => i.status === 'draft') || []
  const totalViews = ideas?.reduce((s, i) => s + (i.view_count || 0), 0) || 0
  const totalRequests = ideas?.reduce((s, i) => s + (i.purchase_requests_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">내 아이디어</h1>
            <p className="text-slate-500 mt-1">등록한 아이디어를 관리하세요</p>
          </div>
          <Link href="/upload"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all text-sm">
            <Plus className="w-4 h-4" /> 새 아이디어
          </Link>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: '전체 아이디어', value: ideas?.length || 0, icon: Lightbulb, color: 'from-indigo-400 to-purple-500' },
            { label: '판매 완료', value: soldIdeas.length, icon: ShoppingBag, color: 'from-green-400 to-emerald-500' },
            { label: '누적 조회수', value: totalViews.toLocaleString(), icon: Eye, color: 'from-blue-400 to-cyan-500' },
            { label: '구매 요청', value: totalRequests, icon: TrendingUp, color: 'from-orange-400 to-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {ideas && ideas.length > 0 ? (
          <div className="space-y-8">
            {activeIdeas.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> 판매 중 ({activeIdeas.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {activeIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
                </div>
              </div>
            )}
            {soldIdeas.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> 판매 완료 ({soldIdeas.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {soldIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
                </div>
              </div>
            )}
            {draftIdeas.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> 임시저장 ({draftIdeas.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {draftIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Upload className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">아직 등록한 아이디어가 없습니다</h3>
            <p className="text-slate-400 mb-6 text-sm">첫 번째 아이디어를 등록하고 저작권 보호를 받으세요</p>
            <Link href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> 첫 아이디어 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
