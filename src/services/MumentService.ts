import dayjs from 'dayjs';
import constant from '../modules/serviceReturnConstant';
import { MusicInfo } from '../interfaces/music/MusicInfo';
import { PostBaseResponseDto } from '../interfaces/common/PostBaseResponseDto';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { MumentCardViewInterface } from '../interfaces/mument/MumentCardViewInterface';
import { MumentCreateDto } from '../interfaces/mument/MumentCreateDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { IsFirstResponseDto } from '../interfaces/mument/IsFirstResponseDto';
import { MumentHistoryResponseDto } from '../interfaces/mument/MumentHistoryResponseDto';
import { LikeCountResponeDto } from '../interfaces/like/LikeCountResponseDto';
import { LikeMumentInfo } from '../interfaces/like/LikeInfo';
import Mument from '../models/Mument';
import Music from '../models/Music';
import User from '../models/User';
import Like from '../models/Like';

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

const updateMument = async (mumentId: string, mumentUpdateDto: MumentCreateDto): Promise<PostBaseResponseDto | null> => {
    try {
        const mument = await Mument.findById(mumentId);
        if (!mument) return null;

        const data = {
            _id: mument._id,
        };

        // 공개글에서 비밀글로 수정한 경우
        if (mumentUpdateDto.isPrivate !== undefined) {
            if (mument.isPrivate === false && mumentUpdateDto.isPrivate === true) {
                await Mument.findByIdAndUpdate(mumentId, {
                    $set: {
                        isFirst: mumentUpdateDto.isFirst,
                        impressionTag: mumentUpdateDto.impressionTag,
                        feelingTag: mumentUpdateDto.feelingTag,
                        content: mumentUpdateDto.content ? mumentUpdateDto.content : null,
                        isPrivate: mumentUpdateDto.isPrivate ? mumentUpdateDto.isPrivate : false,
                        likeCount: 0, // 좋아요 수 초기화
                    },
                });

                //모든 유저의 Like에서 뮤멘트 제거 - 좋아요 삭제
                await Like.updateMany(
                    {},
                    {
                        $pull: { mument: { _id: mumentId } },
                    },
                );

                return data;
            }
        }

        //뮤멘트 업데이트
        await Mument.findByIdAndUpdate(mumentId, {
            $set: {
                isFirst: mumentUpdateDto.isFirst,
                impressionTag: mumentUpdateDto.impressionTag,
                feelingTag: mumentUpdateDto.feelingTag,
                content: mumentUpdateDto.content != undefined ? mumentUpdateDto.content : null,
                isPrivate: mumentUpdateDto.isPrivate != undefined ? mumentUpdateDto.isPrivate : false,
            },
        });

        //모든 유저의 뮤멘트 업데이트
        await Like.updateMany(
            { mument: { $elemMatch: { _id: mumentId } } },
            {
                $set: {
                    'mument.$.isFirst': mumentUpdateDto.isFirst,
                    'mument.$.impressionTag': mumentUpdateDto.impressionTag,
                    'mument.$.feelingTag': mumentUpdateDto.feelingTag,
                    'mument.$.content': mumentUpdateDto.content != undefined ? mumentUpdateDto.content : null,
                    'mument.$.isPrivate': mumentUpdateDto.isPrivate != undefined ? mumentUpdateDto.isPrivate : false,
                },
            },
        );

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

const deleteMument = async (mumentId: string): Promise<void | null> => {
    try {
        //Mument soft delete
        await Mument.findByIdAndUpdate(mumentId, {
            $set: {
                isDeleted: true,
            },
        });

        //Like에서 Mument 제거
        await Like.updateMany(
            {},
            {
                $pull: { mument: { _id: mumentId } },
            },
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getIsFirst = async (userId: string, musicId: string): Promise<IsFirstResponseDto | null> => {
    try {
        const music = await Music.findById(musicId);
        if (!music) return null;

        const userMument = await Mument.find({
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

        if (userMument.length === 0) {
            // 뮤멘트 기록이 처음인 경우
            return {
                isFirst: true,
                firstAvailable: true,
            };
        } else {
            const firstMument = userMument.some((mument: MumentInfo) => {
                return mument.isFirst === true;
            });

            if (firstMument === false) {
                // 처음 들었어요 기록이 존재하지않는 경우 - 처음 선택 가능
                return {
                    isFirst: false,
                    firstAvailable: true,
                };
            } else {
                // 처음 들었어요 기록이 존재하지않는 경우 - 처음 선택 불가
                return {
                    isFirst: false,
                    firstAvailable: false,
                };
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getMumentHistory = async (userId: string, musicId: string, isLatestOrder: boolean): Promise<MumentHistoryResponseDto | null> => {
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

            mumentHistory[index] = {
                ...cur.toObject(),
                cardTag: cardTag,
                date: createDate(cur.createdAt),
                isLiked: Boolean(mumentIdList[index] in likeList),
            };
            return mumentHistory;
        }, 0);

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

// 좋아요 등록
const createLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    try {
        // 해당 뮤멘트의 likeCount를 +1 해주고, 업데이트 이후의 값을 리턴
        const updatedMument = await Mument.findOneAndUpdate({ _id: mumentId }, { $inc: { likeCount: +1 } }, { returnDocument: 'after' });

        // 업데이트에 문제가 생겼을 경우 return null
        if (!updatedMument) {
            return null;
        }

        // like 콜렉션에 추가하기 위해 music 정보 조회
        const music = await Music.findById(updatedMument.music._id);

        // music 정보가 없으면 return NO_MUSIC
        if (!music) {
            return constant.NO_MUSIC;
        }

        // like 콜렉션에 추가할 뮤멘트
        const likedMument: LikeMumentInfo = {
            _id: updatedMument._id,
            user: {
                _id: updatedMument.user._id,
                name: updatedMument.user.name,
                image: updatedMument.user.image,
            },
            music: {
                name: music.name,
                artist: music.artist,
                image: music.image,
            },
            isFirst: updatedMument.isFirst,
            impressionTag: updatedMument.impressionTag,
            feelingTag: updatedMument.feelingTag,
            content: updatedMument.content,
            isPrivate: updatedMument.isPrivate,
            createdAt: updatedMument.createdAt,
        };

        // like 콜렉션에 해당 뮤멘트 추가
        await Like.updateOne({ 'user._id': userId }, { $push: { mument: likedMument } }, { upsert: true });

        // 리턴 데이터
        const data: LikeCountResponeDto = {
            mumentId: updatedMument._id,
            likeCount: updatedMument.likeCount,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 좋아요 취소
const deleteLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    try {
        // 해당 뮤멘트의 likeCount를 -1 해주고, 업데이트 이후의 값을 리턴
        const updatedMument = await Mument.findOneAndUpdate({ _id: mumentId }, { $inc: { likeCount: -1 } }, { returnDocument: 'after' });

        // 업데이트에 문제가 생겼을 경우 return null
        if (!updatedMument) {
            return null;
        }

        // like collection에서 해당 뮤멘트 삭제
        await Like.updateOne({ 'user._id': userId }, { $pull: { mument: { _id: updatedMument._id } } });

        // 리턴 데이터
        const data: LikeCountResponeDto = {
            mumentId: updatedMument._id,
            likeCount: updatedMument.likeCount,
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default {
    createMument,
    updateMument,
    getMument,
    deleteMument,
    getIsFirst,
    getMumentHistory,
    createLike,
    deleteLike,
};
