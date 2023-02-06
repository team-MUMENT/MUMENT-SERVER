// 공지사항 DTO
export interface NewsResponseDto{
    id: number;
    type: string;
    userId: number;
    isDeleted: boolean;
    isRead: boolean;
    createdAt: Date | string;
    linkId: number;
    notice: {
        point: string | null;
        title: string | null;
    };
    like: {
        userName: string | null;
        music: {
            id: string | null;
            name: string | null;
            artist: string | null;
            image: string | null;
        }
    };
}