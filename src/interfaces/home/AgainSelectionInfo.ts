import mongoose from 'mongoose';

export interface AgainSelectionInfo {
    mumentId: mongoose.Types.ObjectId;
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
    content: string;
    createdAt: Date;
    displayDate: Date;
}
