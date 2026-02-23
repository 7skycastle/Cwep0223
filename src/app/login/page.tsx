import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-400">로딩 중...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
