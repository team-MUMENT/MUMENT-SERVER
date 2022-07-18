import mongoose from 'mongoose';

export interface LikeCountResponeDto {
    mumentId: mongoose.Types.ObjectId;
    likeCount: number;
}
