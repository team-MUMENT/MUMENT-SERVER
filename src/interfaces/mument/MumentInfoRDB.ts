// RDB에서 SELECT한 mument 레코드 타입 정의
export interface MumentInfoRDB {
    id: number;
    user_id: number;
    music_id: number;
    content: string;
    is_first: number;
    like_count: number;
    is_deleted: number;
    is_private: number;
    created_at: Date;
    updated_at: Date;
}