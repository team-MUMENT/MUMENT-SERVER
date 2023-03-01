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
const pool_1 = __importDefault(require("../modules/pool"));
const db_1 = __importDefault(require("../loaders/db"));
const jwtHandler_1 = __importDefault(require("../library/jwtHandler"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const Mument_1 = __importDefault(require("../modules/db/Mument"));
const User_1 = __importDefault(require("../modules/db/User"));
const cardTagList_1 = __importDefault(require("../modules/cardTagList"));
const pushHandler_1 = __importDefault(require("../library/pushHandler"));
const WebViewLink_1 = __importDefault(require("../modules/db/WebViewLink"));
const appleSignRevoke_1 = __importDefault(require("../library/appleSignRevoke"));
const fs = require('fs');
const AppleAuth = require('apple-auth');
// 경로 기준 - dist폴더를 현재위치의 기준으로 쓴 것임
const appleConfig = fs.readFileSync('src/config/apple/AppleConfig.json');
const appleAuth = new AppleAuth(appleConfig, fs.readFileSync('src/config/apple/AuthKey.p8').toString(), 'text');
/**
 * 내가 작성한 뮤멘트 리스트
 */
const getMyMumentList = (userId, tagList) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 내가 작성한 뮤멘트 리스트&음악 정보 가져오기
        let myMumentList = yield User_1.default.myMumentList(userId);
        if (myMumentList.length === 0)
            return { muments: [] };
        let result = [];
        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList = [];
        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList = [];
        // 나의 유저 정보
        const user = yield User_1.default.userInfo(myMumentList[0].user_id.toString());
        const myMumentListFunc = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            if (idx === myMumentList.length - 1 || (idx < myMumentList.length - 1 && myMumentList[idx + 1].mument_id !== item.mument_id)) {
                // isLiked 좋아요 유무
                const isLiked = yield Mument_1.default.isLiked(item.mument_id.toString(), item.user_id.toString());
                // 뮤멘트 태그 전체 합치기
                if (item.tag_id)
                    allCardTagList.push(item.tag_id);
                // 뮤멘트 카드뷰 태그 리스트 개수 처리
                cardTagList = yield cardTagList_1.default.cardTag(allCardTagList);
                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: user.image,
                        name: user.profile_id
                    },
                    music: {
                        _id: item.music_id.toString(),
                        name: item.name,
                        artist: item.artist,
                        image: item.music_image
                    },
                    isFirst: Boolean(item.is_first),
                    allCardTag: allCardTagList,
                    cardTag: cardTagList,
                    content: item.content,
                    isPrivate: Boolean(item.is_private),
                    likeCount: item.like_count,
                    isLiked: Boolean(isLiked),
                    createdAt: (0, dayjs_1.default)(item.created_at).format('YYYY.MM.DD'),
                    year: Number((0, dayjs_1.default)(item.created_at).format('YYYY')),
                    month: Number((0, dayjs_1.default)(item.created_at).format('M'))
                });
                // 리셋
                allCardTagList = [];
                cardTagList = [];
            }
            else {
                // 뮤멘트 태그 합치기
                if (item.tag_id)
                    allCardTagList.push(item.tag_id);
            }
        });
        yield myMumentList.reduce((pre, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return pre.then(() => myMumentListFunc(curr, index));
        }), Promise.resolve());
        // 필링 태그 존재시 뮤멘트 필터링 - 전체 태그 리스트에서 필터링하고, 카드뷰에 띄우는건 cardTag
        if (tagList.length > 0) {
            result = result.filter(mument => {
                return tagList.every(tag => {
                    var _a;
                    return (_a = mument.allCardTag) === null || _a === void 0 ? void 0 : _a.includes(tag);
                });
            });
        }
        return {
            muments: result,
        };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 *  좋아요 누른 뮤멘트 리스트
 */
const getLikeMumentList = (userId, tagList) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 좋아요한 뮤멘트 리스트 가져오기
        let likeMumentList = yield User_1.default.myLikeMumentList(userId);
        // 좋아요 글 없을 시
        if (likeMumentList.length === 0)
            return { muments: [] };
        let result = [];
        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList = [];
        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList = [];
        // 사용자가 차단한 유저 배열
        const blockedUserList = yield User_1.default.blockedUserList(userId);
        const likeMumentListFunc = (acc, item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const isBlocked = blockedUserList.find(({ exist }) => exist == item.user_id);
            if (isBlocked !== undefined) {
                //차단된 유저의 뮤멘트라면 reduce가 다음 코드 실행안함
                return acc;
            }
            if (idx === likeMumentList.length - 1
                || (idx < likeMumentList.length - 1 && likeMumentList[idx + 1].mument_id !== item.mument_id)) {
                // 뮤멘트 태그 전체 합치기
                if (item.tag_id)
                    allCardTagList.push(item.tag_id);
                // 뮤멘트 카드뷰 태그 리스트 개수 처리
                cardTagList = yield cardTagList_1.default.cardTag(allCardTagList);
                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: item.user_image,
                        name: item.profile_id
                    },
                    music: {
                        _id: item.music_id.toString(),
                        name: item.name,
                        artist: item.artist,
                        image: item.music_image
                    },
                    isFirst: Boolean(item.is_first),
                    allCardTag: allCardTagList,
                    cardTag: cardTagList,
                    content: item.content,
                    isPrivate: Boolean(item.is_private),
                    likeCount: item.like_count,
                    isLiked: true,
                    createdAt: (0, dayjs_1.default)(item.created_at).format('YYYY.MM.DD'),
                    year: Number((0, dayjs_1.default)(item.created_at).format('YYYY')),
                    month: Number((0, dayjs_1.default)(item.created_at).format('M'))
                });
                // 리셋
                allCardTagList = [];
                cardTagList = [];
            }
            else {
                // 뮤멘트 태그 합치기
                if (item.tag_id)
                    allCardTagList.push(item.tag_id);
            }
        });
        yield likeMumentList.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => likeMumentListFunc(acc, curr, index));
        }), Promise.resolve());
        // 필링 태그 존재시 뮤멘트 필터링 - 전체 태그 리스트에서 필터링하고, 카드뷰에 띄우는건 cardTag
        if (tagList.length > 0) {
            result = result.filter(mument => {
                return tagList.every(tag => {
                    var _a;
                    return (_a = mument.allCardTag) === null || _a === void 0 ? void 0 : _a.includes(tag);
                });
            });
        }
        return {
            muments: result,
        };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 *  유저 차단하기
 */
const blockUser = (userId, mumentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction(); //롤백을 위해 필요함
        // 뮤멘트 작성자 id 가져오기
        const blockedMument = yield Mument_1.default.isExistMumentInfo(mumentId, connection);
        let blockedUser;
        if (!blockedMument.isExist)
            return serviceReturnConstant_1.default.NO_MUMENT;
        blockedUser = (_a = blockedMument.mument) === null || _a === void 0 ? void 0 : _a.user_id;
        // 자기자신을 차단하려는 경우
        if (blockedUser === userId)
            return serviceReturnConstant_1.default.SELF_BLOCK;
        // 차단 이력이 없는 유저인지 확인
        const blockCheckQuery = `
            SELECT * FROM block WHERE user_id=? AND blocked_user_id=?
        `;
        const blockHistory = yield connection.query(blockCheckQuery, [
            userId,
            blockedUser
        ]);
        if (blockHistory.length > 0) {
            return serviceReturnConstant_1.default.ALREADY_BLOCK;
        }
        // 차단하기
        const blockInsertQuery = `
            INSERT INTO block(user_id, blocked_user_id) VALUES(?, ?);
        `;
        const blockRow = yield connection.query(blockInsertQuery, [
            userId,
            blockedUser
        ]);
        yield connection.commit(); // 성공시 commit
        const data = {
            exist: blockRow.insertId
        };
        return data;
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // 쿼리 에러시 롤백
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 *  유저 차단 취소
 */
const deleteBlockUser = (userId, blockedUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteBlockQuery = `DELETE FROM block WHERE user_id=? AND blocked_user_id=?`;
        yield pool_1.default.queryValue(deleteBlockQuery, [
            userId,
            blockedUserId
        ]);
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 *  차단 유저 리스트 조회
 */
const getBlockedUserList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const selectBlockQuery = `
            SELECT blocked_user_id as id, user.profile_id, user.image FROM block
            JOIN user ON block.blocked_user_id=user.id
            WHERE block.user_id=?;
        `;
        const blockedUserList = yield pool_1.default.queryValue(selectBlockQuery, [
            userId
        ]);
        const data = blockedUserList;
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 *  프로필 설정 (소셜 로그인 후) & 프로필 수정
 */
const putProfile = (userId, profileId, image) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const isExistUser = yield User_1.default.isExistUser(userId);
        if (isExistUser === 0)
            return serviceReturnConstant_1.default.NO_USER;
        connection.beginTransaction();
        const putProfileQuery = `
        UPDATE user
        SET profile_id = ?, image = ?
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(putProfileQuery, [profileId, image, userId]);
        const getProfileQuery = `
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0;
        `;
        const getProfileResult = yield connection.query(getProfileQuery, [userId]);
        if (getProfileResult[0].profile_id != profileId || getProfileResult[0].image != image) {
            return serviceReturnConstant_1.default.UPDATE_FAIL;
        }
        const user = getProfileResult[0];
        const accessToken = jwtHandler_1.default.accessSign(user);
        const refreshToken = jwtHandler_1.default.refreshSign(user);
        const updateRefreshTokenQuery = `
        UPDATE user
        SET refresh_token = ?
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(updateRefreshTokenQuery, [refreshToken, userId]);
        yield connection.commit();
        const data = {
            id: user.id,
            accessToken,
            refreshToken,
            userName: profileId,
            image: user.image,
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
/**
 *  프로필 아이디 중복 체크
 */
const checkDuplicateName = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkQuery = `
        SELECT EXISTS(
            SELECT *
            FROM user
            WHERE profile_id = ?
                AND is_deleted = 0
        ) as is_duplicate;
        `;
        const checkResult = yield pool_1.default.queryValue(checkQuery, [profileId]);
        const isDuplicate = checkResult[0].is_duplicate;
        const data = isDuplicate;
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 유저 탈퇴 (사유 등록)
 */
const postLeaveCategory = (userId, leaveCategoryId, reasonEtc) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const isExistUser = yield User_1.default.isExistUser(userId);
        if (!isExistUser)
            return serviceReturnConstant_1.default.NO_USER;
        connection.beginTransaction();
        const postLeaveQuery = `
        INSERT INTO mument.leave(user_id, leave_category_id, reason_etc)
        VALUES(?, ?, ?);
        `;
        yield connection.query(postLeaveQuery, [userId, leaveCategoryId, reasonEtc]);
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
        const getLeaveResult = yield connection.query(getLeaveQuery, [userId]);
        if (getLeaveResult.length != 1 || getLeaveResult[0].leave_category_id != leaveCategoryId) {
            return serviceReturnConstant_1.default.CREATE_FAIL;
        }
        ;
        yield connection.commit();
        const data = {
            id: getLeaveResult[0].id,
            userId: getLeaveResult[0].user_id,
            userName: getLeaveResult[0].profile_id,
            leaveCategoryId: getLeaveResult[0].leave_category_id,
            leaveCategoryName: getLeaveResult[0].name,
            reasonEtc: getLeaveResult[0].reason_etc,
            createdAt: getLeaveResult[0].created_at,
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
/**
 * 유저 탈퇴
*/
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        // 존재하는 유저인지 확인
        const isExistUser = yield User_1.default.isExistUser(userId);
        if (!isExistUser)
            return serviceReturnConstant_1.default.NO_USER;
        connection.beginTransaction();
        // 유저 탈퇴
        const deleteUserQuery = `
        UPDATE user
        SET is_deleted = 1
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(deleteUserQuery, [userId]);
        // 삭제되었는지 확인
        const getUserQuery = `
        SELECT id, profile_id, is_deleted, updated_at
        FROM user
        WHERE id = ?
        `;
        const getUserResult = yield connection.query(getUserQuery, [userId]);
        const user = getUserResult[0];
        if (!user.is_deleted)
            return serviceReturnConstant_1.default.DELETE_FAIL;
        yield connection.commit();
        const isDeleted = user.isDeleted ? true : false;
        const data = {
            id: user.id,
            userName: user.profile_id,
            isDeleted: isDeleted,
            updatedAt: user.updated_at,
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
/**
 * 유저 탈퇴 처리 후 소셜 로그인 연동 끊기 (NEW)
*/
const deleteUserAndRevokeSocial = (userId, socialAccessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        // 존재하는 유저인지 확인
        const isExistUser = yield User_1.default.isExistUser(userId);
        if (!isExistUser)
            return serviceReturnConstant_1.default.NO_USER;
        connection.beginTransaction();
        // 유저 탈퇴
        const deleteUserQuery = `
        UPDATE user
        SET is_deleted = 1
        WHERE id = ?
            AND is_deleted = 0;
        `;
        yield connection.query(deleteUserQuery, [userId]);
        // 삭제되었는지 확인
        const getUserQuery = `
        SELECT id, profile_id, is_deleted, updated_at, provider
        FROM user
        WHERE id = ?
        `;
        const getUserResult = yield connection.query(getUserQuery, [userId]);
        const user = getUserResult[0];
        if (!user.is_deleted)
            return serviceReturnConstant_1.default.DELETE_FAIL;
        const isDeleted = user.isDeleted ? true : false;
        const data = {
            id: user.id,
            userName: user.profile_id,
            isDeleted: isDeleted,
            updatedAt: user.updated_at,
        };
        // // 방법1) apple 유저 - 서비스 연동 끊기 (authorization code를 받을 경우 - access token생성 필요)
        // if (user.provider === 'apple' && typeof authorizationCode == 'string') {
        //     const appleAccessToken = await appleAuth.accessToken(authorizationCode);
        // }
        // 방법2) apple 유저 - 서비스 연동 끊기 (access token을 받을 경우)
        if (user.provider === 'apple' && typeof socialAccessToken == 'string') {
            const appleRevokeResult = yield appleSignRevoke_1.default.appleSignRevoke(socialAccessToken);
            if (appleRevokeResult === serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_SUCCESS) {
                return data;
            }
            else {
                // 애플 연동 해제 실패 시 데이터 rollback
                yield connection.rollback();
                return serviceReturnConstant_1.default.APPLE_SIGN_REVOKE_FAIL;
            }
        }
        yield connection.commit();
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
/**
 * 신고 제재 기간인 유저인지 확인
 */
const getIsReportRestrictedUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const selectReportRestrictionQuery = 'SELECT * FROM report_restriction WHERE user_id=?';
        const restriction = yield connection.query(selectReportRestrictionQuery, [userId]);
        if (restriction.length === 0) {
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
        const dayDiff = (0, dayjs_1.default)(curr).diff(restriction[0].restrict_end_date, 'day', true);
        if (dayDiff < 1) {
            return {
                restricted: true,
                reason: restriction[0].reason,
                musicArtist: restriction[0].music_artist,
                musicTitle: restriction[0].music_title,
                endDate: (0, dayjs_1.default)(restriction[0].restrict_end_date).format('YYYY-MM-DD'),
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
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 소식창에 안읽은 알림이 있는지 조회
 */
const getUnreadNewsisExist = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const curr = new Date();
        const comparedDate = (0, dayjs_1.default)(curr).subtract(2, 'week').format();
        const selectNewsQeury = `
            SELECT * FROM news 
            WHERE user_id=? AND is_deleted=0 AND is_read=0 AND created_at BETWEEN ? AND ?
        `;
        const data = yield connection.query(selectNewsQeury, [
            userId, comparedDate, (0, dayjs_1.default)(curr).format()
        ]);
        if (data.length > 0)
            return { exist: true };
        else
            return { exist: false };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 소식창 새로운 알림 읽음 처리
 */
const updateUnreadNews = (userId, unreadNews) => { var unreadNews_1, unreadNews_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    connection.beginTransaction(); //롤백을 위해 필요함
    try {
        const updateUnReadQuery = `
            UPDATE news SET is_read=1 WHERE user_id=? AND id=?
        `;
        try {
            for (unreadNews_1 = __asyncValues(unreadNews); unreadNews_1_1 = yield unreadNews_1.next(), !unreadNews_1_1.done;) {
                const id = unreadNews_1_1.value;
                const updateResult = yield connection.query(updateUnReadQuery, [userId, id]);
                // update가 되지 않을 경우
                if (updateResult.changedRows !== undefined && updateResult.changedRows == 0) {
                    connection.rollback(); // 하나라도 update안되면 데이터 적용 원상복귀
                    return serviceReturnConstant_1.default.UPDATE_FAIL;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (unreadNews_1_1 && !unreadNews_1_1.done && (_a = unreadNews_1.return)) yield _a.call(unreadNews_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        yield connection.commit();
    }
    catch (error) {
        console.log(error);
        yield connection.rollback(); // 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
}); };
/**
 * 소식창 알림 제거
 */
const deleteNews = (userId, newsId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const updateNewsQuery = `
            UPDATE news SET is_deleted=1 WHERE user_id=? AND id=?;
        `;
        const updateResult = yield connection.query(updateNewsQuery, [userId, newsId]);
        // update가 되지 않을 경우
        if (updateResult.changedRows !== undefined && updateResult.changedRows == 0)
            return serviceReturnConstant_1.default.UPDATE_FAIL;
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
 * 소식창 리스트 조회
 */
const getNewsList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    let result = [];
    try {
        const selectNewsQuery = `
            SELECT * FROM news WHERE user_id=? AND is_deleted=0 ORDER BY created_at DESC;
        `;
        const newsList = yield connection.query(selectNewsQuery, [userId]);
        const curr = new Date();
        const comparedDate = (0, dayjs_1.default)(curr).subtract(2, 'week').format();
        const newsListDateFormat = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            // 최근 2주전 알림만 보여줌
            if ((0, dayjs_1.default)(comparedDate).isBefore(item.created_at)) {
                result.push({
                    id: item.id,
                    type: item.type,
                    userId: item.user_id,
                    isDeleted: Boolean(item.is_deleted),
                    isRead: Boolean(item.is_read),
                    createdAt: (0, dayjs_1.default)(item.created_at).format('MM.DD h:mm A'),
                    linkId: item.link_id,
                    notice: {
                        point: item.notice_point_word,
                        title: item.notice_title
                    },
                    like: {
                        userName: item.like_profile_id,
                        music: {
                            id: item.like_music_id,
                            name: item.like_music_title,
                            artist: item.like_music_artist,
                            image: item.like_music_image
                        }
                    }
                });
            }
        });
        yield newsList.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => newsListDateFormat(curr, index));
        }), Promise.resolve());
        return result;
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
 * 공지사항 등록 - 기획, 서버에서만 사용
 */
const postNotice = (point, title, content, noticeCategory) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    let connection = yield pool.getConnection();
    try {
        yield connection.beginTransaction();
        // 공지사항 추가
        const createdNotice = yield connection.query('INSERT INTO notice(category, title, content, notice_point_word) VALUES(?, ?, ?, ?)', [noticeCategory, title, content, point]);
        if ((createdNotice === null || createdNotice === void 0 ? void 0 : createdNotice.affectedRows) === 0)
            return serviceReturnConstant_1.default.CREATE_NOTICE_FAIL;
        // 공지사항 row 조회
        const createdNoticeRow = yield connection.query('SELECT * FROM notice WHERE id=?', [createdNotice.insertId]);
        const noticeTitle = (!createdNoticeRow[0].notice_point_word) ? createdNoticeRow[0].title : createdNoticeRow[0].notice_point_word + createdNoticeRow[0].title;
        ;
        const noticeId = createdNoticeRow[0].id;
        const noticePointWord = createdNoticeRow[0].notice_point_word;
        let fcmTokenList = [];
        // 모든 활성 유저의 소식창에 공지사항 알림 추가        
        const allActiveUser = yield connection.query('SELECT * FROM user WHERE is_deleted=0');
        yield connection.commit();
        // 커넥션 쪼개기
        connection = yield pool.getConnection();
        yield connection.beginTransaction();
        const insertNewsToAllActiveUser = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            yield connection.query(`INSERT INTO news(type, user_id, notice_title, link_id, notice_point_word) VALUES('notice', ?, ?, ?, ?)`, [item.id, createdNoticeRow[0].title, noticeId, noticePointWord]);
            if (item.fcm_token && item.fcm_token.length > 0) {
                fcmTokenList.push(item.fcm_token);
            }
        });
        yield allActiveUser.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => insertNewsToAllActiveUser(curr, index));
        }), Promise.resolve());
        yield connection.commit();
        // 새로운 공지사항 활성 유저에게 푸시알림
        const pushAlarmResult = yield pushHandler_1.default.noticePushAlarmHandler('공지', noticeTitle, fcmTokenList);
        if (pushAlarmResult === serviceReturnConstant_1.default.NOTICE_PUSH_SUCCESS) {
            return {
                pushSuccess: true,
                noticeId: createdNoticeRow[0].id
            };
        }
        return {
            pushSuccess: false,
            noticeId: createdNoticeRow[0].id
        };
    }
    catch (error) {
        console.log(error);
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release(); // pool connection 회수
    }
});
/**
 * 프로필 설정이 완료되었는지 확인
 */
const checkProfileSet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // userId로 유저 정보 가져오기
        const user = yield User_1.default.userInfo(userId);
        // 프로필 설정이 완료되지 않았으면 false 리턴
        if (!user.profile_id)
            return false;
        return true;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 유저 프로필 정보 조회
 */
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.userInfo(userId);
        if (!user)
            return serviceReturnConstant_1.default.NO_USER;
        const data = {
            id: user.id,
            userName: user.profile_id,
            image: user.image,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
/**
 * 웹뷰 링크 조회
*/
const getWebviewLink = (page) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (page === 'mypage') {
            // [마이페이지] 웹뷰 조회
            return {
                faq: WebViewLink_1.default.faq,
                contact: WebViewLink_1.default.contact,
                appInfo: WebViewLink_1.default.appInfo,
                introduction: WebViewLink_1.default.introduction,
                license: WebViewLink_1.default.license,
            };
        }
        else if (page === 'login') {
            // [로그인] 웹뷰 조회
            return {
                tos: WebViewLink_1.default.tos,
                privacy: WebViewLink_1.default.privacy
            };
        }
        else {
            return serviceReturnConstant_1.default.WRONG_QUERYSTRING;
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
exports.default = {
    getMyMumentList,
    getLikeMumentList,
    blockUser,
    deleteBlockUser,
    getBlockedUserList,
    putProfile,
    checkDuplicateName,
    postLeaveCategory,
    deleteUser,
    deleteUserAndRevokeSocial,
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
//# sourceMappingURL=UserService.js.map