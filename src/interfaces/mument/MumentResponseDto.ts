import mongoose from 'mongoose';
import { MusicInfo } from '../music/MusicInfo';
import { UserIdInfo } from '../user/UserInfo';

export interface MumentResponseDto {
    _id?: mongoose.Types.ObjectId;
    user: UserIdInfo;
    music: MusicInfo;
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    isPrivate?: boolean;
    likeCount: number;
    isLiked: boolean;
    createdAt: string;
    count?: number;
    year?: number;
    month?: number;
}
