export interface AgainSelectionInfo {
    mumentId: string;
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
    content: string;
    createdAt: Date;
    displayDate: Date;
}
