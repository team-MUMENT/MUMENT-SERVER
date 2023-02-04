import { MusicCreateDto } from "../music/MusicCreateDto";

export interface MumentCreateDto extends MusicCreateDto {
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content?: string;
    isPrivate?: boolean;
}