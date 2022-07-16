import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import Mument from '../models/Mument';
import User from '../models/User';
import Music from '../models/Music';
import dayjs from 'dayjs';
import Like from '../models/Like';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { LikeInfo } from '../interfaces/like/LikeInfo';

const getMyMumentList = async (userId: string): Promise<UserMumentListResponseDto | null> => {
    try {
        const myMumentList = await Mument.find({
            $and: [
                {
                    'user._id': { $eq: userId },
                },
                {
                    isDeleted: { $eq: false },
                },
            ],
        }).sort({ createdAt: -1 });

        if (!myMumentList) {
            return {
                muments: [],
            };
        }

        const data = await Promise.all(
            myMumentList.map(async (mument: any) => {
                const music = await Music.findById(mument.music._id);

                const isLiked = await Like.findOne({
                    $and: [
                        {
                            mument: { $elemMatch: { _id: mument._id } },
                        },
                        {
                            'user._id': { $eq: userId },
                        },
                    ],
                });

                const result: MumentResponseDto = {
                    _id: mument._id,
                    user: {
                        _id: mument.user._id,
                        image: mument.user.image,
                        name: mument.user.name,
                    },
                    music: {
                        _id: !music ? null : music._id,
                        name: !music ? 'nonexistence' : music.name,
                        artist: !music ? 'onexistence' : music.artist,
                        image: !music ? 'nonexistence' : music.image,
                    },
                    isFirst: mument.isFirst,
                    impressionTag: mument.impressionTag,
                    feelingTag: mument.feelingTag,
                    content: mument.content,
                    isPrivate: mument.isPrivate,
                    likeCount: mument.likeCount,
                    isLiked: !isLiked ? false : true,
                    createdAt: dayjs(mument.createdAt).format('D MMM, YYYY'),
                    year: Number(dayjs(mument.createdAt).format('YYYY')),
                    month: Number(dayjs(mument.createdAt).format('M')),
                };

                return result;
            }),
        );

        return {
            muments: data,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getLikeMumentList = async (userId: string): Promise<UserMumentListResponseDto | null> => {
    try {
        const myMumentList: LikeInfo | null = await Like.findOne({
            'user._id': userId,
        });

        // 좋아요 기록이 없다고 판단할 수 있는 케이스 두 가지 처리
        if (!myMumentList || (myMumentList && myMumentList.mument.length === 0)) {
            return {
                muments: [],
            };
        }

        myMumentList.mument.sort((a, b) => {
            return +new Date(a.createdAt) - +new Date(b.createdAt);
        });

        const data = await Promise.all(
            myMumentList.mument.map((mument: any) => {

                const result: MumentResponseDto = {
                    _id: mument._id,
                    user: {
                        _id: mument.user._id,
                        image: mument.user.image,
                        name: mument.user.name,
                    },
                    music: {
                        _id: mument.music._id,
                        name: mument.music.name,
                        artist: mument.music.artist,
                        image: mument.music.image,
                    },
                    isFirst: mument.isFirst,
                    impressionTag: mument.impressionTag,
                    feelingTag: mument.feelingTag,
                    content: mument.content,
                    isPrivate: mument.isPrivate,
                    likeCount: 0, //쓰이지 않음
                    isLiked: true,
                    createdAt: dayjs(mument.createdAt).format('D MMM, YYYY'),
                    year: Number(dayjs(mument.createdAt).format('YYYY')),
                    month: Number(dayjs(mument.createdAt).format('M')),
                };

                return result;
            }),
        );

        return {
            muments: data,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    getMyMumentList,
    getLikeMumentList,
};
