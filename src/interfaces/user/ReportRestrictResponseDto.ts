// 신고 제재 기간인 유저에 대한 DTO
export interface ReportRestrictResponseDto {
    restricted : boolean;
    reason?: string;
    musicArtist?: string;
    musicTitle?: string;
    endDate?: string;
    period?: string;
}