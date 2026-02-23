import Link from 'next/link'
import { Lightbulb, Shield, TrendingUp, Users, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: '아이디어 공유',
    desc: '누구나 자신의 아이디어를 업로드하고 세상에 공개할 수 있습니다. 텍스트, 이미지, 영상으로 아이디어를 풍부하게 표현하세요.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '저작권 보호',
    desc: '업로드 즉시 SHA-256 해시와 타임스탬프로 아이디어의 최초 등록 시점을 증명합니다. 아이디어 도용 걱정 없이 공유하세요.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '아이디어 거래',
    desc: '창의적인 아이디어를 원하는 기업가, 개발자, 투자자와 연결됩니다. 아이디어가 곧 가치입니다.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: '랭킹 시스템',
    desc: '일간/주간/월간 인기 아이디어를 한눈에 파악하세요. 트렌드를 읽고 시장의 니즈를 발견할 수 있습니다.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'AI 활용',
    desc: '인공지능 기술을 활용한 아이디어 카테고리 분류, 관련 아이디어 추천 기능을 제공합니다.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: '글로벌 커뮤니티',
    desc: '국내외 아이디어 창작자들과 연결되어 새로운 협업 기회를 발견하세요.',
    color: 'bg-indigo-100 text-indigo-600',
  },
]

const stats = [
  { label: '누적 아이디어', value: '10,000+' },
  { label: '활성 회원', value: '5,000+' },
  { label: '성사된 거래', value: '500+' },
  { label: '카테고리', value: '13개' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur mb-6 shadow-xl">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-6">아이디어마켓 소개</h1>
          <p className="text-xl text-indigo-100 leading-relaxed max-w-2xl mx-auto">
            창의적인 아이디어가 세상을 바꿉니다.<br />
            아이디어마켓은 아이디어 창작자와 실현자를 연결하는<br />
            대한민국 최초의 아이디어 거래 플랫폼입니다.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-indigo-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">우리의 미션</h2>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              &ldquo;모든 아이디어는 가치 있습니다. 하지만 그 가치를 인정받지 못한 채 사라지는 아이디어가 너무 많습니다.
              우리는 창의적인 사람들이 자신의 아이디어로 수익을 창출하고,
              그 아이디어를 실현할 수 있는 사람들과 만날 수 있는 공간을 만들고자 합니다.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">주요 기능</h2>
            <p className="text-slate-500">아이디어마켓이 제공하는 핵심 서비스입니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">서비스 탄생 배경</h2>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4 text-slate-600 leading-relaxed">
            <p>
              많은 사람들이 일상에서 훌륭한 아이디어를 떠올리지만, 대부분은 실행으로 이어지지 못합니다.
              기술이 없어서, 자금이 없어서, 혹은 단순히 시간이 없어서.
            </p>
            <p>
              반면, 새로운 아이디어를 찾는 기업가, 스타트업, 투자자들은 항상 존재합니다.
              이 두 그룹을 연결해주는 플랫폼이 필요하다는 생각에서 아이디어마켓이 탄생했습니다.
            </p>
            <p>
              아이디어마켓은 단순한 거래 플랫폼을 넘어, 창의적인 사람들이 자신의 가치를 인정받고
              더 나은 세상을 만들어가는 커뮤니티를 지향합니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">지금 바로 시작하세요</h2>
          <p className="text-indigo-200 mb-8 text-lg">
            당신의 아이디어를 세상에 공개하고, 가치를 인정받으세요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              무료 회원가입
            </Link>
            <Link
              href="/ideas"
              className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              아이디어 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
