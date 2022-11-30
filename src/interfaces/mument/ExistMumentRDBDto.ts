import { MumentInfoRDB } from "./MumentInfoRdb";

export interface ExistMumentDto {
    isExist: boolean;
    mument: null | MumentInfoRDB;
}