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
                        _id: item.music_id,
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
                    createdAt: (0, dayjs_1.default)(item.created_at).format('D MMM, YYYY'),
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
                        _id: item.music_id,
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
                    createdAt: (0, dayjs_1.default)(item.created_at).format('D MMM, YYYY'),
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
            WHERE block.user_id=? AND user.is_deleted=0;
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
            profileId: profileId,
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
            profileId: getLeaveResult[0].profile_id,
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
        const data = {
            id: user.id,
            profileId: user.profile_id,
            isDeleted: user.is_deleted,
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
 * 신고 제재 기간인 유저인지 확인
 */
const getIsReportRestrictedUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const selectReportRestrictionQuery = 'SELECT * FROM report_restriction WHERE user_id=?';
        const restriction = yield connection.query(selectReportRestrictionQuery, [userId]);
        if (restriction.length === 0)
            return { restricted: false };
        /**
         * 현재 날짜 < 제재 마감일 이라면
         *  */
        const curr = new Date();
        if ((0, dayjs_1.default)(curr).isBefore(restriction[0].restrict_end_date)) {
            return {
                restricted: true,
                reason: restriction[0].reason,
                musicArtist: restriction[0].music_artist,
                musicTitle: restriction[0].music_title,
                endDate: (0, dayjs_1.default)(restriction[0].restrict_end_date).format('YYYY-MM-DD'),
                period: restriction[0].restrict_period
            };
        }
        return { restricted: false };
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
            return { exist: 1 };
        else
            return { exist: 0 };
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
    connection.beginTransaction(); //롤백을 위해 필요함
    try {
        const updateNewsQuery = `
            UPDATE news SET is_deleted=1 WHERE user_id=? AND id=?;
        `;
        const updateResult = yield connection.query(updateNewsQuery, [userId, newsId]);
        // update가 되지 않을 경우
        if (updateResult.changedRows !== undefined && updateResult.changedRows == 0)
            return serviceReturnConstant_1.default.UPDATE_FAIL;
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
                    isDeleted: item.is_deleted,
                    isRead: item.is_read,
                    createdAt: (0, dayjs_1.default)(item.created_at).format('MM/DD HH:mm'),
                    linkId: item.link_id,
                    noticeTitle: item.notice_title,
                    likeProfileId: item.like_profile_id,
                    likeMusicTitle: item.like_music_title
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
    getIsReportRestrictedUser,
    getUnreadNewsisExist,
    updateUnreadNews,
    deleteNews,
    getNewsList,
};
//# sourceMappingURL=UserService.js.map