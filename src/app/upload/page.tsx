'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, Image as ImageIcon, Video, Tag, X, Plus,
  Shield, Loader2, AlertCircle, CheckCircle, Lightbulb, Sparkles, Info
} from 'lucide-react'

const CATEGORIES = [
  '기술/IT', '패션/뷰티', '식품/음료', '건강/의료', '교육',
  '엔터테인먼트', '환경/지속가능성', '스마트홈', '반려동물',
  '여행/레저', '금융/핀테크', '소셜/커뮤니티', '기타'
]

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    category: '',
    price: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: 기본정보, 2: 미디어, 3: 확인
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - images.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...newFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
  }, [images.length])

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleVideoUpload = (files: FileList | null) => {
    if (!files || !files[0]) return
    const file = files[0]
    if (file.size > 100 * 1024 * 1024) {
      setError('영상 파일은 100MB 이하만 업로드 가능합니다.')
      return
    }
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '')
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  // SHA-256 해시 생성 (저작권 보호)
  const generateCopyrightHash = async (title: string, description: string, userId: string) => {
    const content = `${title}|${description}|${userId}|${Date.now()}`
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/upload')
        return
      }

      // 저작권 해시 생성
      setUploadProgress('저작권 해시 생성 중...')
      const copyrightHash = await generateCopyrightHash(form.title, form.description, user.id)

      // 이미지 업로드
      const imageUrls: string[] = []
      if (images.length > 0) {
        setUploadProgress('이미지 업로드 중...')
        for (let i = 0; i < images.length; i++) {
          const path = `${user.id}/${Date.now()}_${i}_${images[i].name}`
          const url = await uploadFile(images[i], 'idea-images', path)
          imageUrls.push(url)
        }
      }

      // 영상 업로드
      let videoUrl = null
      if (video) {
        setUploadProgress('영상 업로드 중...')
        const path = `${user.id}/${Date.now()}_${video.name}`
        videoUrl = await uploadFile(video, 'idea-videos', path)
      }

      // 아이디어 등록
      setUploadProgress('아이디어 등록 중...')
      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .insert({
          title: form.title,
          description: form.description,
          detailed_description: form.detailedDescription,
          category: form.category,
          price: parseFloat(form.price) || 0,
          images: imageUrls,
          video_url: videoUrl,
          tags: form.tags,
          author_id: user.id,
          copyright_hash: copyrightHash,
          status: 'active',
        })
        .select()
        .single()

      if (ideaError) throw ideaError

      // 저작권 테이블 등록
      await supabase.from('copyrights').insert({
        idea_id: idea.id,
        owner_id: user.id,
        copyright_hash: copyrightHash,
        metadata: {
          title: form.title,
          registered_at: new Date().toISOString(),
          content_hash: copyrightHash,
        },
      })

      // 프로필 아이디어 수 업데이트
      await supabase.rpc('increment_ideas_count', { user_id: user.id })

      setUploadProgress('완료!')
      router.push(`/ideas/${idea.id}?uploaded=true`)

    } catch (err) {
      console.error(err)
      setError('업로드 중 오류가 발생했습니다. 다시 시도해주세요.')
      setLoading(false)
      setUploadProgress('')
    }
  }

  const isStep1Valid = form.title && form.description && form.category
  const isStep2Valid = images.length > 0

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            저작권 자동 보호
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">아이디어 등록</h1>
          <p className="text-slate-500">업로드와 동시에 SHA-256 해시로 저작권이 보호됩니다</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center mb-10">
          {[
            { num: 1, label: '기본 정보' },
            { num: 2, label: '미디어 업로드' },
            { num: 3, label: '최종 확인' },
          ].map(({ num, label }, idx) => (
            <div key={num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                step === num
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200'
                  : step > num
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {step > num ? <CheckCircle className="w-4 h-4" /> : <span>{num}</span>}
                <span className="hidden sm:block">{label}</span>
              </div>
              {idx < 2 && <div className={`w-8 h-0.5 mx-1 ${step > num ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* STEP 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-6 fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">기본 정보 입력</h2>
                  <p className="text-sm text-slate-500">아이디어의 핵심 정보를 입력하세요</p>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  아이디어 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="예: AI 기반 개인 맞춤형 수면 개선 스마트 베개"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{form.title.length}/100자</p>
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        form.category === cat
                          ? 'bg-indigo-500 text-white border-indigo-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 간단 설명 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  간단 설명 <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400 ml-2">(목록에 표시)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="아이디어를 2-3문장으로 간략히 설명하세요"
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{form.description.length}/300자</p>
              </div>

              {/* 상세 설명 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  상세 설명
                  <span className="text-xs font-normal text-slate-400 ml-2">(상세 페이지에 표시)</span>
                </label>
                <textarea
                  value={form.detailedDescription}
                  onChange={e => setForm({ ...form, detailedDescription: e.target.value })}
                  placeholder="아이디어의 작동 원리, 타겟 고객, 기대 효과, 수익 모델 등을 자세히 설명하세요"
                  rows={6}
                  maxLength={3000}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{form.detailedDescription.length}/3000자</p>
              </div>

              {/* 가격 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  희망 판매가 (원)
                  <span className="text-xs font-normal text-slate-400 ml-2">(0 입력 시 가격협의)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₩</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  태그 <span className="text-xs font-normal text-slate-400">(최대 10개)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="태그 입력 후 Enter 또는 추가 버튼"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    />
                  </div>
                  <button type="button" onClick={addTag}
                    className="px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(tag => (
                    <span key={tag}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 단계 →
              </button>
            </div>
          )}

          {/* STEP 2: 미디어 업로드 */}
          {step === 2 && (
            <div className="space-y-6 fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">미디어 업로드</h2>
                  <p className="text-sm text-slate-500">이미지는 필수, 영상은 선택입니다</p>
                </div>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  대표 이미지 <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400 ml-2">(최대 5장, JPG/PNG/GIF)</span>
                </label>

                {/* 이미지 프리뷰 */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                          대표 이미지
                        </div>
                      )}
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-1" />
                      <span className="text-xs text-slate-400 group-hover:text-indigo-400">추가</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => handleImageUpload(e.target.files)}
                      />
                    </label>
                  )}
                </div>

                {/* 드래그앤드롭 영역 */}
                {images.length === 0 && (
                  <label
                    className="block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-indigo-50 group"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files) }}
                  >
                    <Upload className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                    <p className="text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">클릭하거나 이미지를 드래그하세요</p>
                    <p className="text-slate-400 text-sm mt-1">JPG, PNG, GIF (최대 10MB)</p>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => handleImageUpload(e.target.files)} />
                  </label>
                )}
              </div>

              {/* 영상 업로드 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  아이디어 소개 영상 <span className="text-slate-400 font-normal text-xs ml-2">(선택, 최대 100MB)</span>
                </label>

                {videoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                    <video src={videoPreview} controls className="w-full max-h-64 object-contain" />
                    <button
                      onClick={() => { setVideo(null); setVideoPreview(null) }}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-purple-50 group">
                    <Video className="w-10 h-10 text-slate-300 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                    <p className="text-slate-500 group-hover:text-purple-600 transition-colors font-medium">영상 파일 선택</p>
                    <p className="text-slate-400 text-sm mt-1">MP4, MOV, AVI (최대 100MB)</p>
                    <input type="file" accept="video/*" className="hidden"
                      onChange={e => handleVideoUpload(e.target.files)} />
                  </label>
                )}
              </div>

              {/* 저작권 안내 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">저작권 자동 보호</p>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    등록 즉시 제목, 설명, 작성자 정보를 기반으로 SHA-256 해시가 생성되어
                    최초 등록 시간과 내용이 변경 불가능한 형태로 기록됩니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                  ← 이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
                  다음 단계 →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 최종 확인 */}
          {step === 3 && (
            <div className="space-y-6 fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">최종 확인</h2>
                  <p className="text-sm text-slate-500">등록 전 내용을 확인하세요</p>
                </div>
              </div>

              {/* 미리보기 카드 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                {imagePreviews[0] && (
                  <img src={imagePreviews[0]} alt="" className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium">
                      {form.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <Shield className="w-3 h-3" /> 저작권 보호 예정
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{form.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{form.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {form.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                      이미지 {images.length}장 {video ? '· 영상 1개' : ''}
                    </div>
                    <div className="text-xl font-black text-indigo-600">
                      {parseFloat(form.price) === 0 || !form.price
                        ? '가격협의'
                        : `₩${parseFloat(form.price).toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 저작권 안내 */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">등록 전 확인사항</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-0.5 leading-relaxed list-disc list-inside">
                    <li>업로드한 아이디어는 본인이 직접 창작하거나 AI를 활용하여 생성한 것입니다.</li>
                    <li>타인의 저작권을 침해하는 내용은 포함되지 않습니다.</li>
                    <li>등록 즉시 저작권 해시가 생성되어 변경이 어렵습니다.</li>
                  </ul>
                </div>
              </div>

              {loading && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-3 text-indigo-700">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">{uploadProgress}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={loading}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50">
                  ← 이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 등록 중...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> 저작권 보호와 함께 등록하기</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
