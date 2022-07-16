import mongoose from 'mongoose';

export interface MusicMumentListResponseDto {
    mumentList?: { // 이 부분 하나 Dto로 통일하기
        _id: mongoose.Schema.Types.ObjectId;
        music: {
            _id: mongoose.Schema.Types.ObjectId;
        };
        user: {
            _id: mongoose.Schema.Types.ObjectId;
            name: string;
            image?: string;
        };
        isFirst: boolean;
        impressionTag: number[];
        feelingTag: number[];
        content?: string;
        isPrivate: boolean;
        likeCount: number;
        isDeleted: boolean;
        date: string;
        isLiked: boolean;
    } [];
}