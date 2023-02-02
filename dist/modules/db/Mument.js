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
 * mument 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */
// 뮤멘트 태그 삽입 - impressionTag, feelingTag 리스트 합쳐서 처리
const mumentTagCreate = (impressionTag, feelingTag, connection, mumentId) => __awaiter(void 0, void 0, void 0, function* () {
    const tagList = impressionTag.concat(feelingTag);
    for (let idx in tagList) {
        const query = 'INSERT INTO mument_tag(mument_id, tag_id) VALUES(?, ?);';
        yield connection.query(query, [
            mumentId,
            tagList[idx] // tag 번호
        ]);
    }
});
// 존재하는 뮤멘트 id인지 판단
const isExistMument = (mumentId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM mument WHERE id=? AND NOT is_deleted=1;'; //삭제되지 않은 뮤멘트여야 함
    const mument = yield connection.query(query, [mumentId]);
    return mument.length === 0 ? false : true; // 존재하지 않으면 false 반환
});
// 존재하는 뮤멘트 id인지 판단 & 뮤멘트 정보 반환
const isExistMumentInfo = (mumentId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM mument WHERE id=? AND NOT is_deleted=1;'; //삭제되지 않은 뮤멘트여야 함
    const mument = yield connection.query(query, [mumentId]);
    return {
        isExist: mument.length === 0 ? false : true,
        mument: !mument[0] ? null : mument[0] // 존재하지 않으면 null, 존재하면 뮤멘트 데이터
    };
});
/**
 * mument관련 재사용 쿼리 - 트랜잭션 없이 사용가능
 */
// userId가 해당 뮤멘트에 좋아요를 눌렀는지 확인
const isLiked = (mumentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT EXISTS(SELECT * FROM mument.like WHERE mument_id=? AND user_id=?) as exist;';
    // 좋아요 존재하면 1, 존재하지 않으면 0 반환함
    const isLiked = yield pool_1.default.queryValue(query, [mumentId, userId]);
    return isLiked[0].exist;
});
// 뮤멘트의 좋아요 개수 count
const likeCount = (mumentId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT COUNT(*) as exist FROM mument.like WHERE mument_id=${mumentId};`;
    const likeCount = yield pool_1.default.query(query);
    return likeCount[0].exist;
});
const mumentHistoryCount = (musicId, writerId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let historyQuery;
    if (writerId != userId) {
        // 타인의 뮤멘트 히스토리 - 비밀글 제외하고 count
        historyQuery = 'SELECT COUNT(*) as exist FROM mument WHERE music_id=? AND user_id=? AND is_deleted=0 AND is_private=0;';
    }
    else {
        // 자신의 뮤멘트 히스토리 - 비밀글 포함 count
        historyQuery = 'SELECT COUNT(*) as exist FROM mument WHERE music_id=? AND user_id=? AND is_deleted=0;';
    }
    const historyCount = yield pool_1.default.queryValue(historyQuery, [musicId, writerId]);
    return historyCount[0].exist;
});
// 뮤멘트의 태그 검색해서 impressionTag, feelingTag 리스트로 반환
const mumentTagListGet = (mumentId) => __awaiter(void 0, void 0, void 0, function* () {
    // 뮤멘트의 태그 모두 검색
    const query = `SELECT tag_id as exist FROM mument_tag WHERE mument_id=${mumentId};`;
    const tagList = yield pool_1.default.query(query);
    let impressionTag = [], feelingTag = [];
    // 100이상 200미만 - impression tag, 200이상 300미만 - feeling tag
    for (let idx in tagList) {
        if (tagList[idx].exist < 200) {
            impressionTag.push(tagList[idx].exist);
        }
        else if (tagList[idx].exist < 300) {
            feelingTag.push(tagList[idx].exist);
        }
    }
    return {
        impressionTag: impressionTag,
        feelingTag: feelingTag
    };
});
exports.default = {
    mumentTagCreate,
    isExistMument,
    isExistMumentInfo,
    isLiked,
    likeCount,
    mumentHistoryCount,
    mumentTagListGet,
};
//# sourceMappingURL=Mument.js.map