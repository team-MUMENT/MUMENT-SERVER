export interface RandomMumentInterface {
    _id: number; //뮤멘트 id
    music: {
        _id: string;
        name: string;
        artist: string;
        image: string;
    };
    user: {
        name: string;
        image?: string;
    };
    content: string;
    createdAt: Date;
}
