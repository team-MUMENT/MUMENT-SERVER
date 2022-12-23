import { ExistMumentDto } from "../../interfaces/mument/ExistMumentRDBDto";
import { NumberBaseResponseDto } from "../../interfaces/common/NumberBaseResponseDto";
import pools from '../pool';
import { MumentInfoRDB } from "../../interfaces/mument/MumentInfoRdb";

/**
 * mument 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */


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
    const mument: MumentInfoRDB[] = await connection.query(query, [mumentId]);

    return mument.length === 0 ? false : true; // 존재하지 않으면 false 반환
};


// 존재하는 뮤멘트 id인지 판단 & 뮤멘트 정보 반환
const isExistMumentInfo = async (mumentId: string , connection: any): Promise<ExistMumentDto> => {
    const query = 'SELECT * FROM mument WHERE id=? AND NOT is_deleted=1;'; //삭제되지 않은 뮤멘트여야 함
    const mument: MumentInfoRDB[] = await connection.query(query, [mumentId]);
    
    return {
        isExist: mument.length === 0 ? false : true, // 존재하지 않으면 false
        mument: !mument[0] ? null : mument[0] // 존재하지 않으면 null, 존재하면 뮤멘트 데이터
    };
};



/**
 * mument관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */

// userId가 해당 뮤멘트에 좋아요를 눌렀는지 확인
const isLiked = async (mumentId: string, userId: string) => {
    const query = 'SELECT EXISTS(SELECT * FROM mument.like WHERE mument_id=? AND user_id=?) as exist;';

    // 좋아요 존재하면 1, 존재하지 않으면 0 반환함
    const isLiked: NumberBaseResponseDto[] = await pools.queryValue(query, [mumentId, userId]);

    return isLiked[0].exist;
};


// 뮤멘트의 좋아요 개수 count
const likeCount = async (mumentId: string) => {
    const query = `SELECT COUNT(*) as exist FROM mument.like WHERE mument_id=${mumentId};`;

    const likeCount: NumberBaseResponseDto[] = await pools.query(query);

    return likeCount[0].exist;
};


// 사용자의 뮤멘트 히스토리 개수 count
const mumentHistoryCount = async (musicId: string, userId: string) => {
    // 삭제되지않고 & 비밀글이 아닌 뮤멘트 개수
    const query = 'SELECT COUNT(*) as exist FROM mument WHERE music_id=? AND user_id=? AND NOT is_deleted=1 AND NOT is_private=1;';

    const historyCount: NumberBaseResponseDto[] = await pools.queryValue(query, [musicId, userId]);

    return historyCount[0].exist;
};


// 뮤멘트의 태그 검색해서 impressionTag, feelingTag 리스트로 반환
const mumentTagListGet = async (mumentId: string) => {
    // 뮤멘트의 태그 모두 검색
    const query = `SELECT tag_id as exist FROM mument_tag WHERE mument_id=${mumentId};`;

    const tagList: NumberBaseResponseDto[] = await pools.query(query);
    
    let impressionTag: number[] = [], feelingTag: number[] = [];

    // 100이상 200미만 - impression tag, 200이상 300미만 - feeling tag
    for (let idx in tagList) {
        if (tagList[idx].exist < 200) {
            impressionTag.push(tagList[idx].exist);
        } else if (tagList[idx].exist < 300) {
            feelingTag.push(tagList[idx].exist);
        }
    }

    return {
        impressionTag: impressionTag,
        feelingTag: feelingTag
    };
};

// 뮤멘트 id에 해당하는 태그 리스트로 반환하기


export default {
    mumentTagCreate,
    isExistMument,
    isExistMumentInfo,
    isLiked,
    likeCount,
    mumentHistoryCount,
    mumentTagListGet,
}