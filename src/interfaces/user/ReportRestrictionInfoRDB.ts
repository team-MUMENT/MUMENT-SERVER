// RDB에서 SELECT한 reportRestriction 레코드 타입 정의
export interface ReportRestrictionInfoRDB {
    id: number;
    restrict_period: string;
    user_id: number;
    restrict_start_date: Date;
    restrict_end_date: Date;
    report_id: number;
    reason: string;
    music_title: string;
    music_artist: string;
}