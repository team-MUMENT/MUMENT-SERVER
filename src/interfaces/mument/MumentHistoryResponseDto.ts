import { MumentCardViewInterface } from './MumentCardViewInterface';

export interface MumentHistoryResponseDto {
    music?: {
        _id: number;
        name: string;
        artist: string;
        image?: string;
    };
    mumentHistory?: MumentCardViewInterface[];
}
