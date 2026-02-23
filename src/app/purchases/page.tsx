export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, XCircle, MessageSquare, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const STATUS_MAP = {
  pending: { label: '검토 중', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  accepted: { label: '수락됨', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  rejected: { label: '거절됨', color: 'bg-red-100 text-red-600', icon: XCircle },
  completed: { label: '거래 완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: '취소됨', color: 'bg-slate-100 text-slate-500', icon: XCircle },
}

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/purchases')

  // 보낸 구매 요청 (내가 구매자)
  const { data: sentRequests } = await supabase
    .from('purchase_requests')
    .select('*, idea:ideas(id, title, images, price, category), seller:profiles!purchase_requests_seller_id_fkey(username, avatar_url)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  // 받은 구매 요청 (내가 판매자)
  const { data: receivedRequests } = await supabase
    .from('purchase_requests')
    .select('*, idea:ideas(id, title, images, price, category), buyer:profiles!purchase_requests_buyer_id_fkey(username, avatar_url)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const RequestCard = ({ req, type }: { req: Record<string, unknown>; type: 'sent' | 'received' }) => {
    const status = STATUS_MAP[(req.status as string) as keyof typeof STATUS_MAP] || STATUS_MAP.pending
    const StatusIcon = status.icon
    const idea = req.idea as { id: string; title: string; images: string[]; price: number; category: string }
    const other = (type === 'sent'
      ? req.seller
      : req.buyer) as { username: string; avatar_url?: string }
    const timeAgo = formatDistanceToNow(new Date(req.created_at as string), { addSuffix: true, locale: ko })

    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-indigo-100 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-indigo-50 flex-shrink-0">
            {idea?.images?.[0] ? (
              <img src={idea.images[0]} alt="" className="w-full h-full object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                <StatusIcon className="w-3 h-3" /> {status.label}
              </span>
              <span className="text-xs text-slate-400">{timeAgo}</span>
            </div>
            <Link href={`/ideas/${idea?.id}`}
              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm line-clamp-1">
              {idea?.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">
                {type === 'sent' ? '판매자' : '구매자'}: @{other?.username}
              </span>
              {req.offered_price != null && (
                <span className="text-xs font-semibold text-indigo-600">
                  제안가: ₩{Number(req.offered_price).toLocaleString()}
                </span>
              )}
            </div>
            {(req.message as string | null) && (
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 rounded-lg p-2">
                &ldquo;{req.message as string}&rdquo;
              </p>
            )}
          </div>
          <Link href={`/messages?request=${req.id}`}
            className="flex-shrink-0 p-2 hover:bg-indigo-50 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">구매 내역</h1>
            <p className="text-slate-500 text-sm">구매 요청 현황을 확인하세요</p>
          </div>
        </div>

        {/* 받은 구매 요청 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              받은 구매 요청 <span className="text-indigo-600 text-base">({receivedRequests?.length || 0})</span>
            </h2>
            {receivedRequests?.some(r => r.status === 'pending') && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                <Clock className="w-3 h-3" /> 검토 필요
              </span>
            )}
          </div>
          {receivedRequests && receivedRequests.length > 0 ? (
            <div className="space-y-3">
              {receivedRequests.map(req => <RequestCard key={req.id as string} req={req as Record<string, unknown>} type="received" />)}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">아직 받은 구매 요청이 없습니다</p>
            </div>
          )}
        </div>

        {/* 보낸 구매 요청 */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            보낸 구매 요청 <span className="text-indigo-600 text-base">({sentRequests?.length || 0})</span>
          </h2>
          {sentRequests && sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map(req => <RequestCard key={req.id as string} req={req as Record<string, unknown>} type="sent" />)}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">아직 보낸 구매 요청이 없습니다</p>
              <Link href="/marketplace" className="text-indigo-600 text-sm font-semibold hover:underline mt-2 block">
                마켓플레이스 둘러보기 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
