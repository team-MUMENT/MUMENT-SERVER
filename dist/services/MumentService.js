"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const pool_1 = __importDefault(require("../modules/pool"));
const db_1 = __importDefault(require("../loaders/db"));
const Mument_1 = __importDefault(require("../modules/db/Mument"));
const User_1 = __importDefault(require("../modules/db/User"));
const Music_1 = __importDefault(require("../modules/db/Music"));
const tagTitle_1 = require("../modules/tagTitle");
const cardTagList_1 = __importDefault(require("../modules/cardTagList"));
const pushHandler_1 = __importDefault(require("../library/pushHandler"));
/**
 * 뮤멘트 기록하기
 */
const createMument = (userId, musicId, mumentCreateDto) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction(); // 트랜잭션 적용 시작
        // 음악 db에 존재안하면 db에 삽입하기
        yield Music_1.default.SearchAndCreateMusic(mumentCreateDto, connection);
        // 뮤멘트 생성
        const query1 = 'INSERT INTO mument(user_id, music_id, content, is_first, is_Private) VALUES(?, ?, ?, ?, ?)';
        const query1Result = yield connection.query(query1, [userId, musicId, !mumentCreateDto.content ? null : mumentCreateDto.content, mumentCreateDto.isFirst, mumentCreateDto.isPrivate]);
        // 뮤멘트 태그 생성
        yield Mument_1.default.mumentTagCreate(mumentCreateDto.impressionTag, mumentCreateDto.feelingTag, connection, query1Result.insertId);
        yield connection.commit();
        // 몇 번째 뮤멘트 기록인지 count
        const mumentCount = yield connection.query('SELECT COUNT(*) as count FROM mument WHERE user_id = ?', [userId]);
        const data = {
            _id: query1Result.insertId,
            count: mumentCount[0].count,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 뮤멘트 수정하기
 */
const updateMument = (mumentId, mumentUpdateDto) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction(); // 트랜잭션 적용 시작
        // 존재하지 않는 id의 뮤멘트를 수정하려고 할 때
        const isExistMument = yield Mument_1.default.isExistMument(mumentId, connection);
        if (isExistMument === false)
            return serviceReturnConstant_1.default.NO_MUMENT;
        //뮤멘트 수정사항 update
        const query2 = 'UPDATE mument SET is_first=?, content=?, is_private=? WHERE id=?;';
        // 뮤멘트 업데이트
        yield connection.query(query2, [
            mumentUpdateDto.isFirst,
            mumentUpdateDto.content != undefined ? mumentUpdateDto.content : null,
            mumentUpdateDto.isPrivate != undefined ? mumentUpdateDto.isPrivate : 0,
            mumentId,
        ]);
        // 뮤멘트 태그 업데이트 : 기존 태그 모두 삭제 후 새로 삽입
        const query3 = 'DELETE FROM mument_tag where mument_id = ?;';
        yield connection.query(query3, [mumentId]);
        yield Mument_1.default.mumentTagCreate(mumentUpdateDto.impressionTag, mumentUpdateDto.feelingTag, connection, mumentId);
        yield connection.commit(); // query1, query2 모두 성공시 커밋(데이터 적용)
        const data = {
            _id: Number(mumentId),
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 뮤멘트 상세보기
 */
const getMument = (mumentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        // 존재하지 않는 id의 뮤멘트를 조회하려고 할 때
        const isExistMumentInfo = yield Mument_1.default.isExistMumentInfo(mumentId, connection);
        if (isExistMumentInfo.isExist === false)
            return serviceReturnConstant_1.default.NO_MUMENT;
        const mument = isExistMumentInfo.mument; // 뮤멘트 데이터 가져오기
        //  비밀글인데, 본인의 뮤멘트가 아닐 경우 -> 조회하지 못하도록
        if (mument.is_private === 1 && mument.user_id.toString() != userId)
            return serviceReturnConstant_1.default.PRIVATE_MUMENT;
        // 사용자가 이 뮤멘트에 좋아요 눌렀으면 1, 아니면 0
        const isLiked = yield Mument_1.default.isLiked(mumentId, userId);
        // 사용자 정보 가져오기 - 탈퇴한 사용자 포함해서 프로필 정보 가져옴
        const user = yield User_1.default.userInfoIncludeLeave(mument.user_id.toString());
        // 뮤멘트 히스토리 개수 - 뮤멘트의 작성자가 해당 곡에 쓴 뮤멘트 개수
        const historyCount = yield Mument_1.default.mumentHistoryCount(mument.music_id.toString(), mument.user_id.toString(), userId);
        // 작성 시간
        const createdTime = (0, dayjs_1.default)(mument.created_at).format('YYYY.MM.DD h:mm A');
        // 뮤멘트의 태그 검색해서 impressionTag, feelingTag 리스트로 반환
        const tagList = yield Mument_1.default.mumentTagListGet(mumentId);
        const impressionTag = tagList.impressionTag;
        const feelingTag = tagList.feelingTag;
        const data = {
            user: {
                _id: user.id,
                image: user.image,
                name: user.profile_id,
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
        yield connection.commit(); // 모두 성공시 커밋(데이터 적용)
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 뮤멘트 삭제하기
 */
const deleteMument = (mumentId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction(); // 트랜잭션 적용 시작
        // 뮤멘트 삭제하기
        const query1 = 'UPDATE mument SET is_deleted=1 WHERE id=?';
        yield connection.query(query1, [mumentId]);
        // 뮤멘트의 태그들 삭제하기
        const query2 = 'DELETE FROM mument_tag where mument_id = ?;';
        yield connection.query(query2, [mumentId]);
        // 뮤멘트의 좋아요들 삭제하기
        const query3 = 'DELETE FROM mument.like where mument_id = ?;';
        yield connection.query(query3, [mumentId]);
        yield connection.commit(); // 모두 성공시 커밋(데이터 적용)
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 처음/다시 들어요 선택
 */
const getIsFirst = (userId, musicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query1 = 'SELECT * FROM mument WHERE user_id=? AND music_id=? AND is_deleted=0;';
        const result = yield pool_1.default.queryValue(query1, [userId, musicId]);
        const userMument = result;
        if (userMument.length === 0) {
            // 뮤멘트 기록이 처음인 경우
            return {
                isFirst: true,
                firstAvailable: true,
            };
        }
        else {
            // 뮤멘트중 '처음 들었어요' 기록이 하나라도 존재하는 경우 true 반환
            const firstMument = userMument.some((mument) => {
                return mument.is_first == true;
            });
            if (firstMument === false) {
                // '처음 들었어요' 기록이 존재하지 않는 경우 - 처음 선택 가능
                return {
                    isFirst: false,
                    firstAvailable: true,
                };
            }
            else {
                // '처음 들었어요' 기록이 존재하는 경우 - 처음 선택 불가
                return {
                    isFirst: false,
                    firstAvailable: false,
                };
            }
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 히스토리 조회
 */
const getMumentHistory = (userId, musicId, writerId, orderBy, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a, e_2, _b, e_3, _c;
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
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
            getMumentListResult = yield connection.query(getMumentListQuery, [userId, musicId, writerId, limit, offset]);
        }
        else {
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
            getMumentListResult = yield connection.query(getMumentListQuery, [userId, musicId, writerId, limit, offset]);
        }
        // 해당 유저가 작성한 뮤멘트가 없을 경우 리턴
        if (getMumentListResult.length === 0) {
            const data = {
                mumentHistory: [],
            };
            return data;
        }
        // 태그 조회를 위해 뮤멘트 아이디만 빼오고, 스트링으로 만들어주기
        const mumentIdList = yield getMumentListResult.map((x) => x.id);
        const strMumentIdList = '(' + mumentIdList.join(', ') + ')';
        const tagList = [];
        try {
            for (var mumentIdList_1 = __asyncValues(mumentIdList), mumentIdList_1_1; mumentIdList_1_1 = yield mumentIdList_1.next(), !mumentIdList_1_1.done;) {
                let element = mumentIdList_1_1.value;
                tagList.push({ id: element, impressionTag: [], feelingTag: [], cardTag: [] });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (mumentIdList_1_1 && !mumentIdList_1_1.done && (_a = mumentIdList_1.return)) yield _a.call(mumentIdList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // 해당 뮤멘트들의 태그 모두 가져오기
        const getAllTagQuery = `
        SELECT mument_id, tag_id
        FROM mument_tag
        WHERE mument_id IN ${strMumentIdList}
            AND is_deleted = 0
        ORDER BY mument_id, updated_at ASC;
        `;
        const getAllTagList = yield connection.query(getAllTagQuery);
        // impression tag, feeling tag 분류하기
        yield getAllTagList.reduce((ac, cur) => {
            const mumentIdx = tagList.findIndex(o => o.id === cur.mument_id);
            if (cur.tag_id < 200) {
                tagList[mumentIdx].impressionTag.push(cur.tag_id);
            }
            else if (cur.tag_id < 300) {
                tagList[mumentIdx].feelingTag.push(cur.tag_id);
            }
        }, getAllTagList);
        for (const object of tagList) {
            const allTagList = object.impressionTag.concat(object.feelingTag);
            object.cardTag = yield cardTagList_1.default.cardTag(allTagList);
        }
        // id와 좋아요 여부 담은 리스트 생성
        const isLikedList = [];
        try {
            for (var mumentIdList_2 = __asyncValues(mumentIdList), mumentIdList_2_1; mumentIdList_2_1 = yield mumentIdList_2.next(), !mumentIdList_2_1.done;) {
                let element = mumentIdList_2_1.value;
                isLikedList.push({ id: element, isLiked: false });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (mumentIdList_2_1 && !mumentIdList_2_1.done && (_b = mumentIdList_2.return)) yield _b.call(mumentIdList_2);
            }
            finally { if (e_2) throw e_2.error; }
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
        const isLikedResult = yield connection.query(getIsLikedQuery, [userId]);
        // 쿼리 결과에 있을 시에만 isLiked를 true로 바꿈
        yield isLikedResult.reduce((ac, cur) => {
            const mumentIdx = isLikedList.findIndex(o => o.id === cur.mument_id);
            isLikedList[mumentIdx].isLiked = true;
        }, isLikedResult);
        // string으로 날짜 생성해주는 함수
        const createDate = (createdAt) => {
            const date = (0, dayjs_1.default)(createdAt).format('D MMM, YYYY');
            return date;
        };
        const mumentHistory = [];
        try {
            for (var getMumentListResult_1 = __asyncValues(getMumentListResult), getMumentListResult_1_1; getMumentListResult_1_1 = yield getMumentListResult_1.next(), !getMumentListResult_1_1.done;) {
                const mument = getMumentListResult_1_1.value;
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
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (getMumentListResult_1_1 && !getMumentListResult_1_1.done && (_c = getMumentListResult_1.return)) yield _c.call(getMumentListResult_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        const data = {
            mumentHistory,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 뮤멘트 좋아요 등록
 */
const createLike = (mumentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const findMumentResult = yield Mument_1.default.isExistMumentInfo(mumentId, connection);
        if (findMumentResult.isExist === false || !findMumentResult.mument)
            return serviceReturnConstant_1.default.NO_MUMENT;
        yield connection.beginTransaction();
        // 좋아요 등록
        const postLikeQuery = `
        INSERT INTO mument.like (user_id, mument_id)
        VALUE (?, ?);
        `;
        yield connection.query(postLikeQuery, [userId, mumentId]);
        // likeCount 업데이트
        const updateLikeCountQuery = `
        UPDATE mument
        SET like_count = like_count + 1
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(updateLikeCountQuery, [mumentId]);
        // 결과 조회
        const getLikeResultQuery = `
        SELECT mument.like.mument_id, mument.like.user_id, mument.mument.like_count,
        mument.mument.user_id AS writer_id, mument.mument.music_id AS music_id,
        mument.music.name AS music_title
        FROM mument.like
        JOIN mument.mument
            ON mument.mument.id = mument.like.mument_id
        JOIN mument.music
            ON mument.music.id = mument.music_id
        WHERE mument.mument.id = ?
            AND mument.mument.is_deleted = 0
            AND mument.like.user_id = ?;
        `;
        const likeResult = yield connection.query(getLikeResultQuery, [mumentId, userId]);
        if (likeResult.length === 0)
            return serviceReturnConstant_1.default.CREATE_FAIL;
        const data = {
            mumentId: likeResult[0].mument_id,
            likeCount: likeResult[0].like_count,
        };
        //좋아요 눌린 뮤멘트 작성자의 소식창에 좋아요 알림 삽입 - 자기 자신의 뮤멘트면 알림 x  (!넣는게 완성성)
        if (Number(userId) !== findMumentResult.mument.user_id) {
            const userData = yield connection.query('SELECT profile_id FROM user WHERE id=?', [userId]);
            yield connection.query(`INSERT INTO news(type, user_id, like_profile_id, link_id, like_music_title) VALUES('like', ?, ?, ?, ?)`, [
                likeResult[0].writer_id,
                userData[0].profile_id,
                mumentId,
                likeResult[0].music_title,
            ]);
            yield connection.commit();
            // 좋아요 눌린 뮤멘트 작성자에게 푸시알림 - 차단 유저껀 가지 않음
            const blockedUser = yield connection.query('SELECT * FROM block WHERE user_id=? AND blocked_user_id=?', [likeResult[0].writer_id, userId]);
            if (blockedUser.length === 0) {
                const writerData = yield connection.query('SELECT fcm_token FROM user WHERE id=?', [likeResult[0].writer_id]);
                const pushAlarmResult = yield pushHandler_1.default.likePushAlarmHandler('좋아요', `${userData[0].profile_id}님이 ${likeResult[0].music_title}에 쓴 뮤멘트를 좋아합니다.`, writerData[0].fcm_token);
                if (pushAlarmResult === serviceReturnConstant_1.default.LIKE_PUSH_SUCCESS) {
                    Object.assign(data, { pushSuccess: true });
                }
                else if (pushAlarmResult === serviceReturnConstant_1.default.LIKE_PUSH_FAIL) {
                    Object.assign(data, { pushSuccess: false });
                }
                return data;
            }
        }
        return Object.assign(data, { pushSuccess: false });
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
/**
 * 뮤멘트 좋아요 취소
 */
const deleteLike = (mumentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction();
        const findMumentResult = yield Mument_1.default.isExistMument(mumentId, connection);
        if (findMumentResult === false)
            return serviceReturnConstant_1.default.NO_MUMENT;
        const deleteLikeQuery = `
        DELETE FROM mument.like
        WHERE mument_id = ?
            AND user_id = ?;
        `;
        yield connection.query(deleteLikeQuery, [mumentId, userId]);
        // 삭제 되었는지 확인
        const getLikeResultQuery = `
        SELECT *
        FROM mument.like
        WHERE mument_id = ?
            AND user_id = ?;
        `;
        const getLikeResult = yield connection.query(getLikeResultQuery, [mumentId, userId]);
        if (getLikeResult.length != 0)
            return serviceReturnConstant_1.default.DELETE_FAIL;
        // 삭제 확인 후 좋아요 카운트 수 -1
        const updateLikeCountQuery = `
        UPDATE mument
        SET like_count = like_count - 1
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(updateLikeCountQuery, [mumentId]);
        yield connection.commit();
        // 좋아요 카운트 수 가져오기
        const getLikeCountQuery = `
        SELECT id, like_count
        FROM mument
        WHERE id = ?
            AND is_deleted = 0;
        `;
        const getLikeCountResult = yield connection.query(getLikeCountQuery, [mumentId]);
        const data = {
            mumentId: getLikeCountResult[0].id,
            likeCount: getLikeCountResult[0].like_count,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
// 랜덤 태그, 뮤멘트 조회
const getRandomMument = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_4, _d;
    try {
        // 난수 생성 함수
        const createRandomNum = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        // 태그 넘버를 담을 변수
        let detailTag = 0;
        // 태그에 따른 제목을 가져올 변수
        let tagTitle = '';
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
            const tagSort = createRandomNum(1, 2);
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
            tagTitle = tagTitle_1.tagRandomTitle[detailTag];
            randomMumentList = yield pool_1.default.queryValue(getRandomMumentQuery, [detailTag]);
        }
        const mumentList = [];
        try {
            for (var randomMumentList_1 = __asyncValues(randomMumentList), randomMumentList_1_1; randomMumentList_1_1 = yield randomMumentList_1.next(), !randomMumentList_1_1.done;) {
                let element = randomMumentList_1_1.value;
                mumentList.push({
                    _id: element.id,
                    music: {
                        _id: element.music_id,
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
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (randomMumentList_1_1 && !randomMumentList_1_1.done && (_d = randomMumentList_1.return)) yield _d.call(randomMumentList_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        const data = {
            title: tagTitle,
            mumentList: mumentList,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 오늘의 뮤멘트 조회
const getTodayMument = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 리퀘스트 받아온 시간 판단 후 당일 자정으로 수정
        const todayDate = (0, dayjs_1.default)().hour(0).minute(0).second(0).millisecond(0).format('YYYY-MM-DD');
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
        getTodayMumentResult = yield pool_1.default.queryValue(getTodayMumentQuery, [todayDate]);
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
            getTodayMumentResult = yield pool_1.default.queryValue(getBackUpMumentQuery, ['2023-01-01']);
        }
        if (getTodayMumentResult.length === 0)
            return serviceReturnConstant_1.default.NO_HOME_CONTENT;
        const todayMument = getTodayMumentResult[0];
        const getTagQuery = `
        SELECT *
        FROM mument_tag
        WHERE mument_id = ?
            AND is_deleted = 0
        ORDER BY created_at ASC;
        `;
        const getTagResult = yield pool_1.default.queryValue(getTagQuery, [todayMument.id]);
        const tagList = [];
        const impressionTag = [];
        const feelingTag = [];
        for (const object of getTagResult) {
            tagList.push(object.tag_id);
            if (object.tag_id < 200) {
                impressionTag.push(object.tag_id);
            }
            else if (object.tag_id < 300) {
                feelingTag.push(object.tag_id);
            }
        }
        const cardTag = yield cardTagList_1.default.cardTag(tagList);
        const createDate = (createdAt) => {
            const date = (0, dayjs_1.default)(createdAt).format('D MMM, YYYY');
            return date;
        };
        const isFirst = todayMument.is_first ? true : false;
        const todayMumentCard = {
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
        const data = {
            todayDate: todayDate,
            todayMument: todayMumentCard,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 배너
const getBanner = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        dayjs_1.default.extend(utc_1.default);
        // 날짜 비교를 위해 이번주 월요일 자정 날짜 받아오기
        const mondayMidnight = (0, dayjs_1.default)().day(1).hour(0).minute(0).second(0).millisecond(0).format();
        const todayDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const getBannerQuery = `
        SELECT *
        FROM home_banner
        JOIN music
            ON music.id = home_banner.music_id
        WHERE home_banner.display_date = ?;
        `;
        const bannerResult = yield pool_1.default.queryValue(getBannerQuery, [mondayMidnight]);
        if (bannerResult.length === 0)
            return serviceReturnConstant_1.default.NO_HOME_CONTENT;
        const bannerList = [];
        bannerResult.forEach(element => {
            const tagTitle = tagTitle_1.tagBannerTitle[element.tag_id];
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
        const data = {
            todayDate: todayDate,
            userId: userId,
            bannerList: bannerList,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 다시 들은 곡의 뮤멘트 조회
const getAgainMument = () => __awaiter(void 0, void 0, void 0, function* () {
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
        const homeAgainResult = yield pool_1.default.query(getAgainQuery);
        if (homeAgainResult.length === 0)
            return serviceReturnConstant_1.default.NO_HOME_CONTENT;
        const againMument = [];
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
        const data = {
            againMument: againMument,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 공지사항 상세보기
const getNoticeDetail = (noticeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectNoticeQuery = 'SELECT * FROM notice WHERE id=?';
        const notice = yield pool_1.default.queryValue(selectNoticeQuery, [noticeId]);
        if (notice.length === 0)
            return serviceReturnConstant_1.default.NO_NOTICE;
        const notcieFullTitle = !notice[0].notice_point_word ? notice[0].title : notice[0].notice_point_word + notice[0].title;
        const data = {
            id: notice[0].id,
            title: notcieFullTitle,
            content: notice[0].content,
            created_at: (0, dayjs_1.default)(notice[0].created_at).format('YYYY.MM.DD'),
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 공지사항 리스트 조회
const getNoticeList = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectNoticeQuery = 'SELECT * FROM notice ORDER BY created_at DESC;';
        let noticeList = yield pool_1.default.query(selectNoticeQuery);
        const noticeListDateFormat = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const notcieFullTitle = !item.notice_point_word ? item.title : item.notice_point_word + item.title;
            noticeList[idx] = {
                id: item.id,
                title: notcieFullTitle,
                content: item.content,
                created_at: (0, dayjs_1.default)(item.created_at).format('YYYY.MM.DD'),
            };
        });
        yield noticeList.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => noticeListDateFormat(curr, index));
        }), Promise.resolve());
        return noticeList;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
// 뮤멘트 신고하기
const createReport = (mumentId, reportCategory, etcContent, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction(); //롤백을 위해 필요함
        // 신고 당하는 유저 id 가져오기
        const reportedMument = yield Mument_1.default.isExistMumentInfo(mumentId, connection);
        let reportedUser;
        if (!reportedMument.isExist)
            return serviceReturnConstant_1.default.NO_MUMENT;
        reportedUser = (_e = reportedMument.mument) === null || _e === void 0 ? void 0 : _e.user_id;
        // 신고 사유 배열에 대해 모두 POST
        const postReport = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const postReportQuery = `
                INSERT INTO report(user_id, reported_user_id, report_category_id, reason_etc, mument_id) 
                    VALUES(?, ?, ?, ?, ?);
            `;
            yield connection.query(postReportQuery, [userId, reportedUser, item, etcContent, mumentId]);
        });
        yield reportCategory.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => postReport(curr, index));
        }), Promise.resolve());
        yield connection.commit(); // 모두 성공시 커밋(데이터 적용)
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
// 좋아요 누른 사용자 조회
const getLikeUserList = (mumentId, userId, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        // 존재하는 뮤멘트인지 확인
        const isExistMument = yield Mument_1.default.isExistMument(mumentId, connection);
        if (!isExistMument)
            return serviceReturnConstant_1.default.NO_MUMENT;
        // 차단한 유저 리스트 조회
        // 자신이 차단한, 자신을 차단한 유저 리스트
        const blockUserList = [];
        // 자신이 차단한 유저 반환
        const blockUserResult = yield User_1.default.blockedUserList(userId);
        blockUserResult.forEach(element => {
            blockUserList.push(element.exist);
        });
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
        const getLikeUser = yield connection.query(getLikeUserQuery, [mumentId, limit, offset]);
        // 결과가 없는 경우
        if (getLikeUser.length === 0)
            return serviceReturnConstant_1.default.NO_RESULT;
        const data = [];
        getLikeUser.reduce((ac, cur) => {
            data.push({
                id: cur.id,
                profileId: cur.profile_id,
                image: cur.image,
            });
        }, getLikeUser);
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.default = {
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
//# sourceMappingURL=MumentService.js.map