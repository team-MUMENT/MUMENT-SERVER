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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../pool"));
/**
 * user 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */
/**
 * user 관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */
// 존재하는 user인지 확인하기
const isExistUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT EXISTS (
        SELECT *
        FROM user
        WHERE id = ?
            AND is_deleted = 0
    ) as is_exist_user;
    `;
    const isExist = yield pool_1.default.queryValue(query, [userId]);
    return isExist[0].is_exist_user;
});
// userId로 유저 레코드 가져오기
const userInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM user WHERE id=? AND is_deleted=0'; //탈퇴하지 않은 유저
    const user = yield pool_1.default.queryValue(query, [userId]);
    console.log(user);
    return user[0];
});
// userId로 탈퇴한 유저 포함 레코드 가져오기
const userInfoIncludeLeave = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM user WHERE id=?';
    const user = yield pool_1.default.queryValue(query, [userId]);
    console.log(user);
    return user[0];
});
// 내가 작성한 뮤멘트 리스트 가져오기 - 최신순
const myMumentList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const myMumentList = yield pool_1.default.query(mumentListQuery);
    return myMumentList;
});
// 좋아요한 뮤멘트 리스트 가져오기 - 최신순
const myLikeMumentList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
            WHERE mument.like.user_id=${userId} AND mument.is_deleted=0 AND mument.is_private=0
            ORDER BY mument.created_at DESC;`;
    const myMumentList = yield pool_1.default.query(mumentListQuery);
    return myMumentList;
});
// userId가 차단한 유저 배열 반환
const blockedUserList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const selectBlockQuery = `
        SELECT blocked_user_id as exist 
            FROM block WHERE user_id=?;`;
    const blockedUserList = yield pool_1.default.queryValue(selectBlockQuery, [userId]);
    return blockedUserList;
});
// 뮤멘트 작성자에게 차단된 유저인지 확인
const isBlockedUser = (userId, mumentId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield pool_1.default.queryValue(query, [userId, mumentId]);
    const isBlocked = result[0].is_blocked;
    return isBlocked;
});
exports.default = {
    userInfo,
    userInfoIncludeLeave,
    myMumentList,
    myLikeMumentList,
    blockedUserList,
    isExistUser,
    isBlockedUser,
};
//# sourceMappingURL=User.js.map