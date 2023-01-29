import { MumentCardViewInterface } from '../mument/MumentCardViewInterface';

export interface MusicMyMumentResponseDto {
    music: {
        _id: number | string;
        name: string;
        artist: string;
        image?: string;
    };
    myMument?: MumentCardViewInterface | null;
}
