// RDB에서 SELECT한 user 레코드 타입 정의
export interface UserInfoRDB {
    id: number;
    name?: string;
    profile_id: string;
    image: string;
    is_deleted: number;
    created_at: Date;
    updated_at: Date;
}