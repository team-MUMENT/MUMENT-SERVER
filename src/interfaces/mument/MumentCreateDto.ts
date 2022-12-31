export interface MumentCreateDto {
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content?: string;
    isPrivate?: boolean;
    musicId?: string;
    musicArtist?: string;
    musicImage?: string;
    musicName?: string;
}