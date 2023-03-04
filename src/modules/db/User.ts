import { UserInfoRDB } from '../../interfaces/user/UserInfoRDB';
import pools from '../pool';
import { MyMumentInfoRDB } from '../../interfaces/mument/MyMumentInfoRDB';
import { NumberBaseResponseDto } from '../../interfaces/common/NumberBaseResponseDto';
import pool from '../pool';

/**
 * user 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */



/**
 * user 관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */

// 존재하는 user인지 확인하기
const isExistUser = async (userId: number) => {
    const query = `
    SELECT EXISTS (
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0
    ) as is_exist_user;
    `;

    const isExist = await pools.queryValue(query, [userId]);

    return isExist[0].is_exist_user;
}

// userId로 유저 레코드 가져오기
const userInfo = async (userId: string) => {
    const query = 'SELECT * FROM user WHERE id=? AND is_deleted=0'; //탈퇴하지 않은 유저
    
    const user: UserInfoRDB[] = await pools.queryValue(query, [userId]);

    return user[0];
}

// userId로 유저 레코드 가져오기 new
const userData = async (userId: string) => {
    const query = 'SELECT * FROM user WHERE id=? AND is_deleted=0'; //탈퇴하지 않은 유저
    
    const user: UserInfoRDB[] = await pools.queryValue(query, [userId]);

    return user;
}

// userId로 탈퇴한 유저 포함 레코드 가져오기
const userInfoIncludeLeave = async (userId: string) => {
    const query = 'SELECT * FROM user WHERE id=?';
    
    const user: UserInfoRDB[] = await pools.queryValue(query, [userId]);

    return user[0];
}

// 내가 작성한 뮤멘트 리스트 가져오기 - 최신순
const myMumentList = async (userId: string) => {
    const mumentListQuery = `
        SELECT mument.id as mument_id, user_id,
            music_id, is_first, like_count, content,
            is_private, mument.created_at as created_at,
            artist, music.image as music_image, name, tag_id
            FROM mument
            JOIN music ON mument.music_id = music.id
            LEFT JOIN mument_tag ON mument.id = mument_tag.mument_id
            WHERE mument.user_id=${userId} AND mument.is_deleted=0
            ORDER BY mument.created_at DESC;`;
    
    const myMumentList: MyMumentInfoRDB[] = await pools.query(mumentListQuery);

    return myMumentList;
};

// 좋아요한 뮤멘트 리스트 가져오기 - 최신순
const myLikeMumentList = async (userId: string) => {
    // 쿼리 - 삭제되지 않고 & 비밀글 아니고 & 최신순
    const mumentListQuery = `
        SELECT mument.id as mument_id, mument.user_id as user_id,
            music_id, is_first, like_count, content,
            is_private, mument.created_at as created_at,
            artist, music.image as music_image, name, tag_id,
            profile_id, user.image as user_image
            FROM mument.like
            JOIN mument ON mument.like.mument_id = mument.id
            JOIN music ON mument.music_id = music.id
            LEFT JOIN mument_tag ON mument.id = mument_tag.mument_id
            JOIN user ON mument.user_id = user.id
            WHERE mument.like.user_id=${userId} AND mument.is_deleted=0 AND mument.is_private=0 AND user.is_deleted=0
            ORDER BY mument.created_at DESC;`;
    
    const myMumentList: MyMumentInfoRDB[] = await pools.query(mumentListQuery);

    return myMumentList;
};


// userId가 차단한 유저 배열 반환
const blockedUserList = async (userId: string) => {
    const selectBlockQuery = `
        SELECT blocked_user_id as exist 
            FROM block WHERE user_id=?;`;

    const blockedUserList: NumberBaseResponseDto[] = await pools.queryValue(selectBlockQuery, [userId]);
    
    return blockedUserList;
};

// 뮤멘트 작성자에게 차단된 유저인지 확인
const isBlockedUser = async (userId: string, mumentId: string): Promise<boolean> => {
    const query = `
    SELECT EXISTS(
        SELECT *
        FROM block
        JOIN mument
            ON mument.user_id = block.user_id
        WHERE block.blocked_user_id = ?
            AND mument.id = ?
            AND mument.is_deleted = 0
    ) as is_blocked;    
    `;

    const result = await pools.queryValue(query, [userId, mumentId]);
    const isBlocked: boolean = result[0].is_blocked;

    return isBlocked;
}


export default {
    userInfo,
    userData,
    userInfoIncludeLeave,
    myMumentList,
    myLikeMumentList,
    blockedUserList,
    isExistUser,
    isBlockedUser,
}

