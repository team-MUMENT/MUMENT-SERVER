export interface MumentCardViewInterface {
    _id: number;
    musicId: number;
    user: {
        _id: number;
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
