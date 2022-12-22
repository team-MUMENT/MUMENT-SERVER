import dayjs from 'dayjs';
import { UserMumentListResponseDto } from '../interfaces/user/UserMumentListResponseDto';
import { MumentResponseDto } from '../interfaces/mument/MumentResponseDto';
import { LikeInfo } from '../interfaces/like/LikeInfo';
import { MumentInfo } from '../interfaces/mument/MumentInfo';
import { UserInfo } from '../interfaces/user/UserInfo';
import Mument from '../models/Mument';
import Music from '../models/Music';
import Like from '../models/Like';
import User from '../models/User';
import constant from '../modules/serviceReturnConstant';
import dummyData from '../modules/dummyData';
import pools from '../modules/pool';
import { MumentInfoRDB } from '../interfaces/mument/MumentInfoRdb';
import { UserInfoRDB } from '../interfaces/user/UserInfoRDB';
import mumentDB from '../modules/db/Mument';
import userDB from '../modules/db/User';
import { MyMumentInfoRDB } from '../interfaces/mument/MyMumentInfoRDB';
import cardTag from '../modules/db/cardTagList';
import cardTagList from '../modules/db/cardTagList';

/**
 * 내가 작성한 뮤멘트 리스트
 */
const getMyMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
        // 내가 작성한 뮤멘트 리스트&음악 정보 가져오기
        let myMumentList: MyMumentInfoRDB[] = await userDB.myMumentList(userId);
        if (myMumentList.length === 0) return {muments: []};

        let result: MumentResponseDto[] = [];

        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList: number[] = [];

        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList: number[] = [];

        // 나의 유저 정보
        const user = await userDB.userInfo(myMumentList[0].user_id.toString());

        const myMumentListFunc = async (item: MyMumentInfoRDB, idx: number) => {
            if (idx === myMumentList.length - 1 || (idx < myMumentList.length - 1 && myMumentList[idx + 1].mument_id !== item.mument_id)) {
                
                // isLiked 좋아요 유무
                const isLiked = await mumentDB.isLiked(item.mument_id.toString(), item.user_id.toString());
                // 뮤멘트 태그 전체 합치기
                allCardTagList.push(item.tag_id);

                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: user.image,
                        name: user.profile_id
                    },
                    music: {
                        _id: item.music_id,
                        name: item.name,
                        artist: item.artist,
                        image: item.music_image
                    },
                    isFirst: Boolean(item.is_first),
                    allCardTag: allCardTagList, // 전체 태그 리스트
                    cardTag: cardTagList, // 카드뷰에 띄우는 로직으로 처리한 최대 2개의 태그 리스트
                    content: item.content,
                    isPrivate: Boolean(item.is_private),
                    likeCount: item.like_count,
                    isLiked: Boolean(isLiked),
                    createdAt: dayjs(item.created_at).format('D MMM, YYYY'),
                    year: Number(dayjs(item.created_at).format('YYYY')),
                    month: Number(dayjs(item.created_at).format('M'))
                });

                // 리셋
                allCardTagList = []; 
                cardTagList = []; 
            } else {
                // 뮤멘트 태그 합치기
                allCardTagList.push(item.tag_id);
            }
        };

        await myMumentList.reduce(async (pre, curr, index) => {
                return pre.then(() => myMumentListFunc(curr, index));
        }, Promise.resolve());

        // 필링 태그 존재시 뮤멘트 필터링 - 전체 태그 리스트에서 필터링하고, 카드뷰에 띄우는건 cardTag
        if (tagList.length > 0) {
            result = result.filter(mument => {
                return tagList.every(tag => {
                    return mument.allCardTag?.includes(tag);
                });
            });
        }

        return {
            muments: result,
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getLikeMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
        /**
         * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        let likeMumentList = [dummyData.mumentDummy, dummyData.mumentDummy];
        // [dummyData.mumentDummy, dummyData.mumentDummy]
        // const myMumentList: LikeInfo | null = await Like.findOne({
        //     'user._id': userId,
        // });

        // // 좋아요 기록이 없다고 판단할 수 있는 케이스 두 가지 처리
        // if (!myMumentList || (myMumentList && myMumentList.mument.length === 0)) {
        //     return {
        //         muments: [],
        //     };
        // }

        likeMumentList.sort((a, b) => {
            return +new Date(b.createdAt) - +new Date(a.createdAt);
        });

        // 필터링 태그 존재시 뮤멘트 필터링
        if (tagList.length > 0) {
            likeMumentList = likeMumentList.filter(mument => {
                const mumentTagList = mument.impressionTag.concat(mument.feelingTag);

                return tagList.every(tag => {
                    return mumentTagList.includes(tag);
                });
            });
        }

        const data = await Promise.all(
            likeMumentList.map((mument: any) => {
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

export default {
    getMyMumentList,
    getLikeMumentList,
};
