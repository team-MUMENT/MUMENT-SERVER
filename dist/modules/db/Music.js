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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * mument 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */
// 뮤멘트 기록하기에서 db에 없는 음악이면 음악 정보 db에 추가할 때 사용
const SearchAndCreateMusic = (mumentCreateDto, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const searchQuery = 'SELECT * FROM music WHERE id=?';
    const music = yield connection.query(searchQuery, [mumentCreateDto.musicId]);
    // 존재하지 않는 음악일 시 insert
    if (music.length === 0) {
        const createQuery = 'INSERT INTO music(id, artist, image, name) VALUES(?, ?, ?, ?)';
        yield connection.query(createQuery, [
            mumentCreateDto.musicId, mumentCreateDto.musicArtist,
            mumentCreateDto.musicImage, mumentCreateDto.musicName
        ]);
    }
});
// 음악 검색하기
const searchMusic = (musicId) => {
    const searchQuery = `
    SELECT *
    FROM music
    WHERE id = ${musicId};
    `;
    return searchQuery;
};
exports.default = {
    SearchAndCreateMusic,
    SearchMusic: searchMusic
};
//# sourceMappingURL=Music.js.map