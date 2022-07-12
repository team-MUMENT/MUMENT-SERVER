import { MusicInfo } from "../music/MusicInfo";
import { UserIdInfo } from "../user/UserInfo";

export interface MumentResponseDto {
    user: UserIdInfo;
    music: MusicInfo;
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    likeCount: number;
    isLiked: boolean;
    createdAt: string;
    count: number;
}