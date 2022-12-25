// RDB에서 SELECT한 user 레코드 타입 정의
export interface UserInfoRDB {
    id: number;
    provider: string;
    profile_id?: string;
    image?: string;
    refresh_token?: string;
    is_deleted: number;
    created_at: Date;
    updated_at: Date;
    authentication_code?: string;
    gender?: string;
    age_render?: string;
    email?: string;
}