/**
 * 공지사항 테이블 select 시 레코드 형식
 */
export interface NoticeInfoRDB {
    id: string;
    title: string;
    content: string;
    created_at: Date | string; 
    notice_point_word?: string | null;
    category?: number | null;
}