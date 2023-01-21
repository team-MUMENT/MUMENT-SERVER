export interface NoticePushResponseDto {
    pushSuccess: boolean,
    noticeId: string,
    pushFailFcmToken?: string[] | null
}