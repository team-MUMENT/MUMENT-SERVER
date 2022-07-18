import dayjs from 'dayjs';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { MusicMumentListResponseDto } from '../interfaces/music/MusicMumentListResponseDto';

import { MusicMyMumentResponseDto } from '../interfaces/music/MusicMyMumentResponseDto';
import { MusicResponseDto } from '../interfaces/music/MusicResponseDto';
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

        // 카드뷰 태그 리스트
        const cardTag: number[] = [];
        const impressionTagLength = latestMument.impressionTag.length;
        const feelingTagLength = latestMument.feelingTag.length;

        if (impressionTagLength >= 1 && feelingTagLength >= 1) {
            cardTag.push(latestMument.impressionTag[0], latestMument.feelingTag[0]);
        } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
            cardTag.push(...latestMument.impressionTag.slice(0, 2));
        } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
            cardTag.push(...latestMument.feelingTag.slice(0, 2));
        }

        const data = {
            music: music,
            myMument: {
                ...latestMument.toObject(),
                cardTag: cardTag,
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

const getMumentList = async (musicId: string, userId: string, isLikeOrder: boolean): Promise<MusicMumentListResponseDto | null> => {
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
        const data: MusicMumentListResponseDto[] = [];
        originalMumentList.reduce((ac, cur, index) => {
            // 카드뷰 태그 리스트
            const cardTag: number[] = [];
            const impressionTagLength = cur.impressionTag.length;
            const feelingTagLength = cur.feelingTag.length;

            if (impressionTagLength >= 1 && feelingTagLength >= 1) {
                cardTag.push(cur.impressionTag[0], cur.feelingTag[0]);
            } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
                cardTag.push(...cur.impressionTag.slice(0, 2));
            } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
                cardTag.push(...cur.feelingTag.slice(0, 2));
            }

            data[index] = {
                ...cur.toObject(),
                cardTag: cardTag,
                date: createDate(cur.createdAt),
                isLiked: Boolean(mumentIdList[index] in likeList),
            };
            return data;
        }, 0);

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getMusicListBySearch = async (keyword: string): Promise<MusicResponseDto[]> => {
    const regex = (pattern: string) => new RegExp(`.*${pattern}.*`);

    try {
        const musicRegex = regex(keyword);

        const musicList = await Music.find({
            $or: [
                {
                    name: { $regex: musicRegex },
                },
                {
                    artist: { $regex: musicRegex },
                },
            ],
        });
        return musicList;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
export default {
    getMusicAndMyMument,
    getMumentList,
    getMusicListBySearch,
};
