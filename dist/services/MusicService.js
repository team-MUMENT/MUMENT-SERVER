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
const axios_1 = __importDefault(require("axios"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
const db_1 = __importDefault(require("../loaders/db"));
const User_1 = __importDefault(require("../modules/db/User"));
const Music_1 = __importDefault(require("../modules/db/Music"));
const cardTagList_1 = __importDefault(require("../modules/cardTagList"));
const config_1 = __importDefault(require("../config"));
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
        const mumentDate = (0, dayjs_1.default)(latestMument[0].created_at).format('D MMM, YYYY');
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
const getMumentList = (musicId, userId, isLikeOrder, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a, e_2, _b;
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
        blockUserResult.forEach(element => {
            blockUserList.push(element.exist);
        });
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
                    AND user.is_deleted = 0
                ORDER BY mument.like_count DESC
                LIMIT ? OFFSET ?;
                `;
                originalMumentList = yield connection.query(getMumentListQuery, [musicId, limit, offset]);
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
                    AND user.is_deleted = 0
                ORDER BY mument.created_at DESC
                LIMIT ? OFFSET ?;
                `;
                originalMumentList = yield connection.query(getMumentListQuery, [musicId, limit, offset]);
            }
        }
        if (originalMumentList.length === 0)
            return null;
        // 태그 조회를 위해 뮤멘트 아이디만 빼오고, 스트링으로 만들어주기
        const mumentIdList = originalMumentList.map((x) => x.id);
        const strMumentIdList = '(' + mumentIdList.join(', ') + ')';
        const tagList = [];
        mumentIdList.forEach((element) => {
            tagList.push({ id: element, impressionTag: [], feelingTag: [], cardTag: [] });
        });
        // 해당 뮤멘트들의 태그 모두 가져오기
        const getAllTagQuery = `
        SELECT mument_id, tag_id
        FROM mument_tag
        WHERE mument_id IN ${strMumentIdList}
            AND is_deleted = 0
        ORDER BY mument_id, updated_at ASC;
        `;
        const getAllTagResult = yield connection.query(getAllTagQuery);
        // impression tag, feeling tag 분류하기
        getAllTagResult.reduce((ac, cur) => {
            const mumentIdx = tagList.findIndex(o => o.id === cur.mument_id);
            if (cur.tag_id < 200) {
                tagList[mumentIdx].impressionTag.push(cur.tag_id);
            }
            else if (cur.tag_id < 300) {
                tagList[mumentIdx].feelingTag.push(cur.tag_id);
            }
            ;
        }, getAllTagResult);
        for (const object of tagList) {
            const allTagList = object.impressionTag.concat(object.feelingTag);
            object.cardTag = yield cardTagList_1.default.cardTag(allTagList);
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (mumentIdList_1_1 && !mumentIdList_1_1.done && (_a = mumentIdList_1.return)) yield _a.call(mumentIdList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const getisLikedQuery = `
        SELECT mument_id as mid, EXISTS(
            SELECT *
            FROM mument.like
            WHERE mument_id = mid
                AND user_id = ?
        ) as is_liked
        FROM mument.like
        WHERE mument_id IN ${strMumentIdList}
        `;
        const getIsLikedResult = yield connection.query(getisLikedQuery, [userId]);
        // 쿼리 결과에 존재하는 경우에만 isLiked를 true로 바꿈
        getIsLikedResult.reduce((ac, cur) => {
            const mumentIdx = isLikedList.findIndex(o => o.mid === cur.mument_id);
            if (mumentIdx != -1)
                isLikedList[mumentIdx].isLiked = true;
        }, getIsLikedResult);
        // string으로 날짜 생성해주는 함수
        const createDate = (createdAt) => {
            const date = (0, dayjs_1.default)(createdAt).format('D MMM, YYYY');
            return date;
        };
        const mumentList = [];
        try {
            for (var originalMumentList_1 = __asyncValues(originalMumentList), originalMumentList_1_1; originalMumentList_1_1 = yield originalMumentList_1.next(), !originalMumentList_1_1.done;) {
                const mument = originalMumentList_1_1.value;
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
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (originalMumentList_1_1 && !originalMumentList_1_1.done && (_b = originalMumentList_1.return)) yield _b.call(originalMumentList_1);
            }
            finally { if (e_2) throw e_2.error; }
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
 * 곡 검색 - apple music api 사용 곡 검색 / 최대 25개의 곡 리스트 반환 가능
 */
const getMusicListBySearch = (keyword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = `Bearer ${config_1.default.appleDeveloperToken}`;
        let musicList = [];
        const appleResponse = (searchKeyword) => __awaiter(void 0, void 0, void 0, function* () {
            yield axios_1.default.get('https://api.music.apple.com/v1/catalog/kr/search?types=songs&limit=20&term='
                + encodeURI(searchKeyword), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': token
                }
            })
                .then(function (response) {
                return __awaiter(this, void 0, void 0, function* () {
                    /* apple api에서 받을 수 있는 3개 status code 대응 - 200, 401, 500*/
                    if (response.data.results.hasOwnProperty('songs')) {
                        // 401 - A response indicating an incorrect Authorization header
                        if (response.status == 401)
                            return serviceReturnConstant_1.default.APPLE_UNAUTHORIZED;
                        // 500 - indicating an error occurred on the apple music server
                        if (response.status == 500)
                            return serviceReturnConstant_1.default.APPLE_INTERNAL_SERVER_ERROR;
                        const appleMusicList = response.data.results.songs.data;
                        musicList = yield appleMusicList.map((music) => {
                            let imageUrl = music.attributes.artwork.url;
                            imageUrl = imageUrl.replace('{w}x{h}', '400x400'); //앨범 이미지 크기 400으로 지정
                            const result = {
                                '_id': music.id,
                                'name': music.attributes.name,
                                'artist': music.attributes.artistName,
                                'image': imageUrl
                            };
                            return result;
                        });
                    }
                    return musicList;
                });
            })
                .catch(function (error) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('곡검색 애플 error', error);
                    return serviceReturnConstant_1.default.APPLE_INTERNAL_SERVER_ERROR;
                });
            });
            return musicList;
        });
        const data = yield appleResponse(keyword);
        return data;
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