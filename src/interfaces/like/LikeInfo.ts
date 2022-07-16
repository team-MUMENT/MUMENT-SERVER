import mongoose from 'mongoose';
import { MusicInfo } from '../music/MusicInfo';

export interface LikeInfo {
    user: {
        _id: mongoose.Types.ObjectId;
    };
    mument: LikeMumentInfo[];
}

export interface LikeMumentInfo {
    _id: mongoose.Types.ObjectId;
    user: LikeMumentUserInfo;
    music: MusicInfo;
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    isPrivate: boolean;
    createdAt: Date;
}

export interface LikeMumentUserInfo {
    _id: mongoose.Types.ObjectId;
    name: string;
    image: string;
}
