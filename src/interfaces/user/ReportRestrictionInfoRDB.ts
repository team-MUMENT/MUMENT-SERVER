// RDB에서 SELECT한 reportRestriction 레코드 타입 정의
export interface ReportRestrictionInfoRDB {
    id: number;
    user_id: number;
    report_id: number;
    restrict_start_date: Date;
    restrict_end_date: Date;
}