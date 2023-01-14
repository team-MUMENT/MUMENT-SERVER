import dayjs from 'dayjs';
import pools from '../modules/pool';
import poolPromise from '../loaders/db';
import jwtHandler from '../library/jwtHandler';
import constant from '../modules/serviceReturnConstant';

import mumentDB from '../modules/db/Mument';
import userDB from '../modules/db/User';

import { UserInfoRDB } from '../interfaces/user/UserInfoRDB';
import { MyMumentInfoRDB } from '../interfaces/mument/MyMumentInfoRDB';

import cardTagListProvider from '../modules/cardTagList';

import { NumberBaseResponseDto } from '../interfaces/common/NumberBaseResponseDto';
import { UserResponseDto } from '../interfaces/user/UserResponseDto';
import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { UserProfileSetResponseDto } from '../interfaces/user/UserProfileSetResponseDto';
import { UserLeaveResponseDto } from '../interfaces/user/UserLeaveResponseDto';
import { UserDeleteResponseDto } from '../interfaces/user/UserDeleteResponseDto';


/**
 * 내가 작성한 뮤멘트 리스트
 */
const getMyMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
        // 내가 작성한 뮤멘트 리스트&음악 정보 가져오기
        let myMumentList: MyMumentInfoRDB[] = await userDB.myMumentList(userId);
        if (myMumentList.length === 0) return {muments: []};

        let result: MumentResponseDto[] = [];

        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList: number[] = [];

        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList: number[] = [];

        // 나의 유저 정보
        const user = await userDB.userInfo(myMumentList[0].user_id.toString());

        const myMumentListFunc = async (item: MyMumentInfoRDB, idx: number) => {
            if (idx === myMumentList.length - 1 || (idx < myMumentList.length - 1 && myMumentList[idx + 1].mument_id !== item.mument_id)) {
                
                // isLiked 좋아요 유무
                const isLiked = await mumentDB.isLiked(item.mument_id.toString(), item.user_id.toString());
                
                // 뮤멘트 태그 전체 합치기
                if (item.tag_id) allCardTagList.push(item.tag_id);

                // 뮤멘트 카드뷰 태그 리스트 개수 처리
                cardTagList = await cardTagListProvider.cardTag(allCardTagList);

                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: user.image as string,
                        name: user.profile_id as string
                    },
                    music: {
                        _id: item.music_id,
                        name: item.name,
                        artist: item.artist,
                        image: item.music_image
                    },
                    isFirst: Boolean(item.is_first),
                    allCardTag: allCardTagList, // 전체 태그 리스트
                    cardTag: cardTagList, // 카드뷰에 띄우는 로직으로 처리한 최대 2개의 태그 리스트
                    content: item.content,
                    isPrivate: Boolean(item.is_private),
                    likeCount: item.like_count,
                    isLiked: Boolean(isLiked),
                    createdAt: dayjs(item.created_at).format('D MMM, YYYY'),
                    year: Number(dayjs(item.created_at).format('YYYY')),
                    month: Number(dayjs(item.created_at).format('M'))
                });

                // 리셋
                allCardTagList = []; 
                cardTagList = []; 
            } else {
                // 뮤멘트 태그 합치기
                if (item.tag_id) allCardTagList.push(item.tag_id);
            }
        };

        await myMumentList.reduce(async (pre, curr, index) => {
                return pre.then(() => myMumentListFunc(curr, index));
        }, Promise.resolve());

        // 필링 태그 존재시 뮤멘트 필터링 - 전체 태그 리스트에서 필터링하고, 카드뷰에 띄우는건 cardTag
        if (tagList.length > 0) {
            result = result.filter(mument => {
                return tagList.every(tag => {
                    return mument.allCardTag?.includes(tag);
                });
            });
        }

        return {
            muments: result,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};


/**
 *  좋아요 누른 뮤멘트 리스트
 */
const getLikeMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
       
        // 좋아요한 뮤멘트 리스트 가져오기
        let likeMumentList: MyMumentInfoRDB[] = await userDB.myLikeMumentList(userId);

        // 좋아요 글 없을 시
        if (likeMumentList.length === 0) return {muments: []};

        let result: MumentResponseDto[] = [];

        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList: number[] = [];

        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList: number[] = [];

        // 사용자가 차단한 유저 배열
        const blockedUserList = await userDB.blockedUserList(userId);

        const likeMumentListFunc = async (acc: any, item: MyMumentInfoRDB, idx: number) => {
            
            const isBlocked = blockedUserList.find(({ exist }) => exist == item.user_id);
            if (isBlocked !== undefined) {
                //차단된 유저의 뮤멘트라면 reduce가 다음 코드 실행안함
                return acc;
            }

            if (idx === likeMumentList.length - 1 
                || (idx < likeMumentList.length - 1 && likeMumentList[idx + 1].mument_id !== item.mument_id)) {
                
                // 뮤멘트 태그 전체 합치기
                if (item.tag_id) allCardTagList.push(item.tag_id);

                // 뮤멘트 카드뷰 태그 리스트 개수 처리
                cardTagList = await cardTagListProvider.cardTag(allCardTagList);

                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: item.user_image as string,
                        name: item.profile_id as string
                    },
                    music: {
                        _id: item.music_id,
                        name: item.name,
                        artist: item.artist,
                        image: item.music_image
                    },
                    isFirst: Boolean(item.is_first),
                    allCardTag: allCardTagList, // 전체 태그 리스트
                    cardTag: cardTagList, // 카드뷰에 띄우는 로직으로 처리한 최대 2개의 태그 리스트
                    content: item.content,
                    isPrivate: Boolean(item.is_private),
                    likeCount: item.like_count,
                    isLiked: true, //무조건 true
                    createdAt: dayjs(item.created_at).format('D MMM, YYYY'),
                    year: Number(dayjs(item.created_at).format('YYYY')),
                    month: Number(dayjs(item.created_at).format('M'))
                });

                // 리셋
                allCardTagList = []; 
                cardTagList = []; 
            } else {
                // 뮤멘트 태그 합치기
                if (item.tag_id) allCardTagList.push(item.tag_id);
            }
        };

        await likeMumentList.reduce(async (acc, curr, index) => {
                return acc.then(() => likeMumentListFunc(acc, curr, index));
        }, Promise.resolve());


       // 필링 태그 존재시 뮤멘트 필터링 - 전체 태그 리스트에서 필터링하고, 카드뷰에 띄우는건 cardTag
       if (tagList.length > 0) {
            result = result.filter(mument => {
                return tagList.every(tag => {
                    return mument.allCardTag?.includes(tag);
                });
            });
    }

        return {
            muments: result,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};


/**
 *  유저 차단하기
 */
const blockUser = async (userId: number, mumentId: string): Promise<number | NumberBaseResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        // 뮤멘트 작성자 id 가져오기
        const blockedMument = await mumentDB.isExistMumentInfo(mumentId, connection);
        let blockedUser: number;

        if (!blockedMument.isExist) return constant.NO_MUMENT;
        blockedUser = blockedMument.mument?.user_id as number;


        // 자기자신을 차단하려는 경우
        if (blockedUser === userId) return constant.SELF_BLOCK;


        // 차단 이력이 없는 유저인지 확인
        const blockCheckQuery = `
            SELECT * FROM block WHERE user_id=? AND blocked_user_id=?
        `;
        const blockHistory = await connection.query(blockCheckQuery, [
            userId, 
            blockedUser
        ]);

        if (blockHistory.length > 0) {
            return constant.ALREADY_BLOCK;
        }
     
        
        // 차단하기
        const blockInsertQuery = `
            INSERT INTO block(user_id, blocked_user_id) VALUES(?, ?);
        `;
        const blockRow = await connection.query(blockInsertQuery, [
            userId,
            blockedUser
        ]);

        await connection.commit(); // 성공시 commit

        const data: NumberBaseResponseDto = {
            exist : blockRow.insertId
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 쿼리 에러시 롤백
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

const deleteBlockUser = async (userId: number, blockedUserId: string): Promise<void> => {
    try {
        const deleteBlockQuery = `DELETE FROM block WHERE user_id=? AND blocked_user_id=?`;

        await pools.queryValue(deleteBlockQuery, [
            userId,
            blockedUserId
        ]);

    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getBlockedUserList = async (userId: number): Promise<UserResponseDto[] | number> => {
    try {
        const selectBlockQuery = `
            SELECT blocked_user_id as id, user.profile_id, user.image FROM block
            JOIN user ON block.blocked_user_id=user.id
            WHERE block.user_id=? AND user.is_deleted=0;
        `;
        const blockedUserList: UserResponseDto[] = await pools.queryValue(selectBlockQuery, [
            userId
        ]);

        const data: UserResponseDto[] = blockedUserList;

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const putProfile = async (userId: number, profileId: string, image: string | null): Promise<UserProfileSetResponseDto | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    
    try {
        const isExistUser = await userDB.isExistUser(userId);
        if (isExistUser === 0) return constant.NO_USER;

        connection.beginTransaction();

        const putProfileQuery = `
        UPDATE user
        SET profile_id = ?, image = ?
        WHERE id = ?
            AND is_deleted = 0;
        `;

        await connection.query(putProfileQuery, [profileId, image, userId]);

        const getProfileQuery = `
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0;
        `;

        const getProfileResult = await connection.query(getProfileQuery, [userId]);

        if (getProfileResult[0].profile_id != profileId || getProfileResult[0].image != image) {
            return constant.UPDATE_FAIL;
        }

        const user: UserInfoRDB = getProfileResult[0];

        const accessToken = jwtHandler.accessSign(user);
        const refreshToken = jwtHandler.refreshSign(user);

        const updateRefreshTokenQuery = `
        UPDATE user
        SET refresh_token = ?
        WHERE id = ?
            AND is_deleted = 0;
        `;

        await connection.query(updateRefreshTokenQuery, [refreshToken, userId]);

        await connection.commit();

        const data: UserProfileSetResponseDto = {
            id: user.id,
            accessToken,
            refreshToken,
            profileId: profileId,
            image: user.image,
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

const checkDuplicateName = async (profileId: string): Promise<boolean> => {
    try {
        const checkQuery = `
        SELECT EXISTS(
            SELECT *
            FROM user
            WHERE profile_id = ?
                AND is_deleted = 0
        ) as is_duplicate;
        `;

        const checkResult = await pools.queryValue(checkQuery, [profileId]);

        const isDuplicate: boolean = checkResult[0].is_duplicate;

        const data = isDuplicate;

        return data;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

const postLeaveCategory = async (userId: number, leaveCategoryId: string, reasonEtc: string | null): Promise<Number | UserLeaveResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        const isExistUser = await userDB.isExistUser(userId);
        if (!isExistUser) return constant.NO_USER;

        connection.beginTransaction();

        const postLeaveQuery = `
        INSERT INTO mument.leave(user_id, leave_category_id, reason_etc)
        VALUES(?, ?, ?);
        `;

        await connection.query(postLeaveQuery, [userId, leaveCategoryId, reasonEtc]);

        const getLeaveQuery = `
        SELECT mument.leave.*, user.profile_id, leave_category.name
        FROM mument.leave
        JOIN user
            ON mument.leave.user_id = user.id
        JOIN leave_category
            ON mument.leave.leave_category_id = leave_category.id
        WHERE mument.leave.user_id = ?
        ORDER BY mument.leave.created_at DESC
        LIMIT 1;
        `;

        const getLeaveResult = await connection.query(getLeaveQuery, [userId]);

        if (getLeaveResult.length != 1 || getLeaveResult[0].leave_category_id != leaveCategoryId) {
            return constant.CREATE_FAIL;
        };

        await connection.commit();

        const data: UserLeaveResponseDto = {
            id: getLeaveResult[0].id,
            userId: getLeaveResult[0].user_id,
            profileId: getLeaveResult[0].profile_id,
            leaveCategoryId: getLeaveResult[0].leave_category_id,
            leaveCategoryName: getLeaveResult[0].name,
            reasonEtc: getLeaveResult[0].reason_etc,
            createdAt: getLeaveResult[0].created_at,
        };

        return data;


    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteUser = async (userId: number): Promise<Number | UserDeleteResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    
    try {
        // 존재하는 유저인지 확인
        const isExistUser = await userDB.isExistUser(userId);
        if (!isExistUser) return constant.NO_USER;

        connection.beginTransaction();

        // 유저 탈퇴
        const deleteUserQuery = `
        UPDATE user
        SET is_deleted = 1
        WHERE id = ?
            AND is_deleted = 0;
        `;
        await connection.query(deleteUserQuery, [userId]);

        // 삭제되었는지 확인
        const getUserQuery = `
        SELECT id, profile_id, is_deleted, updated_at
        FROM user
        WHERE id = ?
        `;

        const getUserResult = await connection.query(getUserQuery, [userId]);
        const user = getUserResult[0];

        if (!user.is_deleted) return constant.DELETE_FAIL;

        await connection.commit();

        const data: UserDeleteResponseDto = {
            id: user.id,
            profileId: user.profile_id,
            isDeleted: user.is_deleted,
            updatedAt: user.updated_at,
        }

        return data;

    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}


export default {
    getMyMumentList,
    getLikeMumentList,
    blockUser,
    deleteBlockUser,
    getBlockedUserList,
    putProfile,
    checkDuplicateName,
    postLeaveCategory, 
    deleteUser,
};
