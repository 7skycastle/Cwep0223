export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Send, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  const { request: requestId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/messages')

  // 구매 요청 목록 (대화방)
  const { data: requests } = await supabase
    .from('purchase_requests')
    .select(`
      *,
      idea:ideas(id, title, images),
      buyer:profiles!purchase_requests_buyer_id_fkey(id, username, avatar_url),
      seller:profiles!purchase_requests_seller_id_fkey(id, username, avatar_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  // 선택된 대화의 메시지
  const activeRequest = requestId
    ? requests?.find(r => r.id === requestId) || requests?.[0]
    : requests?.[0]

  const { data: messages } = activeRequest
    ? await supabase
        .from('messages')
        .select('*, sender:profiles(username, avatar_url)')
        .eq('purchase_request_id', activeRequest.id)
        .order('created_at', { ascending: true })
    : { data: [] }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-500" /> 메시지
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[600px]">
          {/* 대화 목록 */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <p className="font-bold text-slate-700 text-sm">대화 목록</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {requests && requests.length > 0 ? requests.map(req => {
                const isActive = req.id === activeRequest?.id
                const other = req.buyer_id === user.id
                  ? (req.seller as { id: string; username: string; avatar_url?: string })
                  : (req.buyer as { id: string; username: string; avatar_url?: string })
                const idea = req.idea as { id: string; title: string; images: string[] }
                return (
                  <Link key={req.id} href={`/messages?request=${req.id}`}
                    className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 ${isActive ? 'bg-indigo-50 border-indigo-100' : ''}`}>
                    {other?.avatar_url ? (
                      <img src={other.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">@{other?.username}</p>
                      <p className="text-xs text-slate-400 truncate">{idea?.title}</p>
                    </div>
                  </Link>
                )
              }) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  대화가 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
            {activeRequest ? (
              <>
                {/* 헤더 */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  {(() => {
                    const idea = activeRequest.idea as { id: string; title: string; images: string[] }
                    return (
                      <>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                          {idea?.images?.[0] && <img src={idea.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <Link href={`/ideas/${idea?.id}`}
                            className="font-bold text-slate-800 text-sm hover:text-indigo-600">
                            {idea?.title}
                          </Link>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                            activeRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            activeRequest.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            activeRequest.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>{
                            activeRequest.status === 'pending' ? '검토 중' :
                            activeRequest.status === 'accepted' ? '수락됨' :
                            activeRequest.status === 'completed' ? '완료' : '거절됨'
                          }</span>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* 메시지 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* 초기 구매 요청 메시지 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 mb-1">구매 요청 메시지</p>
                      <div className="bg-indigo-50 rounded-2xl rounded-tl-sm p-3">
                        <p className="text-sm text-slate-700">{activeRequest.message}</p>
                      </div>
                    </div>
                  </div>

                  {messages && messages.map((msg: {id: string; sender_id: string; content: string; created_at: string; sender: { username: string; avatar_url?: string }}) => {
                    const isMe = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                          <div className={`rounded-2xl p-3 ${isMe ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 px-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ko })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 메시지 입력 */}
                <div className="p-4 border-t border-slate-100">
                  <form className="flex gap-3" action={async (formData: FormData) => {
                    'use server'
                    // 서버 액션으로 처리
                  }}>
                    <input type="text" name="message" placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
                    <button type="submit"
                      className="px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">대화를 선택하세요</p>
                  <p className="text-slate-400 text-sm mt-1">구매 요청 후 판매자와 대화할 수 있습니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
