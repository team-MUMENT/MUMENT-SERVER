export interface RandomMumentInterface {
    _id: string;
    music: {
        name: string;
        artist: string;
    };
    user: {
        name: string;
        image?: string;
    };
    impressionTag: number[];
    feelingTag: number[];
    content: string;
    createdAt: Date;
}
