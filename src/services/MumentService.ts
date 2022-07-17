import { MusicInfo } from '../interfaces/music/MusicInfo';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { MumentCardViewInterface } from '../interfaces/mument/MumentCardViewInterface';
import { PostBaseResponseDto } from '../interfaces/common/PostBaseResponseDto';
import { MumentCreateDto } from '../interfaces/mument/MumentCreateDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { MumentHistoryResponseDto } from '../interfaces/mument/MumentHistoryResponseDto';
import Mument from '../models/Mument';
import Music from '../models/Music';
import User from '../models/User';
import Like from '../models/Like';
import dayjs from 'dayjs';
import { IsFirstResponseDto } from '../interfaces/mument/IsFirstResponseDto';

const createMument = async (userId: string, musicId: string, mumentCreateDto: MumentCreateDto): Promise<PostBaseResponseDto | null> => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const music = await Music.findById(musicId);
        if (!music) return null;

        const mument = new Mument({
            music: {
                _id: musicId,
            },
            user: {
                _id: userId,
                name: user.name,
                image: user.image,
            },
            isFirst: mumentCreateDto.isFirst,
            impressionTag: mumentCreateDto.impressionTag,
            feelingTag: mumentCreateDto.feelingTag,
            content: mumentCreateDto.content ? mumentCreateDto.content : null,
            isPrivate: mumentCreateDto.isPrivate,
        });

        await mument.save();

        const data = {
            _id: mument._id,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getMument = async (mumentId: string, userId: string): Promise<MumentResponseDto | null | true> => {
    try {
        const mument = await Mument.findById(mumentId);
        if (!mument) return null;

        const loginUser = await User.findById(userId);
        if (!loginUser) return null;

        if (mument.user._id.toString() !== userId) return true;

        const music = await Music.findById(mument.music._id);
        if (!music) return null;

        const isLiked = await Like.findOne({
            $and: [
                {
                    mument: { $elemMatch: { _id: mumentId } },
                },
                {
                    'user._id': { $eq: userId },
                },
            ],
        });

        const historyCount = await Mument.countDocuments({
            $and: [
                {
                    'music._id': { $eq: mument.music._id },
                },
                {
                    'user._id': { $eq: mument.user._id },
                },
            ],
        });

        const createdTime = dayjs(mument.createdAt).format('YYYY.MM.DD h:mm A');

        const data: MumentResponseDto = {
            user: {
                _id: mument.user._id,
                image: mument.user.image,
                name: mument.user.name,
            },
            music: {
                _id: mument.music._id,
                name: music.name,
                artist: music.artist,
                image: music.image,
            },
            isFirst: mument.isFirst,
            impressionTag: mument.impressionTag,
            feelingTag: mument.feelingTag,
            content: mument.content,
            likeCount: mument.likeCount,
            isLiked: !isLiked ? false : true,
            createdAt: createdTime,
            count: historyCount,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getIsFirst = async (userId: string, musicId: string): Promise<IsFirstResponseDto | null> => {
    try {
        const music = await Music.findById(musicId);
        if (!music) return null;

        const userMument = await Mument.findOne({
            $and: [
                {
                    'user._id': { $eq: userId },
                },
                {
                    'music._id': { $eq: musicId },
                },
                {
                    isDeleted: { $eq: false },
                },
            ],
        });

        if (!userMument) {
            return {
                isFirst: true,
            };
        } else {
            return {
                isFirst: false,
            };
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getMumentHistory = async (userId: string, musicId: string, isLatestOrder:boolean ): Promise<MumentHistoryResponseDto | null> => {
    try {
        // 음악 정보 조회
        const music: MusicInfo | null = await Music.findById(musicId);

        // 음악이 존재하지 않으면 null 리턴
        if (!music) {
            return null;
        }

        let originalMumentList: MumentInfo[];

        // 해당 유저가 쓴 뮤멘트 전부 조회
        switch (isLatestOrder) {
            case true: {
                // 최신순 정렬
                originalMumentList = await Mument.find({
                    'user._id': userId,
                    'music._id': musicId,
                    isDeleted: false,
                }).sort({
                    createdAt: -1,
                });
                break;
            }
            case false: {
                // 오래된순 정렬
                originalMumentList = await Mument.find({
                    'user._id': userId,
                    'music._id': musicId,
                    isDeleted: false,
                }).sort({
                    createdAt: 1,
                });
                break;
            }
        }

        // 결과값이 없을 경우
        if (originalMumentList.length === 0) {
            const data: MumentHistoryResponseDto = {
                music,
                mumentHistory: [],
            };

            return data;
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
        const mumentHistory: MumentCardViewInterface[] = [];
        originalMumentList.reduce((ac, cur, index) => {
            mumentHistory[index] = {
                ...cur.toObject(),
                date: createDate(cur.createdAt),
                isLiked: Boolean(mumentIdList[index] in likeList),
            };
            return mumentHistory;
        });

        const data: MumentHistoryResponseDto = {
            music,
            mumentHistory,
        };

        return data;

    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    createMument,
    getMument,
    getIsFirst,
    getMumentHistory,
};
