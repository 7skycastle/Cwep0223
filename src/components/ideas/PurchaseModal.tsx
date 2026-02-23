'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, X, Loader2, CheckCircle, MessageSquare } from 'lucide-react'

interface PurchaseModalProps {
  idea: {
    id: string
    title: string
    price: number
    author_id: string
  }
  userId: string
}

export function PurchaseModal({ idea, userId }: PurchaseModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [offeredPrice, setOfferedPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('purchase_requests').insert({
      idea_id: idea.id,
      buyer_id: userId,
      seller_id: idea.author_id,
      message: message,
      offered_price: offeredPrice ? parseFloat(offeredPrice) : idea.price,
    })

    if (!error) {
      // 구매요청 수 업데이트
      await supabase
        .from('ideas')
        .update({ purchase_requests_count: supabase.rpc('increment') })
        .eq('id', idea.id)

      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        구매 요청하기
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md fade-in">
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">구매 요청 완료!</h3>
                <p className="text-slate-500 text-sm mb-6">
                  판매자에게 구매 요청이 전달되었습니다.<br />
                  판매자의 응답을 기다려주세요.
                </p>
                <button
                  onClick={() => { setIsOpen(false); setSuccess(false) }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">구매 요청</h3>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* 아이디어 정보 */}
                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <p className="text-xs text-indigo-600 font-semibold mb-1">구매 요청 아이디어</p>
                    <p className="font-bold text-slate-800 text-sm">{idea.title}</p>
                    <p className="text-indigo-600 font-black mt-1">
                      {idea.price === 0 ? '가격협의' : `₩${idea.price.toLocaleString()}`}
                    </p>
                  </div>

                  {/* 제안 가격 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      제안 가격 (원)
                      <span className="text-xs font-normal text-slate-400 ml-2">비워두면 정가 제안</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₩</span>
                      <input
                        type="number"
                        value={offeredPrice}
                        onChange={e => setOfferedPrice(e.target.value)}
                        placeholder={idea.price === 0 ? '가격 제안' : idea.price.toString()}
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* 메시지 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <MessageSquare className="inline w-4 h-4 mr-1" />
                      구매 의향 메시지 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="이 아이디어를 구매하려는 이유, 활용 계획, 특별 조건 등을 작성해주세요"
                      rows={4}
                      required
                      maxLength={1000}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">{message.length}/1000자</p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 전송 중...</> : '구매 요청 전송'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
