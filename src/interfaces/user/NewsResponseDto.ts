// 공지사항 DTO
export interface NewsResponseDto{
    id: number;
    type: string;
    userId: number;
    isDeleted: boolean;
    isRead: boolean;
    createdAt: Date | string;
    linkId: number;
    noticeTitle: string | null;
    likeProfileId: string | null;
    likeMusicTitle: string | null;
}