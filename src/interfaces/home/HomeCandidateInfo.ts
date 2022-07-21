import mongoose from 'mongoose';

export interface HomeCandidateInfo {
    music: {
        _id: mongoose.Types.ObjectId;
        name: string;
        artist: string;
        image: string;
    };
    user: {
        _id: mongoose.Types.ObjectId;
        name: string;
        image?: string;
    };
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    isPrivate: boolean;
    isDeleted: boolean;
    createdAt: Date;
    date: string;
}
