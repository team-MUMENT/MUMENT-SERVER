import mongoose from 'mongoose';

export interface MyMumentResponseDto {
    music: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
        artist: string;
        image?: string;
    };
    myMument?: {
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
        content: string;
        isPrivate: boolean;
        likeCount: number;
        isDeleted: boolean;
        date: string;
        isLiked: boolean;
    };
}
