// 신고 제재 기간인 유저에 대한 DTO
export interface ReportRestrictResponseDto {
    restricted : boolean;
    reason?: string | null;
    musicArtist?: string | null;
    musicTitle?: string | null;
    endDate?: string | null;
    period?: string | null;
}