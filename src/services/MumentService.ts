import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import constant from '../modules/serviceReturnConstant';
import pools from '../modules/pool';
import poolPromise from '../loaders/db';

import mumentDB from '../modules/db/Mument';
import userDB from '../modules/db/User';
import musicDB from '../modules/db/Music';

import { tagBannerTitle, tagRandomTitle } from '../modules/tagTitle';
import { PostBaseResponseDto } from '../interfaces/common/PostBaseResponseDto';
import { MumentCardViewInterface } from '../interfaces/mument/MumentCardViewInterface';
import { MumentCreateDto } from '../interfaces/mument/MumentCreateDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { IsFirstResponseDto } from '../interfaces/mument/IsFirstResponseDto';
import { MumentHistoryResponseDto } from '../interfaces/mument/MumentHistoryResponseDto';
import { LikeCountResponeDto } from '../interfaces/like/LikeCountResponseDto';
import { UserResponseDto } from '../interfaces/user/UserResponseDto';

import { RandomMumentResponseDto } from '../interfaces/mument/RandomMumentResponeDto';
import { TodayMumentResponseDto } from '../interfaces/mument/TodayMumentResponseDto';
import { TodayBannerResponseDto } from '../interfaces/mument/TodayBannerResponseDto';
import { AgainMumentResponseDto } from '../interfaces/mument/AgainMumentResponseDto';
import { StringBaseResponseDto } from '../interfaces/common/StringBaseResponseDto';

import { ExistMumentDto } from '../interfaces/mument/ExistMumentRDBDto';
import { MumentInfoRDB } from '../interfaces/mument/MumentInfoRDB';
import cardTagList from '../modules/cardTagList';
import { NoticeInfoRDB } from '../interfaces/mument/NoticeInfoRDB';
import pushHandler from '../library/pushHandler';
import { RandomMumentInterface } from '../interfaces/home/RandomMumentInterface';
import { BannerSelectionInfo } from '../interfaces/home/BannerSelectionInfo';
import { AgainSelectionInfo } from '../interfaces/home/AgainSelectionInfo';
import { TodaySelectionInfo } from '../interfaces/home/TodaySelectionInfo';
import { TagListInfo } from '../interfaces/common/TagListInfo';
import common from '../modules/common';

/**
 * 뮤멘트 기록하기
 */
const createMument = async (userId: string, musicId: string, mumentCreateDto: MumentCreateDto): Promise<PostBaseResponseDto | null> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 음악 db에 존재안하면 db에 삽입하기
        await musicDB.SearchAndCreateMusic(mumentCreateDto, connection);

        // 뮤멘트 생성
        const query1 = 'INSERT INTO mument(user_id, music_id, content, is_first, is_Private) VALUES(?, ?, ?, ?, ?)';
        const query1Result = await connection.query(query1, [userId, musicId, !mumentCreateDto.content ? null : mumentCreateDto.content, mumentCreateDto.isFirst, mumentCreateDto.isPrivate]);

        // 뮤멘트 태그 생성
        await mumentDB.mumentTagCreate(mumentCreateDto.impressionTag, mumentCreateDto.feelingTag, connection, query1Result.insertId);

        await connection.commit();

        // 몇 번째 뮤멘트 기록인지 count
        const mumentCount = await connection.query('SELECT COUNT(*) as count FROM mument WHERE user_id = ?', [userId]);

        const data = {
            _id: query1Result.insertId,
            count: mumentCount[0].count,
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 수정하기
 */
const updateMument = async (mumentId: string, mumentUpdateDto: MumentCreateDto): Promise<StringBaseResponseDto | null | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 존재하지 않는 id의 뮤멘트를 수정하려고 할 때
        const isExistMument: boolean = await mumentDB.isExistMument(mumentId, connection);
        if (isExistMument === false) return constant.NO_MUMENT;

        //뮤멘트 수정사항 update
        const query2 = 'UPDATE mument SET is_first=?, content=?, is_private=? WHERE id=?;';

        // 뮤멘트 업데이트
        await connection.query(query2, [
            mumentUpdateDto.isFirst,
            mumentUpdateDto.content != undefined ? mumentUpdateDto.content : null,
            mumentUpdateDto.isPrivate != undefined ? mumentUpdateDto.isPrivate : 0,
            mumentId,
        ]);

        // 뮤멘트 태그 업데이트 : 기존 태그 모두 삭제 후 새로 삽입
        const query3 = 'DELETE FROM mument_tag where mument_id = ?;';
        await connection.query(query3, [mumentId]);

        await mumentDB.mumentTagCreate(mumentUpdateDto.impressionTag, mumentUpdateDto.feelingTag, connection, mumentId);

        await connection.commit(); // query1, query2 모두 성공시 커밋(데이터 적용)

        const data = {
            _id: Number(mumentId),
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 상세보기
 */
const getMument = async (mumentId: string, userId: string): Promise<MumentResponseDto | null | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        // 존재하지 않는 id의 뮤멘트를 조회하려고 할 때
        const isExistMumentInfo: ExistMumentDto = await mumentDB.isExistMumentInfo(mumentId, connection);

        if (isExistMumentInfo.isExist === false) return constant.NO_MUMENT;

        const mument = isExistMumentInfo.mument as MumentInfoRDB; // 뮤멘트 데이터 가져오기

        //  비밀글인데, 본인의 뮤멘트가 아닐 경우 -> 조회하지 못하도록
        if (mument.is_private === 1 && mument.user_id.toString() != userId) return constant.PRIVATE_MUMENT;

        // 사용자가 이 뮤멘트에 좋아요 눌렀으면 1, 아니면 0
        const isLiked = await mumentDB.isLiked(mumentId, userId);


        // 사용자 정보 가져오기 - 탈퇴한 사용자 포함해서 프로필 정보 가져옴
        const user = await userDB.userInfoIncludeLeave(mument.user_id.toString());


        // 뮤멘트 히스토리 개수 - 뮤멘트의 작성자가 해당 곡에 쓴 뮤멘트 개수
        const historyCount = await mumentDB.mumentHistoryCount(mument.music_id.toString(), mument.user_id.toString(), userId);

        // 작성 시간
        const createdTime = dayjs(mument.created_at).format('YYYY.MM.DD h:mm A');


        // 뮤멘트의 태그 검색해서 impressionTag, feelingTag 리스트로 반환
        const tagList = await mumentDB.mumentTagListGet(mumentId);
        const impressionTag: number[] = tagList.impressionTag;
        const feelingTag: number[] = tagList.feelingTag;

        const data: MumentResponseDto = {
            user: {
                _id: user.id,
                image: user.image as string,
                name: user.profile_id as string,
            },
            isFirst: Boolean(mument.is_first),
            impressionTag: impressionTag,
            feelingTag: feelingTag,
            content: !mument.content ? null : mument.content,
            likeCount: mument.like_count,
            isLiked: Boolean(isLiked),
            createdAt: createdTime,
            count: historyCount,
            isPrivate: Boolean(mument.is_private),
        };

        await connection.commit(); // 모두 성공시 커밋(데이터 적용)

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 삭제하기
 */
const deleteMument = async (mumentId: string): Promise<void | null> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 뮤멘트 삭제하기
        const query1 = 'UPDATE mument SET is_deleted=1 WHERE id=?';
        await connection.query(query1, [mumentId]);

        // 뮤멘트의 태그들 삭제하기
        const query2 = 'DELETE FROM mument_tag where mument_id = ?;';
        await connection.query(query2, [mumentId]);

        // 뮤멘트의 좋아요들 삭제하기
        const query3 = 'DELETE FROM mument.like where mument_id = ?;';
        await connection.query(query3, [mumentId]);

        await connection.commit(); // 모두 성공시 커밋(데이터 적용)
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 처음/다시 들어요 선택
 */
const getIsFirst = async (userId: string, musicId: string): Promise<IsFirstResponseDto | null> => {
    try {
        const query1 = 'SELECT * FROM mument WHERE user_id=? AND music_id=? AND is_deleted=0;';
        const result: any = await pools.queryValue(query1, [userId, musicId]);

        const userMument = result;

        if (userMument.length === 0) {
            // 뮤멘트 기록이 처음인 경우
            return {
                isFirst: true,
                firstAvailable: true,
            };
        } else {
            // 뮤멘트중 '처음 들었어요' 기록이 하나라도 존재하는 경우 true 반환
            const firstMument = userMument.some((mument: any) => {
                return mument.is_first == true;
            });

            if (firstMument === false) {
                // '처음 들었어요' 기록이 존재하지 않는 경우 - 처음 선택 가능
                return {
                    isFirst: false,
                    firstAvailable: true,
                };
            } else {
                // '처음 들었어요' 기록이 존재하는 경우 - 처음 선택 불가
                return {
                    isFirst: false,
                    firstAvailable: false,
                };
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 히스토리 조회
 */
const getMumentHistory = async (userId: string, musicId: string, writerId: string, orderBy: string, limit: any, offset: any): Promise<MumentHistoryResponseDto | number | null> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        let getMumentListResult = [];

        // 비밀글도 볼 수 있게 함
        if (userId === writerId) {
            const getMumentListQuery = `
            SELECT mument.*, user.profile_id as user_name, user.image as user_image, 
                EXISTS(SELECT *
                    FROM mument.like
                    WHERE user_id = ?
                        AND mument_id = mument.id) as is_liked
            FROM mument
            JOIN user
                ON user.id = mument.user_id
            WHERE mument.music_id = ?
                AND mument.user_id = ?
                AND mument.is_deleted = 0
                AND user.is_deleted = 0
            ORDER BY created_at ${orderBy}
            LIMIT ? OFFSET ?;
            `;

            getMumentListResult = await connection.query(getMumentListQuery, [userId, musicId, writerId, limit, offset]);
        } else {
            // 비밀글 볼 수 없게 함
            const getMumentListQuery = `
            SELECT mument.*, user.profile_id as user_name, user.image as user_image,
            EXISTS(SELECT *
                FROM mument.like
                WHERE user_id = ?
                    AND mument_id = mument.id) as is_liked
            FROM mument
            JOIN user
                ON user.id = mument.user_id
            WHERE mument.music_id = ?
                AND mument.user_id = ?
                AND mument.is_private = 0
                AND mument.is_deleted = 0
                AND user.is_deleted = 0
            ORDER BY created_at ${orderBy}
            LIMIT ? OFFSET ?;
            `;
            getMumentListResult = await connection.query(getMumentListQuery, [userId, musicId, writerId, limit, offset]);
        }

        // 해당 유저가 작성한 뮤멘트가 없을 경우 리턴
        if (getMumentListResult.length === 0) {
            const data: MumentHistoryResponseDto = {
                mumentHistory: [],
            };

            return data;
        }

        // 태그 조회를 위해 뮤멘트 아이디만 빼오고, 스트링으로 만들어주기
        const mumentIdList: number[] = await common.mumentIdFilter(getMumentListResult);

        let tagList: TagListInfo[] = await common.insertMumentIdIntoTagList(mumentIdList);
       

        // 해당 뮤멘트들의 태그 모두 가져오기
        const strMumentIdList = '(' + mumentIdList.join(', ') + ')';

        const getAllTagResult = await mumentDB.getAllTag(strMumentIdList, connection);


        // impression tag, feeling tag 분류하기
        await cardTagList.allTagResultTagClassification(getAllTagResult, tagList);

        for await (const object of tagList) {
            const allTagList = object.impressionTag.concat(object.feelingTag);
            object.cardTag = await cardTagList.cardTag(allTagList);
        }


        // id와 좋아요 여부 담은 리스트 생성
        const isLikedList: { id: number; isLiked: boolean }[] = [];

        for await (let element of mumentIdList) {
            isLikedList.push({ id: element, isLiked: false });
        }

        // 좋아요 여부 확인
        const getIsLikedQuery = `
        SELECT mument_id, EXISTS (
            SELECT *
            FROM mument.like
            WHERE mument_id IN ${strMumentIdList}
                AND user_id = ?
        ) as is_liked
        FROM mument.like
        WHERE mument_id IN ${strMumentIdList};
        `;

        const LikedResult = await connection.query(getIsLikedQuery, [userId]);

        // 쿼리 결과에 있을 시에만 isLiked를 true로 바꿈
        await LikedResult.reduce(async (ac: any[], cur: any) => {
            const mumentIdx = isLikedList.findIndex(o => o.id === cur.mument_id);
            isLikedList[mumentIdx].isLiked = true;
        }, LikedResult);

        // string으로 날짜 생성해주는 함수
        const createDate = (createdAt: Date): string => {
            const date = dayjs(createdAt).format('D MMM, YYYY');
            return date;
        };

        const mumentHistory: MumentCardViewInterface[] = [];

        for await (const mument of getMumentListResult) {
            mumentHistory.push({
                _id: mument.id,
                musicId: mument.music_id.toString(),
                user: {
                    _id: mument.user_id,
                    name: mument.user_name,
                    image: mument.user_image,
                },
                isFirst: Boolean(mument.is_first),
                impressionTag: tagList[tagList.findIndex(o => o.id == mument.id)].impressionTag,
                feelingTag: tagList[tagList.findIndex(o => o.id === mument.id)].feelingTag,
                cardTag: tagList[tagList.findIndex(o => o.id === mument.id)].cardTag,
                content: mument.content,
                isPrivate: Boolean(mument.is_private),
                likeCount: mument.like_count,
                isDeleted: Boolean(mument.is_deleted),
                createdAt: mument.created_at,
                updatedAt: mument.updated_at,
                date: createDate(mument.created_at),
                isLiked: Boolean(isLikedList[isLikedList.findIndex(o => o.id === mument.id)].isLiked),
            });
        }

        const data: MumentHistoryResponseDto = {
            mumentHistory,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 좋아요 등록
 */
const createLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    const pool: any = await poolPromise;
    let connection = await pool.getConnection();

    try {
        const findMumentResult = await mumentDB.isExistMumentInfo(mumentId, connection);
        if (findMumentResult.isExist === false || !findMumentResult.mument) return constant.NO_MUMENT;

        await connection.beginTransaction();

        // 좋아요 등록
        const postLikeQuery = `
        INSERT INTO mument.like (user_id, mument_id)
        VALUE (?, ?);
        `;

        await connection.query(postLikeQuery, [userId, mumentId]);

        // likeCount 업데이트
        const updateLikeCountQuery = `
        UPDATE mument
        SET like_count = like_count + 1
        WHERE id = ?
            AND is_deleted = 0;
        `;

        await connection.query(updateLikeCountQuery, [mumentId]);

        // 결과 조회
        const getLikeResultQuery = `
        SELECT mument.like.mument_id, mument.like.user_id, mument.mument.like_count,
        mument.mument.user_id AS writer_id, mument.mument.music_id AS music_id,
        mument.music.name AS music_title, mument.music.artist AS music_artist, mument.music.image AS music_image
        FROM mument.like
        JOIN mument.mument
            ON mument.mument.id = mument.like.mument_id
        JOIN mument.music
            ON mument.music.id = mument.music_id
        WHERE mument.mument.id = ?
            AND mument.mument.is_deleted = 0
            AND mument.like.user_id = ?;
        `;

        const likeResult = await connection.query(getLikeResultQuery, [mumentId, userId]);

        if (likeResult.length === 0) return constant.CREATE_FAIL;

        const data: LikeCountResponeDto = {
            mumentId: likeResult[0].mument_id,
            likeCount: likeResult[0].like_count,
        };

        await connection.commit();


        // 커넥션 쪼개기
        connection = await pool.getConnection();


        //좋아요 눌린 뮤멘트 작성자의 소식창에 좋아요 알림 삽입 - 자기 자신의 뮤멘트면 알림 x  (!넣는게 완성)
        //TO-DO: 로컬에서 테스트하고 !==으로 바꾸기
        if (Number(userId) === findMumentResult.mument.user_id) {
            const userData = await connection.query('SELECT profile_id FROM user WHERE id=?', [userId]);

            await connection.query(
                `INSERT INTO news(type, user_id, like_profile_id, link_id, like_music_title, like_music_id, like_music_artist, like_music_image) 
                VALUES('like', ?, ?, ?, ?, ?, ?, ?)`, [
                likeResult[0].writer_id,
                userData[0].profile_id,
                mumentId,
                likeResult[0].music_title,
                likeResult[0].music_id,
                likeResult[0].music_artist,
                likeResult[0].music_image
            ]);

            await connection.commit();


            // 커넥션 쪼개기
            connection = await pool.getConnection();

            // 좋아요 눌린 뮤멘트 작성자에게 푸시알림 - 차단 유저껀 가지 않음
            const blockedUser = await connection.query('SELECT * FROM block WHERE user_id=? AND blocked_user_id=?', [likeResult[0].writer_id, userId]);

            if (blockedUser.length === 0) {
                const writerData = await connection.query('SELECT fcm_token FROM user WHERE id=?', [likeResult[0].writer_id]);

                const pushAlarmResult = await pushHandler.likePushAlarmHandler('좋아요', `${userData[0].profile_id}님이 ${likeResult[0].music_title}에 쓴 뮤멘트를 좋아합니다.`, writerData[0].fcm_token);

                if (pushAlarmResult === constant.LIKE_PUSH_SUCCESS) {
                    Object.assign(data, { pushSuccess: true });
                } else if (pushAlarmResult === constant.LIKE_PUSH_FAIL) {
                    Object.assign(data, { pushSuccess: false });
                }

                return data;
            }
            await connection.commit();
        }
        await connection.commit();
        
        return Object.assign(data, { pushSuccess: false });
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * 뮤멘트 좋아요 취소
 */
const deleteLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const findMumentResult = await mumentDB.isExistMument(mumentId, connection);

        if (findMumentResult === false) return constant.NO_MUMENT;

        const deleteLikeQuery = `
        DELETE FROM mument.like
        WHERE mument_id = ?
            AND user_id = ?;
        `;

        await connection.query(deleteLikeQuery, [mumentId, userId]);

        // 삭제 되었는지 확인
        const getLikeResultQuery = `
        SELECT *
        FROM mument.like
        WHERE mument_id = ?
            AND user_id = ?;
        `;

        const getLikeResult = await connection.query(getLikeResultQuery, [mumentId, userId]);

        if (getLikeResult.length != 0) return constant.DELETE_FAIL;

        // 삭제 확인 후 좋아요 카운트 수 -1
        const updateLikeCountQuery = `
        UPDATE mument
        SET like_count = like_count - 1
        WHERE id = ?
            AND is_deleted = 0;
        `;

        await connection.query(updateLikeCountQuery, [mumentId]);

        await connection.commit();

        // 좋아요 카운트 수 가져오기
        const getLikeCountQuery = `
        SELECT id, like_count
        FROM mument
        WHERE id = ?
            AND is_deleted = 0;
        `;

        const getLikeCountResult = await connection.query(getLikeCountQuery, [mumentId]);

        const data: LikeCountResponeDto = {
            mumentId: getLikeCountResult[0].id,
            likeCount: getLikeCountResult[0].like_count,
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

// 랜덤 태그, 뮤멘트 조회
const getRandomMument = async (): Promise<RandomMumentResponseDto> => {
    try {
        // 난수 생성 함수
        const createRandomNum = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // 태그 넘버를 담을 변수
        let detailTag = 0;

        // 태그에 따른 제목을 가져올 변수
        let tagTitle: string = '';

        // 랜덤 뮤멘트를 가져오는 쿼리
        const getRandomMumentQuery = `
        SELECT m.id, music.id as music_id, music.name as music_name, music.artist, music.image as music_image, 
        m.content, user.profile_id as user_name, user.image as user_image, m.created_at
        FROM home_random as hr
        JOIN mument as m
            ON m.id = hr.mument_id
        JOIN mument_tag as mt
            ON mt.mument_id = m.id
        JOIN music
            ON music.id = m.music_id
        JOIN user
            ON user.id = m.user_id
        WHERE mt.tag_id = ?
            AND m.is_deleted = 0
            AND m.is_private = 0
            AND user.is_deleted = 0
        ORDER BY rand()
        LIMIT 3;
        `;

        // 랜덤 뮤멘트 결과를 담을 리스트
        let randomMumentList = [];

        // 랜덤 뮤멘트 리스트가 빈배열을 반환하지 않도록 while문 사용
        while (randomMumentList.length === 0) {
            // 태그 종류 결정을 위해 1과 2 사이에서 난수 생성
            const tagSort: number = createRandomNum(1, 2);

            // 태그 종류에 따라 세부 태그 결정
            switch (tagSort) {
                case 1: {
                    // impressionTag
                    detailTag = createRandomNum(100, 105);
                    break;
                }
                case 2: {
                    // feelingTag
                    detailTag = createRandomNum(200, 215);
                    break;
                }
            }
            tagTitle = tagRandomTitle[detailTag as keyof typeof tagRandomTitle];

            randomMumentList = await pools.queryValue(getRandomMumentQuery, [detailTag]);
        }

        const mumentList: RandomMumentInterface[] = [];

        for await (let element of randomMumentList) {
            mumentList.push({
                _id: element.id,
                music: {
                    _id: element.music_id.toString(),
                    name: element.music_name,
                    artist: element.artist,
                    image: element.music_image,
                },
                user: {
                    name: element.user_name,
                    image: element.user_image,
                },
                content: element.content,
                createdAt: element.created_at,
            });
        }

        const data: RandomMumentResponseDto = {
            title: tagTitle,
            mumentList: mumentList,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 오늘의 뮤멘트 조회
const getTodayMument = async (): Promise<TodayMumentResponseDto | number> => {
    try {
        // 리퀘스트 받아온 시간 판단 후 당일 자정으로 수정
        const todayDate = dayjs().hour(0).minute(0).second(0).millisecond(0).format('YYYY-MM-DD');

        const getTodayMumentQuery = `
        SELECT mument.*, ht.display_date, music.id as music_id, music.name, music.artist, music.image, user.profile_id as user_name, user.image as user_image
        FROM home_today as ht
        JOIN mument
            ON mument.id = ht.mument_id
        JOIN user
            ON mument.user_id = user.id
        JOIN music
            ON music.id = mument.music_id
        WHERE ht.display_date = ?
            AND mument.is_deleted = 0
            AND mument.is_private = 0
            AND user.is_deleted = 0;
        `;

        let getTodayMumentResult = [];
        getTodayMumentResult = await pools.queryValue(getTodayMumentQuery, [todayDate]);

        // 결과가 0일 경우에는 백업데이터 조회
        if (getTodayMumentResult.length === 0) {
            const getBackUpMumentQuery = `
            SELECT mument.*, ht.display_date, music.id as music_id, music.name, music.artist, music.image, user.profile_id as user_name, user.image as user_image
            FROM home_today as ht
            JOIN mument
                ON mument.id = ht.mument_id
            JOIN user
                ON mument.user_id = user.id
            JOIN music
                ON music.id = mument.music_id
            WHERE ht.display_date = ?
                AND mument.is_deleted = 0
                AND mument.is_private = 0
                AND user.is_deleted = 0;
            `;

            getTodayMumentResult = await pools.queryValue(getBackUpMumentQuery, ['2023-01-01']);
        }

        if (getTodayMumentResult.length === 0) return constant.NO_HOME_CONTENT;

        const todayMument = getTodayMumentResult[0];

        const getTagQuery = `
        SELECT *
        FROM mument_tag
        WHERE mument_id = ?
            AND is_deleted = 0
        ORDER BY created_at ASC;
        `;

        const getTagResult = await pools.queryValue(getTagQuery, [todayMument.id]);

        const tagList: number[] = [];
        const impressionTag: number[] = [];
        const feelingTag: number[] = [];

        for (const object of getTagResult) {
            tagList.push(object.tag_id);
            if (object.tag_id < 200) {
                impressionTag.push(object.tag_id);
            } else if (object.tag_id < 300) {
                feelingTag.push(object.tag_id);
            }
        }

        const cardTag: number[] = await cardTagList.cardTag(tagList);

        const createDate = (createdAt: Date): string => {
            const date = dayjs(createdAt).format('D MMM, YYYY');
            return date;
        };

        const isFirst: boolean = todayMument.is_first ? true : false;

        const todayMumentCard: TodaySelectionInfo = {
            mumentId: todayMument.id,
            music: {
                _id: todayMument.music_id.toString(),
                name: todayMument.name,
                artist: todayMument.artist,
                image: todayMument.image,
            },
            user: {
                _id: todayMument.user_id,
                name: todayMument.user_name,
                image: todayMument.user_image,
            },
            content: todayMument.content,
            isFirst: isFirst,
            feelingTag: feelingTag,
            impressionTag: impressionTag,
            cardTag: cardTag,
            createdAt: todayMument.created_at,
            date: createDate(todayMument.created_at),
            displayDate: todayMument.display_date,
        };

        const data: TodayMumentResponseDto = {
            todayDate: todayDate,
            todayMument: todayMumentCard,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 배너
const getBanner = async (userId: number): Promise<TodayBannerResponseDto | number> => {
    try {
        dayjs.extend(utc);

        // 날짜 비교를 위해 이번주 월요일 자정 날짜 받아오기
        const mondayMidnight = dayjs().day(1).hour(0).minute(0).second(0).millisecond(0).format();

        const todayDate = dayjs().format('YYYY-MM-DD');

        const getBannerQuery = `
        SELECT *
        FROM home_banner
        JOIN music
            ON music.id = home_banner.music_id
        WHERE home_banner.display_date = ?;
        `;

        let bannerResult = await pools.queryValue(getBannerQuery, [mondayMidnight]);

        if (bannerResult.length === 0) {
            // 조회 결과가 없을 경우 가장 최근 배너 조회
            const getOlderBannerQuery = `
            SELECT *
            FROM home_banner
            JOIN music 
                ON music.id = home_banner.music_id
            ORDER BY home_banner.display_date DESC
            LIMIT 3;
            `

            bannerResult = await pools.query(getOlderBannerQuery);
        }

        const bannerList: BannerSelectionInfo[] = [];

        bannerResult.forEach(element => {
            const tagTitle = tagBannerTitle[element.tag_id as keyof typeof tagBannerTitle];

            bannerList.push({
                music: {
                    _id: element.music_id.toString(),
                    name: element.name,
                    artist: element.artist,
                    image: element.image,
                },
                tagTitle: tagTitle,
                displayDate: element.display_date,
            });
        });

        const data: TodayBannerResponseDto = {
            todayDate: todayDate,
            userId: userId,
            bannerList: bannerList,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 다시 들은 곡의 뮤멘트 조회
const getAgainMument = async (): Promise<AgainMumentResponseDto | number> => {
    try {
        const getAgainQuery = `
        SELECT mument.id, music.id as music_id, music.name as music_name, music.artist, music.image as music_image, user.id as user_id, user.profile_id as user_name, user.image as user_image, mument.content, mument.created_at
        FROM home_again as ha
        JOIN mument
            ON mument.id = ha.mument_id
        JOIN music
            ON music.id = mument.music_id
        JOIN user
            ON user.id = mument.user_id
        WHERE mument.is_deleted = 0
            AND mument.is_private = 0
            AND mument.is_first = 0
            AND user.is_deleted = 0
        ORDER BY rand()
        LIMIT 3;
        `;

        let homeAgainResult = await pools.query(getAgainQuery);

        if (homeAgainResult.length === 0) {
            const getAgainBackupQuery = `
            SELECT mument.id, music.id as music_id, music.name as music_name, music.artist, music.image as music_image, user.id as user_id, user.profile_id as user_name, user.image as user_image, mument.content, mument.created_at
            FROM mument
            JOIN music
                ON mument.music_id = music.id
            JOIN user
                ON user.id = mument.user_id
            WHERE mument.id = 274
                AND mument.id = 275
                AND mument.id = 276; 
            `;

            homeAgainResult = await pools.query(getAgainBackupQuery);
        };

        const againMument: AgainSelectionInfo[] = [];

        homeAgainResult.forEach(element => {
            againMument.push({
                mumentId: element.id,
                music: {
                    _id: element.music_id.toString(),
                    name: element.music_name,
                    artist: element.artist,
                    image: element.music_image,
                },
                user: {
                    _id: element.user_id,
                    name: element.user_name,
                    image: element.user_image,
                },
                content: element.content,
                createdAt: element.created_at,
            });
        });

        const data: AgainMumentResponseDto = {
            againMument: againMument,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 공지사항 상세보기
const getNoticeDetail = async (noticeId: string): Promise<NoticeInfoRDB | number> => {
    try {
        const selectNoticeQuery = 'SELECT * FROM notice WHERE id=?';
        const notice: NoticeInfoRDB[] = await pools.queryValue(selectNoticeQuery, [noticeId]);

        if (notice.length === 0) return constant.NO_NOTICE;

        const notcieFullTitle = !notice[0].notice_point_word ? notice[0].title : notice[0].notice_point_word + notice[0].title;

        const data: NoticeInfoRDB = {
            id: notice[0].id,
            title: notcieFullTitle,
            content: notice[0].content,
            created_at: dayjs(notice[0].created_at).format('YYYY.MM.DD'),
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 공지사항 리스트 조회
const getNoticeList = async (): Promise<NoticeInfoRDB[]> => {
    try {
        const selectNoticeQuery = 'SELECT * FROM notice ORDER BY created_at DESC;';
        let noticeList: NoticeInfoRDB[] = await pools.query(selectNoticeQuery);

        const noticeListDateFormat = async (item: NoticeInfoRDB, idx: number) => {
            const notcieFullTitle = !item.notice_point_word ? item.title : item.notice_point_word + item.title;

            noticeList[idx] = {
                id: item.id,
                title: notcieFullTitle,
                content: item.content,
                created_at: dayjs(item.created_at).format('YYYY.MM.DD'),
            };
        };

        await noticeList.reduce(async (acc, curr, index) => {
            return acc.then(() => noticeListDateFormat(curr, index));
        }, Promise.resolve());

        return noticeList;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 뮤멘트 신고하기
const createReport = async (mumentId: string, reportCategory: number[], etcContent: string, userId: string): Promise<void | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); //롤백을 위해 필요함

        // 신고 당하는 유저 id 가져오기
        const reportedMument = await mumentDB.isExistMumentInfo(mumentId, connection);
        let reportedUser: number;

        if (!reportedMument.isExist) return constant.NO_MUMENT;
        reportedUser = reportedMument.mument?.user_id as number;

        // 신고 사유 배열에 대해 모두 POST
        const postReport = async (item: number, idx: number) => {
            const postReportQuery = `
                INSERT INTO report(user_id, reported_user_id, report_category_id, reason_etc, mument_id) 
                    VALUES(?, ?, ?, ?, ?);
            `;

            await connection.query(postReportQuery, [userId, reportedUser, item, etcContent, mumentId]);
        };

        await reportCategory.reduce(async (acc, curr, index) => {
            return acc.then(() => postReport(curr, index));
        }, Promise.resolve());

        await connection.commit(); // 모두 성공시 커밋(데이터 적용)
    } catch (error) {
        console.log(error);
        await connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

// 좋아요 누른 사용자 조회
const getLikeUserList = async (mumentId: string, userId: string, limit: any, offset: any): Promise<Number | UserResponseDto[]> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();
    try {
        // 존재하는 뮤멘트인지 확인
        const isExistMument = await mumentDB.isExistMument(mumentId, connection);
        if (!isExistMument) return constant.NO_MUMENT;

        // 차단한 유저 리스트 조회
        const blockUserList: number[] = [];

        // 자신이 차단한 유저 반환
        const blockUserResult = await userDB.blockedUserList(userId);

        for await (let element of blockUserResult) {
            blockUserList.push(element.exist);
        }

        let strBlockUserList = '( 0 )';

        if (blockUserResult.length != 0) {
            strBlockUserList = '(' + blockUserList.toString() + ')';
        }

        // 좋아요를 누른 유저 전부 가져오기
        const getLikeUserQuery = `
        SELECT user.id, user.profile_id, user.image
        FROM mument.like
        JOIN user
            ON mument.like.user_id = user.id
        WHERE mument.like.mument_id = ?
            AND mument.like.user_id NOT IN ${strBlockUserList}
            AND user.is_deleted = 0
        ORDER BY mument.like.created_at DESC
        LIMIT ? OFFSET ?;
        `;

        const getLikeUser = await connection.query(getLikeUserQuery, [mumentId, limit, offset]);

        // 결과가 없는 경우
        if (getLikeUser.length === 0) return constant.NO_RESULT;

        const data: UserResponseDto[] = [];

        getLikeUser.reduce((ac: any[], cur: any) => {
            data.push({
                id: cur.id,
                userName: cur.profile_id,
                image: cur.image,
            });
        }, getLikeUser);

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export default {
    createMument,
    updateMument,
    getMument,
    deleteMument,
    getIsFirst,
    getMumentHistory,
    createLike,
    deleteLike,
    getRandomMument,
    getTodayMument,
    getBanner,
    getAgainMument,
    getNoticeDetail,
    getNoticeList,
    createReport,
    getLikeUserList,
};
