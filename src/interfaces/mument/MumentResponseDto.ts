import mongoose from 'mongoose';
import { MusicInfo } from '../music/MusicInfo';
import { UserIdInfo } from '../user/UserInfo';

export interface MumentResponseDto {
    _id?: mongoose.Types.ObjectId;
    user: {
        _id: mongoose.Types.ObjectId | number;
        name: string;
        image: string;
    };
    music?: {
        _id: mongoose.Types.ObjectId | null; // 보관함때문에 잠시 null
        name: string;
        artist: string;
        image: string;
    };
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    cardTag?: number[];
    content: string | null;
    isPrivate?: boolean;
    likeCount: number;
    isLiked: boolean;
    createdAt: string;
    count?: number;
    year?: number;
    month?: number;
}
