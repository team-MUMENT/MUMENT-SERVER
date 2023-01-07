import mongoose from 'mongoose';

export interface UserResponseDto {
    id: mongoose.Types.ObjectId | string;
    profileId: string;
    name?: string; // RDB에서 name 필드 제거했기 때문에 옵셔널로 수정함
    image?: string;
}
