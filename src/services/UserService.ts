import dayjs from 'dayjs';
import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { UserResponseDto } from '../interfaces/user/UserResponseDto';
import { LikeInfo } from '../interfaces/like/LikeInfo';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { UserInfo } from '../interfaces/user/UserInfo';
import Mument from '../models/Mument';
import Music from '../models/Music';
import Like from '../models/Like';
import User from '../models/User';
import constant from '../modules/serviceReturnConstant';

const getMyMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
        let myMumentList: MumentInfo[] = await Mument.find({
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

        // 필터링 태그 존재시 뮤멘트 필터링
        if (tagList.length > 0) {
            myMumentList = myMumentList.filter(mument => {
                const mumentTagList = mument.impressionTag.concat(mument.feelingTag);

                return tagList.every(tag => {
                    return mumentTagList.includes(tag);
                });
            });
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

                // 카드뷰 태그 리스트
                const cardTag: number[] = [];
                const impressionTagLength = mument.impressionTag.length;
                const feelingTagLength = mument.feelingTag.length;

                if (impressionTagLength >= 1 && feelingTagLength >= 1) {
                    cardTag.push(mument.impressionTag[0], mument.feelingTag[0]);
                } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
                    cardTag.push(...mument.impressionTag.slice(0, 2));
                } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
                    cardTag.push(...mument.feelingTag.slice(0, 2));
                }

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
                        artist: !music ? 'nonexistence' : music.artist,
                        image: !music ? 'nonexistence' : music.image,
                    },
                    isFirst: mument.isFirst,
                    impressionTag: mument.impressionTag,
                    feelingTag: mument.feelingTag,
                    cardTag: cardTag,
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

const getLikeMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
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
            return +new Date(b.createdAt) - +new Date(a.createdAt);
        });

        // 필터링 태그 존재시 뮤멘트 필터링
        if (tagList.length > 0) {
            myMumentList.mument = myMumentList.mument.filter(mument => {
                const mumentTagList = mument.impressionTag.concat(mument.feelingTag);

                return tagList.every(tag => {
                    return mumentTagList.includes(tag);
                });
            });
        }

        const data = await Promise.all(
            myMumentList.mument.map((mument: any) => {
                // 카드뷰 태그 리스트
                const cardTag: number[] = [];
                const impressionTagLength = mument.impressionTag.length;
                const feelingTagLength = mument.feelingTag.length;

                if (impressionTagLength >= 1 && feelingTagLength >= 1) {
                    cardTag.push(mument.impressionTag[0], mument.feelingTag[0]);
                } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
                    cardTag.push(...mument.impressionTag.slice(0, 2));
                } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
                    cardTag.push(...mument.feelingTag.slice(0, 2));
                }

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
                    cardTag: cardTag,
                    content: mument.content,
                    likeCount: mument.likeCount,
                    isPrivate: mument.isPrivate,
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

const login = async (profileId: string, password: string): Promise<UserResponseDto | number> => {
    try {
        // 프로필 아이디로 다큐멘트 조회
        const user: UserInfo | null = await User.findOne({
            profileId: profileId,
        });

        // 프로필 아이디가 존재하지 않으면 NO_USER 리턴
        if (!user) {
            return constant.NO_USER;
        }

        // 비밀번호 검증
        const isMatch = !!(password === user.password);

        // 비밀번호 틀렸을 경우
        if (!isMatch) {
            return constant.WRONG_PASSWORD;
        }

        const data: UserResponseDto = {
            id: user._id,
            profileId: user.profileId,
            name: user.name,
            image: user.image,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    getMyMumentList,
    getLikeMumentList,
    login,
};
