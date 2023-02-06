// RDB에서 SELECT한 news(공지사항) 레코드 타입 정의
export interface NewsInfoRDB{
    id: number;
    type: string;
    user_id: number;
    is_deleted: boolean;
    is_read: boolean;
    created_at: Date | string;
    link_id: number; // 공지사항 알림: 공지사항 id / 좋아요 알림: 좋아요 눌린 뮤멘트 id
    notice_point_word: string | null; // 공지사항 제목에서 bold 글씨체 처리가 필요한 단어
    notice_title: string | null;
    like_profile_id: string | null;
    like_music_id: string | null;
    like_music_title: string | null;
    like_music_artist: string | null;
    like_music_image: string | null;
}