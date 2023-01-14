import { MumentCreateDto } from "../../interfaces/mument/MumentCreateDto";

/**
 * mument 관련 재사용 쿼리 - 트랜잭션 쓸 때 사용가능
 */


// 뮤멘트 기록하기에서 db에 없는 음악이면 음악 정보 db에 추가할 때 사용
const SearchAndCreateMusic = async (mumentCreateDto: MumentCreateDto, connection: any) => {
    const searchQuery = 'SELECT * FROM music WHERE id=?';

    const music = await connection.query(searchQuery, [mumentCreateDto.musicId]);

    // 존재하지 않는 음악일 시 insert
    if (music.length === 0) {
        const createQuery = 'INSERT INTO music(id, artist, image, name) VALUES(?, ?, ?, ?)';

        const createdMusic = await connection.query(createQuery, [
            mumentCreateDto.musicId, mumentCreateDto.musicArtist, 
            mumentCreateDto.musicImage, mumentCreateDto.musicName
        ]);
    }
}

// 음악 검색하기
const searchMusic = (musicId: string) => {
    const searchQuery = `
    SELECT *
    FROM music
    WHERE id = ${musicId};
    `;

    return searchQuery;
}

export default {
    SearchAndCreateMusic,
    SearchMusic: searchMusic
}