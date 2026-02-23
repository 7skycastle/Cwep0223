'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Globe, FileText, Save, Loader2, CheckCircle, Camera } from 'lucide-react'

export default function SettingsPage() {
  const [form, setForm] = useState({ username: '', full_name: '', bio: '', website: '' })
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setForm({
          username: profile.username || '',
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          website: profile.website || '',
        })
      }
    }
    getProfile()
  }, [supabase, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaveStatus('saving')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 사용자명 중복 체크
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', form.username)
      .neq('id', user.id)
      .single()

    if (existing) {
      setError('이미 사용 중인 사용자명입니다.')
      setLoading(false)
      setSaveStatus('idle')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        full_name: form.full_name,
        bio: form.bio,
        website: form.website,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      setError('저장 중 오류가 발생했습니다.')
    } else {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">프로필 설정</h1>
          <p className="text-slate-500 mt-1 text-sm">프로필 정보를 수정하세요</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* 아바타 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-5">프로필 이미지</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <button type="button"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-500 text-white rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">프로필 사진 변경</p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF (최대 5MB)</p>
                <button type="button" className="mt-2 text-xs text-indigo-600 font-semibold hover:underline">
                  이미지 업로드
                </button>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="font-bold text-slate-800">기본 정보</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">⚠ {error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">사용자명 *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input type="text" value={form.username}
                    onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                    placeholder="username" required
                    className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={form.full_name}
                    onChange={e => setForm({...form, full_name: e.target.value})}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">자기소개</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  placeholder="간단한 자기소개를 작성해주세요" rows={3} maxLength={200}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all resize-none" />
              </div>
              <p className="text-xs text-slate-400 mt-1">{form.bio.length}/200자</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">웹사이트</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={form.website}
                  onChange={e => setForm({...form, website: e.target.value})}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              saveStatus === 'saved'
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200'
            } disabled:opacity-70`}>
            {saveStatus === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
              : saveStatus === 'saved' ? <><CheckCircle className="w-4 h-4" /> 저장 완료!</>
              : <><Save className="w-4 h-4" /> 변경사항 저장</>}
          </button>
        </form>
      </div>
    </div>
  )
}
