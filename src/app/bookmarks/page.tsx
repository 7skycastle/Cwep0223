export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import Link from 'next/link'
import { BookmarkCheck, Lightbulb } from 'lucide-react'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/bookmarks')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*, idea:ideas(*, author:profiles(id, username, full_name, avatar_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ideas = bookmarks?.map(b => b.idea).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">북마크</h1>
            <p className="text-slate-500 text-sm">저장한 아이디어 {ideas.length}개</p>
          </div>
        </div>

        {ideas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ideas.map((idea) => idea && <IdeaCard key={(idea as {id: string}).id} idea={idea as Parameters<typeof IdeaCard>[0]['idea']} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
            <BookmarkCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">저장한 아이디어가 없습니다</h3>
            <p className="text-slate-400 mb-6 text-sm">관심 있는 아이디어를 북마크해두세요</p>
            <Link href="/ideas"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
              <Lightbulb className="w-4 h-4" /> 아이디어 탐색하기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
