'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lightbulb, Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('이메일 전송에 실패했습니다. 다시 시도해주세요.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-4">비밀번호 찾기</h1>
          <p className="text-slate-500 mt-1.5">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">이메일을 확인해주세요</h3>
              <p className="text-slate-500 text-sm mb-6">
                <span className="font-semibold text-indigo-600">{email}</span>으로<br />
                비밀번호 재설정 링크를 발송했습니다.
              </p>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  ⚠ {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">가입한 이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 전송 중...</> : '재설정 링크 전송'}
                </button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-5">
                <Link href="/login" className="flex items-center justify-center gap-1 text-indigo-600 font-semibold hover:underline">
                  <ArrowLeft className="w-3 h-3" /> 로그인으로 돌아가기
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
