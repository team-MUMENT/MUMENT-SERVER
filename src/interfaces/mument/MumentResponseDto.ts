import mongoose from 'mongoose';
import { MusicInfo } from '../music/MusicInfo';
import { UserIdInfo } from '../user/UserInfo';

export interface MumentResponseDto {
    _id?: mongoose.Types.ObjectId | number;
    user: {
        _id: mongoose.Types.ObjectId | number;
        name: string;
        image: string;
    };
    music?: {
        _id: mongoose.Types.ObjectId | null | number; // 보관함때문에 잠시 null
        name: string;
        artist: string;
        image: string;
    };
    isFirst: boolean;
    impressionTag?: number[];
    feelingTag?: number[];
    allCardTag?: number[]; // 전체 뮤멘트 태그 리스트 - 보관함때문에 추가
    cardTag?: number[]; // 뮤멘트 카드에 띄우는 최대 2개의 태그 리스트
    content: string | null;
    isPrivate?: boolean;
    likeCount: number;
    isLiked: boolean;
    createdAt: string;
    count?: number;
    year?: number;
    month?: number;
}
