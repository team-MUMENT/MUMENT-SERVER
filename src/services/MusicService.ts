import dayjs from 'dayjs';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { MusicMumentListResponseDto } from '../interfaces/music/MusicMumentListResponseDto';

import { MusicMyMumentResponseDto } from '../interfaces/music/MusicMyMumentResponseDto';
import Like from '../models/Like';
import Mument from '../models/Mument';
import Music from '../models/Music';

// 곡 상세보기 - 음악, 나의 뮤멘트 조회
const getMusicAndMyMument = async (musicId: string, userId: string): Promise<MusicMyMumentResponseDto | null> => {
    try {
        // 곡 조회
        const music = await Music.findById(musicId);

        // 음악 조회 결과가 없을 때 404 에러
        if (!music) {
            return null;
        }

        // 가장 최근에 작성한 뮤멘트 조회
        const latestMument = await Mument.findOne({
            'user._id': userId,
            'music._id': musicId,
            isDeleted: false,
        }).sort({
            createdAt: -1,
        });

        // myMument가 null일 경우 return
        if (latestMument === null) {
            const data = {
                music,
                myMument: null,
            };

            return data;
        }

        // 날짜 가공
        const mumentDate = dayjs(latestMument.createdAt).format('D MMM, YYYY');

        // isLiked 조회
        const isLiked = Boolean(
            await Like.findOne({
            user: { _id: userId },
            mument: { _id: latestMument._id },
            }),
        );

        const data = {
            music: music,
            myMument: {
                ...latestMument.toObject(),
                date: mumentDate,
                isLiked: isLiked,
            },
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getMumentList = async(musicId: string, userId: string, isLikeOrder: boolean): Promise<MusicMumentListResponseDto | null> => {    
    try {
        let originalMumentList;

        // mumentList 조회
        switch (isLikeOrder) {
            case true: {
                // 좋아요순 정렬
                originalMumentList = await Mument.find({
                    'music._id': musicId,
                    isDeleted: false,
                }).sort({
                    likeCount: -1,
                });
                break;
            }
            case false: {
                // 최신순 정렬
                originalMumentList = await Mument.find({
                    'music._id': musicId,
                    isDeleted: false,
                }).sort({
                    createdAt: -1,
                });
                break;
            }
        }
        
        // 결과값이 없을 경우
        if (originalMumentList.length === 0) {
            return null;
        }

        // mumentId array 리턴
        const mumentIdList = originalMumentList.map(mument => mument._id);

        // 해당 유저아이디의 document에서 mumentIdList find
        const likeList = await Like.find({
            'user._id': userId,
            'mument._id': { $in: mumentIdList },
        });

        // map 함수 사용을 위해 날짜 가공해주는 함수
        const createDate = (createdAt: Date): string => {
            const date = dayjs(createdAt).format('D MMM, YYYY');
            return date;
        };

        // 최종 리턴될 data
        const data: MusicMumentListResponseDto[] = originalMumentList;
        originalMumentList.reduce((ac, cur, index) => {
            data[index] = {
                ...cur.toObject(),
                date: createDate(cur.createdAt),
                isLiked: Boolean(mumentIdList[index] in likeList),
            };
            return data;
        });

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    getMusicAndMyMument,
    getMumentList,
};
