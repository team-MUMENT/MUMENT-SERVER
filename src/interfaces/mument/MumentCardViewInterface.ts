export interface MumentCardViewInterface {
    _id: number | string;
    musicId?: number;
    music?: { // 채은 - 곡상세보기 명세서 response에 맞추기위해 추가했습니다
        _id: string;
    };
    user: {
        _id: number | string; 
        name: string;
        image?: string;
    };
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    cardTag?: number[];
    content: string;
    isPrivate: boolean;
    likeCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    date: string;
    isLiked: boolean;
}
