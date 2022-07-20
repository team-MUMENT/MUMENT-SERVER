import mongoose from 'mongoose';

export interface BannerSelectionInfo {
    music: {
        _id: mongoose.Types.ObjectId;
        name: string;
        artist: string;
        image: string;
    };
    impressionTag: number;
    feelingTag: number;
    tagTitle: string;
    displayDate: Date;
}
