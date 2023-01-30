export interface TodaySelectionInfo {
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
    isFirst: boolean;
    feelingTag: number[];
    impressionTag: number[];
    cardTag: number[];
    createdAt: Date;
    date: string;
    displayDate: Date;
}
