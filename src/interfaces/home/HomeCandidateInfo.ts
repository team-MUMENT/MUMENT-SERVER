export interface HomeCandidateInfo {
    music: {
        _id: string;
        name: string;
        artist: string;
        image: string;
    };
    user: {
        _id: string;
        name: string;
        image?: string;
    };
    isFirst: boolean;
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    isPrivate: boolean;
    isDeleted: boolean;
    createdAt: Date;
    date: string;
}
