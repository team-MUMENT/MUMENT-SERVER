import dayjs from 'dayjs';
import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import mumentDB from '../modules/db/Mument';
import userDB from '../modules/db/User';
import { MyMumentInfoRDB } from '../interfaces/mument/MyMumentInfoRDB';
import cardTagListProvider from '../modules/cardTagList';
import poolPromise from '../loaders/db';
import constant from '../modules/serviceReturnConstant';
import { NumberBaseResponseDto } from '../interfaces/common/NumberBaseResponseDto';
import { UserResponseDto } from '../interfaces/user/UserResponseDto';
import pools from '../modules/pool';
import { NewsInfoRDB } from '../interfaces/user/NewsInfoRDB';
import { NewsResponseDto } from '../interfaces/user/NewsResponseDto';


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
        await connection.beginTransaction(); //롤백을 위해 필요함

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

/**
 *  유저 차단 취소
 */
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


/**
 *  차단 유저 리스트 조회
 */
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


/**
 * 소식창에 안읽은 알림이 있는지 조회
 */
const getUnreadNewsisExist = async (userId: number): Promise<NumberBaseResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        const curr = new Date();
        const comparedDate = dayjs(curr).subtract(2, 'week').format();
        
        const selectNewsQeury = `
            SELECT * FROM news 
            WHERE user_id=? AND is_deleted=0 AND is_read=0 AND created_at BETWEEN ? AND ?
        `;

        const data = await connection.query(selectNewsQeury, [
            userId,  comparedDate, dayjs(curr).format()
        ]);
        console.log(data);

        if (data.length > 0) return { exist: 1 };
        else return { exist: 0 };

    } catch (error) {
        console.log(error);
        throw error;
    }

};


/**
 * 소식창 새로운 알림 읽음 처리
 */
const updateUnreadNews  = async (userId: number, unreadNews: number[]): Promise<void | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    connection.beginTransaction(); //롤백을 위해 필요함

    try {
        const updateUnReadQuery = `
            UPDATE news SET is_read=1 WHERE user_id=? AND id=?
        `;

        for await (const id of unreadNews) {
            const updateResult: any = await connection.query(updateUnReadQuery, [userId, id]);

             // update가 되지 않을 경우
            if (updateResult.changedRows !== undefined && updateResult.changedRows == 0) {
                connection.rollback(); // 하나라도 update안되면 데이터 적용 원상복귀
                return constant.UPDATE_FAIL;
            }
        }

        await connection.commit();
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};


/**
 * 소식창 알림 제거
 */
const deleteNews = async (userId: number, newsId: number): Promise<void | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    connection.beginTransaction(); //롤백을 위해 필요함

    try {
        const updateNewsQuery = `
            UPDATE news SET is_deleted=1 WHERE user_id=? AND id=?;
        `;
        
        const updateResult: any = await connection.query(updateNewsQuery, [userId, newsId]);
        
        // update가 되지 않을 경우
        if (updateResult.changedRows !== undefined && updateResult.changedRows == 0) return constant.UPDATE_FAIL;


        await connection.commit();
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
}



/**
 * 소식창 리스트 조회
 */
const getNewsList = async (userId: number): Promise<NewsResponseDto[]> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    let result: NewsResponseDto[] = [];
    

    try {
        const selectNewsQuery = `
            SELECT * FROM news WHERE user_id=? AND is_deleted=0 ORDER BY created_at DESC;
        `;
        const newsList: NewsInfoRDB[]  = await connection.query(selectNewsQuery, [userId]);

        const curr = new Date();
        const comparedDate = dayjs(curr).subtract(2, 'week').format();
        
        const newsListDateFormat = async (item: NewsInfoRDB, idx: number) => {
            // 최근 2주전 알림만 보여줌
            if (dayjs(comparedDate).isBefore(item.created_at)) {
                result.push({
                    id: item.id,
                    type: item.type,
                    userId: item.user_id,
                    isDeleted: item.is_deleted,
                    isRead: item.is_read,
                    createdAt: dayjs(item.created_at).format('MM/DD HH:mm'),
                    linkId: item.link_id,
                    noticeTitle: item.notice_title,
                    likeProfileId: item.like_profile_id,
                    likeMusicTitle: item.like_music_title
                });
            }
        };

        await newsList.reduce(async (acc, curr, index) => {
            return acc.then(() => newsListDateFormat(curr, index));
        }, Promise.resolve());

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};


export default {
    getMyMumentList,
    getLikeMumentList,
    blockUser,
    deleteBlockUser,
    getBlockedUserList,
    getUnreadNewsisExist,
    updateUnreadNews,
    deleteNews,
    getNewsList,
};
