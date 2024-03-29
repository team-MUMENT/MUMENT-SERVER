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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const serviceReturnConstant_1 = __importDefault(require("../modules/serviceReturnConstant"));
// Apple Music Api 곡 검색 최대 50개 가져오기
const searchMusic = (searchKeyword, limit, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const token = `Bearer ${config_1.default.appleDeveloperToken}`;
    let musicList = [];
    yield axios_1.default.get(`https://api.music.apple.com/v1/catalog/kr/search?types=songs&limit=${limit}&offset=${offset}&term=`
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
                //if (response.status == 401 || response.status == 500) return constant.APPLE_UNAUTHORIZED;
                if (response.status == 401 || response.status == 500)
                    return;
                const appleMusicList = response.data.results.songs.data;
                musicList = yield appleMusicList
                    .map((music) => {
                    let imageUrl = music.attributes.artwork.url;
                    imageUrl = imageUrl.replace('{w}x{h}', '400x400'); //앨범 이미지 크기 400으로 지정
                    // 연령제한 거르기
                    if (music.attributes.hasOwnProperty('contentRating') && music.attributes.contentRating == 'explicit')
                        return;
                    const result = {
                        '_id': music.id,
                        'name': music.attributes.name,
                        'artist': music.attributes.artistName,
                        'image': imageUrl
                    };
                    return result;
                });
            }
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
exports.default = {
    searchMusic,
};
//# sourceMappingURL=appleMusicSearch.js.map