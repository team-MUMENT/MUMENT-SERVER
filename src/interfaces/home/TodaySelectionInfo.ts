export interface TodaySelectionInfo {
    mumentId: string;
    music: {
        _id: string;
        name: string;
        artist: string;
    };
    user: {
        _id: string;
        name: string;
        image?: string;
    };
    content: string;
    isFirst: boolean;
    feelingTag: number[];
    impressionTag: number[];
    cardTag: number[];
    createdAt: Date;
    date: string;
    displayDate: Date;
}
