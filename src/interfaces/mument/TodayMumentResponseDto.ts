import { TodaySelectionInfo } from '../home/TodaySelectionInfo';

export interface TodayMumentResponseDto {
    todayDate: string;
    todayMument: TodaySelectionInfo | null;
}
