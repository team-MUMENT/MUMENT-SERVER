import { MumentInfoRDB } from "./MumentInfoRDB";

export interface MumentAndUserInfoRDB extends MumentInfoRDB{
    user_name: string;
    user_image: string;
    is_liked?: boolean;
}