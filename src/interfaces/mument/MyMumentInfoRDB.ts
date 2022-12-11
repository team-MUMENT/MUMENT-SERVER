// RDB에서 mument, music, mument_tag를 JOIN해서 SELECT한 레코드 타입 정의
// 보관함 - 내가 작성한 뮤멘트 리스트에서 사용
export interface MyMumentInfoRDB {
    mument_id: number;
    user_id: number;
    music_id: number;
    is_first: boolean;
    like_count: number;
    is_private: boolean;
    created_at: Date; // 뮤멘트 작성일
    artist: string; // 곡 아티스트
    iamge: string; //곡 이미지
    name: string; //곡 제목
    tag_id: number; //태그 번호
}