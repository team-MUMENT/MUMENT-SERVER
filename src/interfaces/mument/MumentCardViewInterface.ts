import mongoose from 'mongoose';

export interface MumentCardViewInterface {
    _id: mongoose.Types.ObjectId;
    music: {
        _id: mongoose.Types.ObjectId;
    };
    user: {
        _id: mongoose.Types.ObjectId;
        name: string;
        image: string;
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
    __v: number;
    date: string;
    isLiked: boolean;
}
