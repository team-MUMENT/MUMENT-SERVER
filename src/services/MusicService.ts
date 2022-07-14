import dayjs from 'dayjs';

import { MyMumentResponseDto } from '../interfaces/mument/MyMumentResponseDto';
import Like from '../models/Like';
import Mument from '../models/Mument';
import Music from '../models/Music';

// 곡 상세보기 - 음악, 나의 뮤멘트 조회
const getMusicAndMyMument = async (musicId: string, userId: string): Promise<MyMumentResponseDto | null> => {
    try {
        // 곡 조회
        const music = await Music.findById(musicId);
        
        // 테스트 후 console.log 코드삭제
        console.log('music: ', music);

        // 음악 조회 결과가 없을 때 404 에러
        if (!music) {
            return null;
        };

        // 가장 최근에 작성한 뮤멘트 조회
        const latestMument = await Mument.findOne({
            'user._id': userId,
            'music._id': musicId,
        }).sort({
            createdAt: -1
        });
        
        // 테스트 후 console.log 삭제
        console.log('latest mument: ', latestMument);        

        // myMument가 null일 경우 return
        if (latestMument === null) { 
            const data = {
                music,
                myMument: null,
            };

            return data; 
        };

        // 날짜 가공
        const mumentDate = dayjs(latestMument.createdAt).format('D MMM, YYYY');
        
        // isLiked 조회
        const isLiked = Boolean(
            ...await Like.find({
                user: { _id: userId },
                mument: { _id: latestMument._id },
            })
        );

        const data = {
            music: music,
            myMument: {
                ...latestMument._doc, // 수정 필요
                date: mumentDate,
                isLiked: isLiked,
            }
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    getMusicAndMyMument,
};
