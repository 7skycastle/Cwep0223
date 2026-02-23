export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { Search, SlidersHorizontal, Lightbulb } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  '전체', '기술/IT', '패션/뷰티', '식품/음료', '건강/의료', '교육',
  '엔터테인먼트', '환경/지속가능성', '스마트홈', '반려동물',
  '여행/레저', '금융/핀테크', '소셜/커뮤니티', '기타'
]

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'views', label: '조회수순' },
  { value: 'price_low', label: '가격 낮은순' },
  { value: 'price_high', label: '가격 높은순' },
]

interface SearchParams {
  search?: string
  category?: string
  sort?: string
  page?: string
  min_price?: string
  max_price?: string
}

export default async function IdeasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  const search = params.search || ''
  const category = params.category || ''
  const sort = params.sort || 'latest'
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('ideas')
    .select('*, author:profiles(id, username, full_name, avatar_url)', { count: 'exact' })
    .eq('status', 'active')

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  if (category && category !== '전체') {
    query = query.eq('category', category)
  }
  if (params.min_price) {
    query = query.gte('price', parseFloat(params.min_price))
  }
  if (params.max_price) {
    query = query.lte('price', parseFloat(params.max_price))
  }

  if (sort === 'views') query = query.order('view_count', { ascending: false })
  else if (sort === 'price_low') query = query.order('price', { ascending: true })
  else if (sort === 'price_high') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  query = query.range(offset, offset + pageSize - 1)

  const { data: ideas, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  const buildUrl = (newParams: Partial<SearchParams>) => {
    const p = { ...params, ...newParams }
    const query = new URLSearchParams()
    Object.entries(p).forEach(([k, v]) => { if (v) query.set(k, v as string) })
    return `/ideas?${query.toString()}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">아이디어 탐색</h1>
          <p className="text-slate-500 mb-6">혁신적인 아이디어를 발견하고 구매하세요</p>

          {/* 검색창 */}
          <form className="flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="아이디어 검색..."
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
              />
            </div>
            <button type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              검색
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 필터 */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-800">필터</span>
              </div>

              {/* 카테고리 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">카테고리</h3>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat}
                      href={buildUrl({ category: cat === '전체' ? '' : cat, page: '1' })}
                      className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                        (cat === '전체' && !category) || cat === category
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 정렬 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">정렬</h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map(opt => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ sort: opt.value, page: '1' })}
                      className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                        sort === opt.value
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <main className="flex-1">
            {/* 결과 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-700 font-semibold">
                  총 <span className="text-indigo-600">{count?.toLocaleString()}</span>개 아이디어
                  {search && <span className="text-slate-500 font-normal"> · &quot;{search}&quot; 검색 결과</span>}
                </p>
              </div>
            </div>

            {/* 아이디어 그리드 */}
            {ideas && ideas.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {ideas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <Link href={buildUrl({ page: String(page - 1) })}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition-colors">
                        ← 이전
                      </Link>
                    )}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Link
                          key={pageNum}
                          href={buildUrl({ page: String(pageNum) })}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                            page === pageNum
                              ? 'bg-indigo-500 text-white'
                              : 'border border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                    {page < totalPages && (
                      <Link href={buildUrl({ page: String(page + 1) })}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition-colors">
                        다음 →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">검색 결과가 없습니다</h3>
                <p className="text-slate-400 mb-6">다른 키워드나 카테고리로 검색해보세요</p>
                <Link href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                  첫 번째 아이디어 등록하기
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
