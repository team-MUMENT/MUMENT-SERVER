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
            ...(await Like.find({
                user: { _id: userId },
                mument: { _id: latestMument._id },
            })),
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
        // 있는 곡인지 조회
        const music = await Music.findById(musicId);
        if (!music) return null;

        let originalMumentList: MumentInfo [];

        switch (isLikeOrder) {
            case (true): {
                // 좋아요순 정렬
                originalMumentList = await Mument.find({
                   'music._id': musicId,
                   isDeleted: false, 
                }).sort({
                    'likeCount': -1
                });
            }
            case (false): {
                // 최신순 정렬
                originalMumentList = await Mument.find({
                    'music._id': musicId,
                    isDeleted: false,
                }).sort({
                    'createdAt': -1
                });
            }

            const createDate = (createdAt: string): string => {
                const date = dayjs(createdAt).format('D MMM, YYYY');
                return date;
            };

            const getIsLiked = (mumentId: string, userId: string) 

            function 

            const mumentList: MusicMumentListResponseDto[] = originalMumentList.map(()

            )
        }


    }
}

export default {
    getMusicAndMyMument,
    getMumentList,
};
