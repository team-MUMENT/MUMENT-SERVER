import { BannerSelectionInfo } from '../home/BannerSelectionInfo';

export interface TodayBannerResponseDto {
    todayDate: string;
    userId: number;
    bannerList: BannerSelectionInfo[];
}
