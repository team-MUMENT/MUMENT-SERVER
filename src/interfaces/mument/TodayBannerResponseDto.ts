import { BannerSelectionInfo } from '../home/BannerSelectionInfo';

export interface TodayBannerResponseDto {
    todayDate: Date;
    bannerList: BannerSelectionInfo[];
}
