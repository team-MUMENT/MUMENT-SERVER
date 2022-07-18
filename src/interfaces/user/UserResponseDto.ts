import mongoose from 'mongoose';

export interface UserResponseDto {
    id: mongoose.Types.ObjectId;
    profileId: string;
    name: string;
    image?: string;
}
