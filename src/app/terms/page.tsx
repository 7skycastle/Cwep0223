import { Shield, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">이용약관</h1>
            <p className="text-slate-500 text-sm">최종 수정일: 2026년 02월 23일</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-8 prose prose-slate max-w-none">
          {[
            {
              title: '제1조 (목적)',
              content: `본 약관은 아이디어마켓(이하 "회사")이 운영하는 아이디어 마켓플레이스 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.`
            },
            {
              title: '제2조 (정의)',
              content: `① "서비스"란 회사가 제공하는 아이디어 등록, 저작권 보호, 구매·판매 연결 및 관련 부가 서비스를 의미합니다.\n② "이용자"란 본 약관에 동의하고 서비스를 이용하는 회원을 말합니다.\n③ "아이디어"란 이용자가 서비스에 등록한 가상의 상품 아이디어, 개념, 설계 등을 의미합니다.\n④ "저작권 해시"란 아이디어 등록 시 자동으로 생성되는 SHA-256 기반의 고유 식별 코드를 의미합니다.`
            },
            {
              title: '제3조 (약관의 효력 및 변경)',
              content: `① 본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.\n② 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과하면 효력이 발생합니다.`
            },
            {
              title: '제4조 (회원가입)',
              content: `① 이용자는 회사가 정한 가입 양식에 따라 정보를 기입한 후 본 약관에 동의하여 회원가입을 신청합니다.\n② 만 14세 미만의 아동은 회원가입을 할 수 없습니다.\n③ 이용자는 실명 및 실제 정보를 등록해야 하며, 허위 정보 등록으로 인한 불이익은 이용자 본인에게 귀속됩니다.`
            },
            {
              title: '제5조 (저작권 보호 서비스)',
              content: `① 서비스는 이용자가 아이디어를 등록할 때 SHA-256 알고리즘을 사용하여 고유한 저작권 해시를 생성하고 타임스탬프와 함께 기록합니다.\n② 저작권 해시는 아이디어의 최초 등록 시점과 내용을 증명하는 데 활용될 수 있습니다.\n③ 단, 본 서비스의 저작권 보호는 법적 효력을 보증하지 않으며, 공식 저작권 등록은 관계 당국을 통해 진행하셔야 합니다.`
            },
            {
              title: '제6조 (거래 및 수수료)',
              content: `① 모든 거래는 구매자와 판매자 간의 합의로 이루어지며, 회사는 중개 역할만을 수행합니다.\n② 거래 성사 시 회사는 거래 금액의 일정 비율을 수수료로 수취할 수 있습니다.\n③ 사기 거래 등 비정상적인 거래에 대한 책임은 해당 거래 당사자에게 있습니다.`
            },
            {
              title: '제7조 (금지행위)',
              content: `① 타인의 지적재산권을 침해하는 아이디어 등록\n② 허위 또는 과장된 정보 기재\n③ 불법적인 목적으로 서비스 이용\n④ 서비스의 안정적 운영을 방해하는 행위\n⑤ 타 이용자에 대한 사기, 협박, 불쾌감을 주는 행위`
            },
            {
              title: '제8조 (면책조항)',
              content: `① 회사는 이용자 간 거래로 발생한 분쟁에 대해 책임을 지지 않습니다.\n② 회사는 서비스의 중단, 데이터 손실 등에 대해 불가항력적 사유가 있는 경우 책임을 지지 않습니다.`
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}

          <div className="mt-8 p-4 bg-indigo-50 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-700">
              문의사항이 있으시면 <strong>support@ideamarket.kr</strong>로 연락해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
