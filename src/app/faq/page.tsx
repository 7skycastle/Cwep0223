import Link from 'next/link'
import { Lightbulb, ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: '계정 및 가입',
    items: [
      {
        q: '회원가입은 어떻게 하나요?',
        a: '우측 상단의 "회원가입" 버튼을 클릭하거나 Google 계정으로 간편하게 가입할 수 있습니다. 이메일로 가입 시 인증 메일이 발송됩니다.',
      },
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 페이지에서 "비밀번호 찾기"를 클릭하면 가입한 이메일로 재설정 링크를 보내드립니다.',
      },
      {
        q: '계정을 탈퇴하고 싶어요.',
        a: '설정 페이지에서 계정 탈퇴 신청이 가능합니다. 탈퇴 시 업로드한 아이디어와 관련 데이터가 삭제될 수 있으니 신중하게 결정해 주세요.',
      },
    ],
  },
  {
    category: '아이디어 업로드',
    items: [
      {
        q: '어떤 형식의 아이디어를 업로드할 수 있나요?',
        a: '텍스트 설명, 이미지(JPG/PNG/GIF, 최대 5장), 짧은 영상(MP4/MOV, 최대 100MB)을 포함한 아이디어를 업로드할 수 있습니다. 기술, 앱, 콘텐츠, 비즈니스 등 13개 카테고리 중 선택하세요.',
      },
      {
        q: '업로드하면 저작권이 자동으로 보호되나요?',
        a: '네! 업로드 즉시 아이디어 내용의 SHA-256 해시값과 타임스탬프가 생성되어 저장됩니다. 이를 통해 아이디어의 최초 등록 시점을 증명할 수 있습니다.',
      },
      {
        q: '아이디어 가격은 어떻게 설정하나요?',
        a: '업로드 시 원하는 가격을 자유롭게 설정할 수 있습니다. "가격 협의 가능" 옵션을 선택하면 구매자와 직접 협상도 가능합니다.',
      },
      {
        q: '업로드 후 아이디어를 수정할 수 있나요?',
        a: '제목, 설명, 가격, 태그 등은 수정 가능합니다. 단, 저작권 해시는 최초 업로드 시 생성된 값이 유지됩니다.',
      },
    ],
  },
  {
    category: '구매 및 거래',
    items: [
      {
        q: '아이디어 구매 과정은 어떻게 되나요?',
        a: '마음에 드는 아이디어의 "구매 요청" 버튼을 눌러 희망 금액과 메시지를 작성합니다. 판매자가 수락하면 직접 연락하여 거래를 진행합니다.',
      },
      {
        q: '거래 금액 지불은 플랫폼에서 이루어지나요?',
        a: '현재는 판매자와 구매자가 직접 협의하여 거래합니다. 향후 안전한 에스크로 결제 시스템 도입을 준비 중입니다.',
      },
      {
        q: '사기 거래를 당한 경우 어떻게 하나요?',
        a: '신고 기능을 통해 해당 아이디어나 사용자를 신고해주세요. 운영팀이 검토 후 조치합니다. 거래 내용 증거를 보관해두시면 분쟁 해결에 도움이 됩니다.',
      },
    ],
  },
  {
    category: '랭킹 시스템',
    items: [
      {
        q: '랭킹은 어떻게 산정되나요?',
        a: '일간/주간/월간 조회수를 기준으로 랭킹이 결정됩니다. 조회수는 매일 자정 기준으로 집계됩니다.',
      },
      {
        q: '같은 사람이 여러 번 조회하면 조회수가 올라가나요?',
        a: '동일한 세션에서 중복 조회는 카운트되지 않습니다. 공정한 랭킹 유지를 위해 어뷰징 방지 시스템을 운영합니다.',
      },
    ],
  },
  {
    category: '서비스 정책',
    items: [
      {
        q: '어떤 아이디어는 업로드할 수 없나요?',
        a: '타인의 저작권을 침해하는 내용, 불법적인 내용, 음란물, 혐오 표현, 개인정보를 포함한 아이디어는 업로드할 수 없습니다. 위반 시 계정 제재가 이루어집니다.',
      },
      {
        q: '서비스 이용은 무료인가요?',
        a: '현재 기본 서비스는 모두 무료입니다. 향후 프리미엄 기능(광고 노출, 우선 노출 등)은 유료로 제공될 예정입니다.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-semibold mb-4">
            <Lightbulb className="w-4 h-4" /> 자주 묻는 질문
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">FAQ</h1>
          <p className="text-slate-500 text-lg">
            아이디어마켓 이용에 관한 자주 묻는 질문들을 모았습니다.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-black text-slate-900 mb-4 pb-2 border-b-2 border-indigo-100">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <details key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <span className="font-semibold text-slate-800 pr-4">{item.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-xl font-black mb-2">원하는 답변을 찾지 못하셨나요?</h3>
          <p className="text-indigo-200 mb-6">문의 사항이 있으시면 언제든지 연락해주세요.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
          >
            문의하기
          </Link>
        </div>
      </div>
    </div>
  )
}
