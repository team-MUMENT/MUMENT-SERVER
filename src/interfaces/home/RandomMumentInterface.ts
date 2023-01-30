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
    content: string;
    createdAt: Date;
}
