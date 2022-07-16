import mongoose from 'mongoose';
import { MumentCardViewInterface } from './MumentCardViewInterface';

export interface MumentHistoryResponseDto {
    music: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
        artist: string;
        image?: string;
    };
    mumentHistory?: MumentCardViewInterface[];
}