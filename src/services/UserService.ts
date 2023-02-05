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

import { NewsInfoRDB } from '../interfaces/user/NewsInfoRDB';
import { NewsResponseDto } from '../interfaces/user/NewsResponseDto';
import { ReportRestrictionInfoRDB } from '../interfaces/user/ReportRestrictionInfoRDB';
import { ReportRestrictResponseDto } from '../interfaces/user/ReportRestrictResponseDto';
import { NoticeInfoRDB } from '../interfaces/mument/NoticeInfoRDB';
import pushHandler from '../library/pushHandler';
import { NoticePushResponseDto } from '../interfaces/user/NoticePushResponseDto';
import { BooleanBaseResponseDto } from '../interfaces/common/BooleanBaseResponseDto';
import { LoginWebviewLinkDto, MypageWebviewLinkDto } from '../interfaces/user/WebviewLinkDto';
import WebViewLinkDummy from '../modules/db/WebViewLink';


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
                        _id: item.music_id.toString(),
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
                        _id: item.music_id.toString(),
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
 *  프로필 설정 (소셜 로그인 후) & 프로필 수정
 */
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


/**
 *  프로필 아이디 중복 체크
 */
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


/**
 * 유저 탈퇴 (사유 등록)
 */
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

/** 
 * 유저 탈퇴
*/
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

        const isDeleted = user.isDeleted? true : false;

        const data: UserDeleteResponseDto = {
            id: user.id,
            profileId: user.profile_id,
            isDeleted: isDeleted,
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


/**
 * 신고 제재 기간인 유저인지 확인
 */
const getIsReportRestrictedUser = async (userId: number): Promise<ReportRestrictResponseDto> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        const selectReportRestrictionQuery = 'SELECT * FROM report_restriction WHERE user_id=?';
        const restriction: ReportRestrictionInfoRDB[] = await connection.query(selectReportRestrictionQuery, [userId]);

        if (restriction.length === 0 ) {
            return { 
                restricted: false,
                reason: null,
                musicArtist: null,
                musicTitle: null,
                endDate: null,
                period: null
            };
        }

        /**
         * 현재 날짜 <= 제재 마감일 이라면
         *  */ 
        const curr = new Date();
        const dayDiff = dayjs(curr).diff(restriction[0].restrict_end_date, 'day', true);

        if (dayDiff < 1) {
            return { 
                restricted: true,
                reason: restriction[0].reason,
                musicArtist: restriction[0].music_artist,
                musicTitle: restriction[0].music_title,
                endDate: dayjs(restriction[0].restrict_end_date).format('YYYY-MM-DD'),
                period: restriction[0].restrict_period
            };
        }

        return { 
            restricted: false,
            reason: null,
            musicArtist: null,
            musicTitle: null,
            endDate: null,
            period: null
        };
    }  catch (error) {
        console.log(error);
        throw error;
    }
};


/**
 * 소식창에 안읽은 알림이 있는지 조회
 */
const getUnreadNewsisExist = async (userId: number): Promise<BooleanBaseResponseDto> => {
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

        if (data.length > 0) return { exist: true };
        else return { exist: false };

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

    try {
        const updateNewsQuery = `
            UPDATE news SET is_deleted=1 WHERE user_id=? AND id=?;
        `;
        
        const updateResult: any = await connection.query(updateNewsQuery, [userId, newsId]);
        
        // update가 되지 않을 경우
        if (updateResult.changedRows !== undefined && updateResult.changedRows == 0) return constant.UPDATE_FAIL;

    } catch (error) {
        console.log(error);
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
                    isDeleted: Boolean(item.is_deleted),
                    isRead: Boolean(item.is_read),
                    createdAt: dayjs(item.created_at).format('MM/DD HH:mm'),
                    linkId: item.link_id,
                    noticePoint: item.notice_point_word,
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


/**
 * 공지사항 등록 - 기획, 서버에서만 사용
 */
const postNotice = async (point: string | null, title: string, content:string, noticeCategory: number): Promise<NoticePushResponseDto | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        connection.beginTransaction(); //롤백을 위해 필요함

        // 공지사항 추가
        const createdNotice = await connection.query(
            'INSERT INTO notice(category, title, content, notice_point_word) VALUES(?, ?, ?, ?)', 
            [noticeCategory, title, content, point]);
        if (createdNotice?.affectedRows === 0) return constant.CREATE_NOTICE_FAIL;


        // 공지사항 row 조회
        const createdNoticeRow: NoticeInfoRDB[] = await connection.query(
            'SELECT * FROM notice WHERE id=?', [createdNotice.insertId]
        );
        const noticeTitle = (!createdNoticeRow[0].notice_point_word) ? createdNoticeRow[0].title: createdNoticeRow[0].notice_point_word + createdNoticeRow[0].title;;
        const noticeId = createdNoticeRow[0].id;
        const noticePointWord = createdNoticeRow[0].notice_point_word;
        let fcmTokenList: string[] = [];


        // 모든 활성 유저의 소식창에 공지사항 알림 추가        
        const allActiveUser: UserInfoRDB[] = await connection.query('SELECT * FROM user WHERE is_deleted=0');

        const insertNewsToAllActiveUser = async (item: UserInfoRDB, idx: number) => {
            await connection.query(
                `INSERT INTO news(type, user_id, notice_title, link_id, notice_point_word) VALUES('notice', ?, ?, ?, ?)`, 
                [item.id, createdNoticeRow[0].title, noticeId, noticePointWord]
            );

            if (item.fcm_token && item.fcm_token.length > 0) {
                fcmTokenList.push(item.fcm_token);
            }
        };

        await allActiveUser.reduce(async (acc, curr, index) => {
            return acc.then(() => insertNewsToAllActiveUser(curr, index));
        }, Promise.resolve());
        

        await connection.commit();


        // 새로운 공지사항 활성 유저에게 푸시알림
        const pushAlarmResult = await pushHandler.noticePushAlarmHandler('공지', noticeTitle, fcmTokenList);
        if (pushAlarmResult === constant.NOTICE_PUSH_SUCCESS) {
            return {
                pushSuccess: true,
                noticeId: createdNoticeRow[0].id
            };
        }
        
        return {
            pushSuccess: false,
            noticeId: createdNoticeRow[0].id
        };

    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};


/**
 * 프로필 설정이 완료되었는지 확인
 */
const checkProfileSet = async (userId: string): Promise<boolean> => {
    try {
        // userId로 유저 정보 가져오기
        const user = await userDB.userInfo(userId);

        // 프로필 설정이 완료되지 않았으면 false 리턴
        if (!user.profile_id) return false;

        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 유저 프로필 정보 조회
 */
const getUser = async (userId: string): Promise<UserResponseDto | number> => {
    try {
        const user = await userDB.userInfo(userId);

        if (!user) return constant.NO_USER;

        const data: UserResponseDto = {
            id: user.id,
            profileId: user.profile_id,
            image: user.image,
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/** 
 * 웹뷰 링크 조회
*/
const getWebviewLink = async (page: string): Promise<LoginWebviewLinkDto | MypageWebviewLinkDto | number> => {
    try {
        if (page === 'mypage') {
             // [마이페이지] 웹뷰 조회
            return {
                faq: WebViewLinkDummy.faq,
                contact: WebViewLinkDummy.contact,
                appInfo: WebViewLinkDummy.appInfo,
                introduction: WebViewLinkDummy.introduction
            };
        } else if (page === 'login') {
            // [로그인] 웹뷰 조회
            return {
                tos: WebViewLinkDummy.tos,
                privacy: WebViewLinkDummy.privacy
            };
        } else {
            return constant.WRONG_QUERYSTRING;
        }

        
    } catch (error) {
        console.log(error);
        throw error;
    }
};

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
    getIsReportRestrictedUser,
    getUnreadNewsisExist,
    updateUnreadNews,
    deleteNews,
    getNewsList,
    postNotice,
    checkProfileSet,
    getUser,
    getWebviewLink,
};
