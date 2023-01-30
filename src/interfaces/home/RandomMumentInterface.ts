export interface RandomMumentInterface {
    _id: number;
    music: {
        name: string;
        artist: string;
    };
    user: {
        name: string;
        image?: string;
    };
    content: string;
    createdAt: Date;
}
