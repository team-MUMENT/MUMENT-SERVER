import mongoose from "mongoose";

export interface MumentCardViewInterface {
    _id: number | mongoose.Types.ObjectId; // 서버 배포시 에러나서 리팩토링 끝나기전까지 추가
    musicId?: number;
    user: {
        _id: number | mongoose.Types.ObjectId;  // 서버 배포시 에러나서 리팩토링 끝나기전까지 추가
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
