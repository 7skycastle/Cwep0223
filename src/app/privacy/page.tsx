import { Lock, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">개인정보처리방침</h1>
            <p className="text-slate-500 text-sm">최종 수정일: 2026년 02월 23일</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-8">
          {[
            {
              title: '1. 개인정보의 처리 목적',
              content: `아이디어마켓은 다음의 목적을 위하여 개인정보를 처리합니다.\n\n• 회원 가입 및 관리: 서비스 이용에 따른 본인확인, 개인식별\n• 서비스 제공: 아이디어 등록/구매, 저작권 보호 서비스 제공\n• 거래 연결: 구매자-판매자 간 연결 및 커뮤니케이션 지원\n• 마케팅 및 광고: 맞춤형 서비스 및 광고 제공 (동의 시)`,
            },
            {
              title: '2. 처리하는 개인정보 항목',
              content: `필수 항목: 이메일 주소, 사용자명, 비밀번호(암호화 저장)\n선택 항목: 이름, 자기소개, 웹사이트, 프로필 이미지\n자동 수집 항목: IP 주소, 접속 시간, 서비스 이용 기록`,
            },
            {
              title: '3. 개인정보의 처리 및 보유 기간',
              content: `• 회원 정보: 회원 탈퇴 시까지\n• 거래 기록: 거래 완료 후 5년\n• 서비스 이용 기록: 3개월\n법령에 따른 의무 보존 기간이 있는 경우 해당 기간 동안 보존합니다.`,
            },
            {
              title: '4. 개인정보의 제3자 제공',
              content: `아이디어마켓은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.\n\n• 이용자가 사전에 동의한 경우\n• 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`,
            },
            {
              title: '5. 개인정보의 안전성 확보 조치',
              content: `• 데이터 암호화: 비밀번호 및 민감 정보 암호화 저장 (Supabase Auth 기반)\n• 접근 통제: 개인정보 처리 시스템에 대한 접근 권한 관리\n• 보안 전송: SSL/TLS를 통한 데이터 전송 암호화\n• 저작권 해시: SHA-256 알고리즘으로 아이디어 원본 보호`,
            },
            {
              title: '6. 이용자의 권리',
              content: `이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.\n\n• 개인정보 열람 요청\n• 개인정보 정정·삭제 요청\n• 개인정보 처리 정지 요청\n• 회원 탈퇴 (서비스 내 설정에서 가능)\n\n위 요청은 privacy@ideamarket.kr로 문의해 주세요.`,
            },
            {
              title: '7. 개인정보보호 책임자',
              content: `개인정보보호 책임자: 아이디어마켓 운영팀\n이메일: privacy@ideamarket.kr\n문의 시간: 평일 09:00 ~ 18:00 (공휴일 제외)`,
            },
          ].map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}

          <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-start gap-3">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              본 방침은 <strong>2026년 02월 23일</strong>부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
