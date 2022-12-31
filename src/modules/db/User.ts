import { UserInfoRDB } from '../../interfaces/user/UserInfoRDB';
import pools from '../pool';
import { MumentInfoRDB } from "../../interfaces/mument/MumentInfoRdb";
import mumentDB from './Mument';
import { MyMumentInfoRDB } from '../../interfaces/mument/MyMumentInfoRDB';

/**
 * user 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */



/**
 * user 관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */

// userId로 유저 레코드 가져오기
const userInfo = async (userId: string) => {
    const query = 'SELECT * FROM user WHERE id=? AND is_deleted=0'; //탈퇴하지 않은 유저
    
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
            WHERE mument.like.user_id=${userId} AND mument.is_deleted=0
            ORDER BY mument.created_at DESC;`;
    
    const myMumentList: MyMumentInfoRDB[] = await pools.query(mumentListQuery);

    return myMumentList;
};


export default {
    userInfo,
    myMumentList,
    myLikeMumentList
}

