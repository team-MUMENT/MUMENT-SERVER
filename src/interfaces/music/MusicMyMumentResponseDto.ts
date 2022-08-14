import mongoose from 'mongoose';
import { MumentCardViewInterface } from '../mument/MumentCardViewInterface';

export interface MusicMyMumentResponseDto {
    music: {
        _id: mongoose.Types.ObjectId;
        name: string;
        artist: string;
        image?: string;
    };
    myMument?: MumentCardViewInterface | null;
}
