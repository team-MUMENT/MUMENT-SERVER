import mongoose from 'mongoose';

export interface MusicResponseDto {
    _id: mongoose.Types.ObjectId;
    name: string;
    artist: string;
    image: string;
}
