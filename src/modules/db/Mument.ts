/* mument 리소스 - 재사용 쿼리 - 트랜잭션 쓸 때 사용가능 */  
import { ExistMumentDto } from "../../interfaces/mument/ExistMumentRDBDto";

// 뮤멘트 태그 삽입 - impressionTag, feelingTag 리스트 합쳐서 처리
const mumentTagCreate = async (impressionTag: number[], feelingTag: number[], connection: any, mumentId: string) => {
    const tagList = impressionTag.concat(feelingTag);

    for(let idx in tagList) {
        const query = 'INSERT INTO mument_tag(mument_id, tag_id) VALUES(?, ?);';
        await connection.query(query, [
            mumentId,
            tagList[idx] // tag 번호
        ]);
    }
};


// 존재하는 뮤멘트 id인지 판단
const isExistMument = async (mumentId: string , connection: any) => {
    const query = 'SELECT * FROM mument WHERE id=? AND NOT is_deleted=1;'; //삭제되지 않은 뮤멘트여야 함
    const mument: any[] = await connection.query(query, [mumentId]);

    return mument.length === 0 ? false : true; // 존재하지 않으면 false 반환
};


// 존재하는 뮤멘트 id인지 판단 & 뮤멘트 정보 반환
const isExistMumentInfo = async (mumentId: string , connection: any): Promise<ExistMumentDto> => {
    const query = 'SELECT * FROM mument WHERE id=? AND NOT is_deleted=1;'; //삭제되지 않은 뮤멘트여야 함
    const mument: any[] = await connection.query(query, [mumentId]);
    
    return {
        isExist: mument.length === 0 ? false : true, // 존재하지 않으면 false
        mument: !mument[0] ? null : mument[0] // 존재하지 않으면 null, 존재하면 뮤멘트 데이터
    };
};

export default {
    mumentTagCreate,
    isExistMument,
    isExistMumentInfo,
}