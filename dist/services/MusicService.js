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
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const db_1 = __importDefault(require("../loaders/db"));
const User_1 = __importDefault(require("../modules/db/User"));
const Music_1 = __importDefault(require("../modules/db/Music"));
const Mument_1 = __importDefault(require("../modules/db/Mument"));
const cardTagList_1 = __importDefault(require("../modules/cardTagList"));
const common_1 = __importDefault(require("../modules/common"));
const appleMusicSearch_1 = __importDefault(require("../library/appleMusicSearch"));
const qs = require('querystring');
require('dotenv').config();
/**
 * 곡 상세보기 - 음악, 나의 뮤멘트 조회
 */
const getMusicAndMyMument = (musicId, userId, musicCreateDto) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        // 우리 DB에 음악 존재안하면 새로 삽입
        yield Music_1.default.SearchAndCreateMusic(musicCreateDto, connection);
        // 우리 DB에서 검색
        const music = yield connection.query(Music_1.default.SearchMusic(musicId));
        if (music.length === 0)
            return serviceReturnConstant_1.default.NO_MUSIC;
        // 가장 최근에 작성한 뮤멘트 조회
        const getLatestMumentQuery = `
        SELECT mument.*, user.profile_id as user_name, user.image as user_image
        FROM mument
        JOIN user
            ON mument.user_id = user.id
        WHERE mument.music_id = ?
            AND mument.user_id =?
            AND mument.is_deleted = 0
        ORDER BY mument.created_at DESC
        LIMIT 1;
        `;
        const latestMument = yield connection.query(getLatestMumentQuery, [musicId, userId]);
        // myMument가 null일 경우 return
        if (latestMument.length === 0) {
            const data = {
                music: {
                    _id: music[0].id.toString(),
                    name: music[0].name,
                    artist: music[0].artist,
                    image: music[0].image,
                },
                myMument: null,
            };
            return data;
        }
        ;
        // 뮤멘트의 태그 전부 가져오기
        const getTagQuery = `
        SELECT tag_id
        FROM mument_tag
        WHERE mument_id = ?
            AND is_deleted = 0;
        `;
        const getTagResult = yield connection.query(getTagQuery, [latestMument[0].id]);
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
        ;
        const mumentCardTag = yield cardTagList_1.default.cardTag(tagList);
        const getIsLikedQuery = `
        SELECT EXISTS (
            SELECT *
            FROM mument.like
            WHERE mument_id = ?
                AND user_id = ?
        ) as is_liked;
        `;
        const isLikedResult = yield connection.query(getIsLikedQuery, [latestMument[0].id, userId]);
        const isLiked = Boolean(isLikedResult[0].is_liked);
        // 날짜 가공
        const mumentDate = (0, dayjs_1.default)(latestMument[0].created_at).format('YYYY.MM.DD');
        const myMument = {
            _id: latestMument[0].id,
            music: {
                _id: latestMument[0].music_id.toString(),
            },
            user: {
                _id: latestMument[0].user_id,
                name: latestMument[0].user_name,
                image: latestMument[0].user_image,
            },
            isFirst: Boolean(latestMument[0].is_first),
            impressionTag,
            feelingTag,
            cardTag: mumentCardTag,
            content: latestMument[0].content,
            isPrivate: Boolean(latestMument[0].is_private),
            likeCount: latestMument[0].like_count,
            isDeleted: Boolean(latestMument[0].is_deleted),
            createdAt: latestMument[0].created_at,
            updatedAt: latestMument[0].updated_at,
            date: mumentDate,
            isLiked
        };
        const data = {
            music: {
                _id: music[0].id.toString(),
                name: music[0].name,
                artist: music[0].artist,
                image: music[0].image,
            },
            myMument
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
 * 곡 상세보기 - 모든 뮤멘트 조회
 */
const getMumentList = (musicId, userId, isLikeOrder) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a, e_2, _b, e_3, _c;
    const pool = yield db_1.default;
    const connection = yield pool.getConnection();
    try {
        const music = yield connection.query(Music_1.default.SearchMusic(musicId));
        if (music.length === 0)
            return serviceReturnConstant_1.default.NO_MUSIC;
        // 자신이 차단한, 자신을 차단한 유저 리스트
        const blockUserList = [];
        // 자신이 차단한 유저 반환
        const blockUserResult = yield User_1.default.blockedUserList(userId);
        try {
            for (var blockUserResult_1 = __asyncValues(blockUserResult), blockUserResult_1_1; blockUserResult_1_1 = yield blockUserResult_1.next(), !blockUserResult_1_1.done;) {
                let element = blockUserResult_1_1.value;
                blockUserList.push(element.exist);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (blockUserResult_1_1 && !blockUserResult_1_1.done && (_a = blockUserResult_1.return)) yield _a.call(blockUserResult_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        let strBlockUserList = '( 0 )';
        if (blockUserResult.length != 0) {
            strBlockUserList = '(' + blockUserList.toString() + ')';
        }
        let originalMumentList = [];
        switch (isLikeOrder) {
            case true: { // 좋아요순 정렬
                const getMumentListQuery = `
                SELECT mument.*, user.profile_id as user_name, user.image as user_image
                FROM mument
                JOIN user
                    ON mument.user_id = user.id
                WHERE mument.music_id = ?
                    AND mument.user_id NOT IN ${strBlockUserList}
                    AND mument.is_deleted = 0  
                    AND (is_private = 0 OR (user.id = ? AND is_private = 1))
                ORDER BY mument.like_count DESC;
                `;
                originalMumentList = yield connection.query(getMumentListQuery, [musicId, userId]);
                break;
            }
            case false: { // 최신순 정렬
                const getMumentListQuery = `
                SELECT mument.*, user.profile_id as user_name, user.image as user_image
                FROM mument
                JOIN user
                    ON mument.user_id = user.id
                WHERE mument.music_id = ?
                    AND mument.user_id NOT IN ${strBlockUserList}
                    AND mument.is_deleted = 0  
                    AND (is_private = 0 OR (user.id = ? AND is_private = 1))
                ORDER BY mument.created_at DESC;
                `;
                originalMumentList = yield connection.query(getMumentListQuery, [musicId, userId]);
                break;
            }
        }
        if (originalMumentList.length === 0)
            return null;
        // 태그 조회를 위해 뮤멘트 아이디만 빼오고, 스트링으로 만들어주기
        const mumentIdList = yield common_1.default.mumentIdFilter(originalMumentList);
        let tagList = yield common_1.default.insertMumentIdIntoTagList(mumentIdList);
        // 해당 뮤멘트들의 태그 모두 가져오기
        const strMumentIdList = '(' + mumentIdList.join(', ') + ')';
        const getAllTagResult = yield Mument_1.default.getAllTag(strMumentIdList, connection);
        // impression tag, feeling tag 분류하기
        yield cardTagList_1.default.allTagResultTagClassification(getAllTagResult, tagList);
        try {
            for (var tagList_1 = __asyncValues(tagList), tagList_1_1; tagList_1_1 = yield tagList_1.next(), !tagList_1_1.done;) {
                const object = tagList_1_1.value;
                const allTagList = object.impressionTag.concat(object.feelingTag);
                object.cardTag = yield cardTagList_1.default.cardTag(allTagList);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tagList_1_1 && !tagList_1_1.done && (_b = tagList_1.return)) yield _b.call(tagList_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        ;
        // 뮤멘트 id와 isLiked를 담을 리스트 생성
        const isLikedList = [];
        try {
            for (var mumentIdList_1 = __asyncValues(mumentIdList), mumentIdList_1_1; mumentIdList_1_1 = yield mumentIdList_1.next(), !mumentIdList_1_1.done;) {
                let element = mumentIdList_1_1.value;
                isLikedList.push({ mid: element, isLiked: false });
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (mumentIdList_1_1 && !mumentIdList_1_1.done && (_c = mumentIdList_1.return)) yield _c.call(mumentIdList_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // 좋아요 여부 확인
        const getisLikedQuery = `
        SELECT mument_id as mid
            FROM mument.like
            WHERE mument_id IN ${strMumentIdList} AND user_id = ?;
        `;
        // 쿼리 결과에 존재하는 경우에만 isLiked를 true로 바꿈
        const getIsLikedResult = yield connection.query(getisLikedQuery, [userId]);
        const isLikedListFormat = (item, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const mumentIdx = isLikedList.findIndex(o => o.mid === item.mid);
            if (mumentIdx != -1)
                isLikedList[mumentIdx].isLiked = true;
        });
        yield getIsLikedResult.reduce((acc, curr, index) => __awaiter(void 0, void 0, void 0, function* () {
            return acc.then(() => isLikedListFormat(curr, index));
        }), Promise.resolve());
        // string으로 날짜 생성해주는 함수
        const createDate = (createdAt) => {
            const date = (0, dayjs_1.default)(createdAt).format('YYYY.MM.DD');
            return date;
        };
        const mumentList = [];
        for (const mument of originalMumentList) {
            mumentList.push({
                _id: mument.id,
                musicId: mument.music_id.toString(),
                user: {
                    _id: mument.user_id,
                    name: mument.user_name,
                    image: mument.user_image,
                },
                isFirst: Boolean(mument.is_first),
                impressionTag: tagList[tagList.findIndex(o => o.id == mument.id)].impressionTag,
                feelingTag: tagList[tagList.findIndex(o => o.id == mument.id)].feelingTag,
                cardTag: tagList[tagList.findIndex(o => o.id == mument.id)].cardTag,
                content: mument.content,
                isPrivate: Boolean(mument.is_private),
                likeCount: mument.like_count,
                isDeleted: Boolean(mument.is_deleted),
                createdAt: mument.created_at,
                updatedAt: mument.updated_at,
                date: createDate(mument.created_at),
                isLiked: Boolean(isLikedList[isLikedList.findIndex(o => o.mid == mument.id)].isLiked),
            });
        }
        ;
        const data = {
            mumentList,
        };
        return data;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
    finally {
        connection.release();
    }
});
/**
 * 곡 검색 - apple music api 사용 곡 검색 / 최대 50개까지 곡 리스트 반환 가능
 */
const getMusicListBySearch = (keyword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 곡 검색 첫 페이지 개수가 25개 이상일 경우만 검색 2회 요청
        const page1 = yield appleMusicSearch_1.default.searchMusic(keyword, 0);
        if (page1.length < 25)
            return page1;
        const page2 = yield appleMusicSearch_1.default.searchMusic(keyword, 25);
        return page1.concat(page2);
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
exports.default = {
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
//# sourceMappingURL=MusicService.js.map