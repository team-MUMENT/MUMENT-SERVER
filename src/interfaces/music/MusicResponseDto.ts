import mongoose from 'mongoose';

export interface MusicResponseDto {
    _id: string;
    name: string;
    artist: string;
    image: string;
}