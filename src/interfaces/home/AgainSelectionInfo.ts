export interface AgainSelectionInfo {
    mumentId: number;
    music: {
        _id: string;
        name: string;
        artist: string;
        image: string;
    };
    user: {
        _id: number;
        name: string;
        image?: string;
    };
    content: string;
    createdAt: Date;
}
