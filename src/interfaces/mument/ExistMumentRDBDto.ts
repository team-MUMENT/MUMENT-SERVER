import { MumentInfoRDB } from "./MumentInfoRDB";

export interface ExistMumentDto {
    isExist: boolean;
    mument: null | MumentInfoRDB;
}