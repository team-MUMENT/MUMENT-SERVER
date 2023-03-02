export interface LoginWebviewLinkDto {
    tos: string; // 이용약관 URL
    privacy: string; // 개인정보처리방침 URL
}

export interface MypageWebviewLinkDto {
    faq: string; // 자주 묻는 질문 URL
    contact: string; // 문의하기 URL
    appInfo: string; // 앱 정보 URL
    introduction: string; // 뮤멘트 소개 URL
    license: string; // 오픈소스 라이선스 URL
}

export interface VersionDto {
    version: string; // 최신 버전
}