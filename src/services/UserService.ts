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


/**
 *  좋아요 누른 뮤멘트 리스트
 */
const getLikeMumentList = async (userId: string, tagList: number[]): Promise<UserMumentListResponseDto | null> => {
    try {
       
        // 좋아요한 뮤멘트 리스트 가져오기
        let likeMumentList: MyMumentInfoRDB[] = await userDB.myLikeMumentList(userId);

        // 좋아요 글 없을 시
        if (likeMumentList.length === 0) return {muments: []};

        let result: MumentResponseDto[] = [];

        // for문을 통해 하나의 뮤멘트에 대해 tag 합칠 배열
        let allCardTagList: number[] = [];

        // 카드뷰에 띄울 가공된 태그 리스트를 넣을 배열
        let cardTagList: number[] = [];


        const likeMumentListFunc = async (item: MyMumentInfoRDB, idx: number) => {
            if (idx === likeMumentList.length - 1 || (idx < likeMumentList.length - 1 && likeMumentList[idx + 1].mument_id !== item.mument_id)) {
                
                // 뮤멘트 태그 전체 합치기
                allCardTagList.push(item.tag_id);

                result.push({
                    _id: item.mument_id,
                    user: {
                        _id: item.user_id,
                        image: item.user_image as string,
                        name: item.profile_id as string
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
                    isLiked: true, //무조건 true
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

        await likeMumentList.reduce(async (pre, curr, index) => {
                return pre.then(() => likeMumentListFunc(curr, index));
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

export default {
    getMyMumentList,
    getLikeMumentList,
};
