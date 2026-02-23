export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PurchaseModal } from '@/components/ideas/PurchaseModal'
import { ViewTracker } from '@/components/ideas/ViewTracker'
import {
  Shield, Eye, Calendar, Tag, User, ShoppingCart,
  BookmarkPlus, Share2, ChevronLeft, Video, Hash, Clock
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: idea } = await supabase
    .from('ideas')
    .select(`
      *,
      author:profiles(id, username, full_name, avatar_url, bio, ideas_count, sales_count)
    `)
    .eq('id', id)
    .single()

  if (!idea) notFound()

  // 저작권 정보
  const { data: copyright } = await supabase
    .from('copyrights')
    .select('*')
    .eq('idea_id', id)
    .single()

  // 관련 아이디어
  const { data: relatedIdeas } = await supabase
    .from('ideas')
    .select('id, title, images, price, view_count, category, author:profiles(username, avatar_url)')
    .eq('category', idea.category)
    .eq('status', 'active')
    .neq('id', id)
    .limit(4)

  // 북마크 여부
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('idea_id', id)
      .single()
    isBookmarked = !!bookmark
  }

  const isOwner = user?.id === idea.author_id
  const formattedPrice = idea.price === 0 ? '가격협의' : `₩${idea.price.toLocaleString()}`
  const timeAgo = formatDistanceToNow(new Date(idea.created_at), { addSuffix: true, locale: ko })
  const registeredDate = format(new Date(idea.copyright_registered_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {/* 조회수 추적 */}
      <ViewTracker ideaId={id} userId={user?.id} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link href="/ideas"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> 아이디어 목록으로
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 미디어 & 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 메인 이미지 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              {idea.images && idea.images.length > 0 ? (
                <div>
                  <img
                    src={idea.images[0]}
                    alt={idea.title}
                    className="w-full h-80 object-cover"
                  />
                  {/* 이미지 썸네일 */}
                  {idea.images.length > 1 && (
                    <div className="flex gap-2 p-4">
                      {idea.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-16 h-16 object-cover rounded-xl border-2 border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <div className="text-8xl opacity-20">💡</div>
                </div>
              )}
            </div>

            {/* 영상 */}
            {idea.video_url && (
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-slate-800">아이디어 소개 영상</span>
                </div>
                <video src={idea.video_url} controls className="w-full" />
              </div>
            )}

            {/* 상세 정보 */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              {/* 카테고리 & 배지 */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-semibold">
                  {idea.category}
                </span>
                {copyright && (
                  <span className="flex items-center gap-1.5 text-sm px-3 py-1 bg-green-50 text-green-600 rounded-full font-semibold">
                    <Shield className="w-3.5 h-3.5" /> 저작권 보호됨
                  </span>
                )}
                {idea.status === 'sold' && (
                  <span className="text-sm px-3 py-1 bg-red-50 text-red-500 rounded-full font-semibold">판매완료</span>
                )}
              </div>

              <h1 className="text-2xl font-black text-slate-900 mb-4">{idea.title}</h1>

              {/* 통계 */}
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {idea.view_count.toLocaleString()}회 조회</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {timeAgo}</span>
                {idea.purchase_requests_count > 0 && (
                  <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> {idea.purchase_requests_count}개 구매 요청</span>
                )}
              </div>

              {/* 설명 */}
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-slate-800 mb-3">아이디어 소개</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{idea.description}</p>

                {idea.detailed_description && (
                  <>
                    <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3">상세 설명</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{idea.detailed_description}</p>
                  </>
                )}
              </div>

              {/* 태그 */}
              {idea.tags && idea.tags.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {idea.tags.map((tag: string) => (
                      <Link key={tag} href={`/ideas?search=${encodeURIComponent(tag)}`}
                        className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 저작권 정보 */}
            {copyright && (
              <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">저작권 보호 정보</h3>
                    <p className="text-sm text-slate-500">이 아이디어는 블록체인 수준의 보안으로 보호됩니다</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <Hash className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700">저작권 해시 (SHA-256)</p>
                      <p className="text-xs text-green-600 font-mono break-all mt-0.5">{copyright.copyright_hash}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600">저작권 등록일시</p>
                      <p className="text-xs text-slate-500 mt-0.5">{registeredDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 관련 아이디어 */}
            {relatedIdeas && relatedIdeas.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4">관련 아이디어</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {relatedIdeas.map((related: any) => (
                    <Link key={related.id} href={`/ideas/${related.id}`}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group">
                      <div className="h-28 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
                        {related.images?.[0] ? (
                          <img src={related.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">💡</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-slate-500 mb-1">{related.category}</p>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{related.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">@{related.author?.username}</span>
                          <span className="text-xs font-bold text-indigo-600">
                            {related.price === 0 ? '가격협의' : `₩${related.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 구매 패널 */}
          <div className="space-y-5">
            {/* 가격 & 구매 */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <div className="text-3xl font-black text-indigo-600 mb-1">{formattedPrice}</div>
              {idea.price > 0 && <p className="text-xs text-slate-400 mb-5">협상 가능 (구매 요청 시 제안 가능)</p>}

              {!isOwner && idea.status === 'active' && (
                <div className="space-y-3 mb-5">
                  {user ? (
                    <PurchaseModal idea={idea} userId={user.id} />
                  ) : (
                    <Link href={`/login?redirect=/ideas/${id}`}
                      className="block w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-center hover:shadow-lg transition-all">
                      로그인 후 구매 요청
                    </Link>
                  )}
                  <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <BookmarkPlus className="w-4 h-4" /> 북마크
                  </button>
                  <button className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> 공유하기
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="space-y-2 mb-5">
                  <Link href={`/ideas/${id}/edit`}
                    className="block w-full py-3.5 border border-indigo-300 text-indigo-600 rounded-xl font-bold text-center hover:bg-indigo-50 transition-colors">
                    아이디어 수정
                  </Link>
                  <p className="text-xs text-slate-400 text-center">내 아이디어입니다</p>
                </div>
              )}

              {idea.status === 'sold' && (
                <div className="text-center py-4 bg-red-50 rounded-xl mb-5">
                  <p className="font-bold text-red-600">판매 완료된 아이디어입니다</p>
                </div>
              )}

              {/* 구매 보호 안내 */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>저작권 보호된 아이디어</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                  <span>안전한 플랫폼 내 거래</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>판매자 직접 소통</span>
                </div>
              </div>
            </div>

            {/* 작성자 정보 */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">작성자</h3>
              <div className="flex items-center gap-3 mb-4">
                {idea.author.avatar_url ? (
                  <img src={idea.author.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">@{idea.author.username}</p>
                  {idea.author.full_name && <p className="text-sm text-slate-500">{idea.author.full_name}</p>}
                </div>
              </div>
              {idea.author.bio && (
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">{idea.author.bio}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-lg font-black text-slate-800">{idea.author.ideas_count || 0}</div>
                  <div className="text-xs text-slate-500">등록 아이디어</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="text-lg font-black text-slate-800">{idea.author.sales_count || 0}</div>
                  <div className="text-xs text-slate-500">거래 완료</div>
                </div>
              </div>
              <Link href={`/profile/${idea.author.username}`}
                className="block mt-4 text-center py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                프로필 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
