/* mument 리소스 - 재사용 쿼리 */

// 뮤멘트 태그 삽입 - impressionTag, feelingTag 리스트 합쳐서 처리
const mumentTagCreate = async (impressionTag: number[], feelingTag: number[], connection: any, mumentId: string) => {
    const tagList = impressionTag.concat(feelingTag);

    for(let idx in tagList) {
        const query4 = 'INSERT INTO mument_tag(mument_id, tag_id) VALUES(?, ?);';
        await connection.query(query4, [
            mumentId,
            tagList[idx] // tag 번호
        ]);
    }
};

export default {
    mumentTagCreate,
}