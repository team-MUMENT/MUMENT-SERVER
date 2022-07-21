import { BannerSelectionInfo } from '../home/BannerSelectionInfo';

export interface TodayBannerResponseDto {
    todayDate: string;
    bannerList: BannerSelectionInfo[];
}
