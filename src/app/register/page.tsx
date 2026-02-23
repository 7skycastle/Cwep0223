'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lightbulb, Mail, Lock, Eye, EyeOff, User, AtSign, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }
    if (form.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }
    if (form.username.length < 3) {
      setError('사용자명은 최소 3자 이상이어야 합니다.')
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.')
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          full_name: form.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 등록된 이메일 주소입니다.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">이메일을 확인해주세요!</h2>
          <p className="text-slate-600 mb-2">
            <span className="font-semibold text-indigo-600">{form.email}</span>으로<br />
            인증 메일을 발송했습니다.
          </p>
          <p className="text-slate-500 text-sm mb-8">이메일의 링크를 클릭하여 가입을 완료하세요.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            로그인 페이지로 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-4">회원가입</h1>
          <p className="text-slate-500 mt-1.5">아이디어마켓과 함께 혁신을 시작하세요</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* 이름 & 사용자명 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">사용자명 *</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="username"
                    required
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">이메일 *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호 * <span className="text-xs font-normal text-slate-400">(6자 이상)</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="비밀번호 (6자 이상)"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호 확인 *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 재입력"
                  required
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-300'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" id="terms" required className="mt-0.5 rounded" />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                <Link href="/terms" className="text-indigo-600 hover:underline">이용약관</Link>과{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">개인정보처리방침</Link>에 동의합니다. (필수)
              </label>
            </div>

            {/* 가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 가입 처리 중...</>
              ) : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
