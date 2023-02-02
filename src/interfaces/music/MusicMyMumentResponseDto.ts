import { MumentCardViewInterface } from '../mument/MumentCardViewInterface';

export interface MusicMyMumentResponseDto {
    music: {
        _id: string;
        name: string;
        artist: string;
        image?: string;
    };
    myMument?: MumentCardViewInterface | null;
}
