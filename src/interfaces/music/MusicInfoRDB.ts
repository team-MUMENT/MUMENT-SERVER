// RDB에서 SELECT한 music 레코드 타입 정의
export interface MusicInfoRDB {
    id: number;
    artist: string;
    image: string;
    name: string;
}
