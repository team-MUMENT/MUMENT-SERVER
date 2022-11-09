import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import constant from '../modules/serviceReturnConstant';
import { tagBannerTitle } from '../modules/tagTitle';
import { tagRandomTitle } from '../modules/tagTitle';
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
import HomeCandidate from '../models/HomeCandidate';
import TodaySelection from '../models/TodaySelection';
import { RandomMumentResponseDto } from '../interfaces/mument/RandomMumentResponeDto';
import { RandomMumentInterface } from '../interfaces/home/RandomMumentInterface';
import { TodayMumentResponseDto } from '../interfaces/mument/TodayMumentResponseDto';
import { TodayBannerResponseDto } from '../interfaces/mument/TodayBannerResponseDto';
import BannerSelection from '../models/BannerSelection';
import { BannerSelectionInfo } from '../interfaces/home/BannerSelectionInfo';
import { AgainMumentResponseDto } from '../interfaces/mument/AgainMumentResponseDto';
import { AgainSelectionInfo } from '../interfaces/home/AgainSelectionInfo';
import AgainSelection from '../models/AgainSelection';
import dummyData from '../modules/dummyData'; // 임시 더미 데이터
import pools from '../modules/pool';
import poolPromise from '../loaders/db';
import { Connection } from 'promise-mysql';
import { StringBaseResponseDto } from '../interfaces/common/StringBaseResponseDto';
import mumentDB from '../modules/db/Mument';

/** 
 * 뮤멘트 기록하기
*/
const createMument = async (userId: string, musicId: string, mumentCreateDto: MumentCreateDto): Promise<PostBaseResponseDto | null> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {    
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 뮤멘트 생성
        const query1 = 'INSERT INTO mument(user_id, music_id, content, is_first, is_Private) VALUES(?, ?, ?, ?, ?)';
        const query1Result = await connection.query(query1, [
            userId, musicId, 
            !mumentCreateDto.content ? null : mumentCreateDto.content, 
            mumentCreateDto.isFirst, 
            mumentCreateDto.isPrivate
        ]);

        // 뮤멘트 태그 생성
        await mumentDB.mumentTagCreate(mumentCreateDto.impressionTag, mumentCreateDto.feelingTag, connection, query1Result.insertId);
        
        await connection.commit(); // query1, query2 모두 성공시 커밋(데이터 적용)
        
        const data = {
            _id: query1Result.insertId,
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 수정하기
 */
const updateMument = async (mumentId: string, mumentUpdateDto: MumentCreateDto): Promise<StringBaseResponseDto | null | number> => {
    const pool: any = await poolPromise;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction(); // 트랜잭션 적용 시작

        // 쿼리 : 뮤멘트 존재하는지 확인
        const query1 = 'SELECT * FROM mument WHERE id=?;'
        const mument: any = await pools.queryValue(query1, [mumentId]);

        // 존재하지 않는 id의 뮤멘트를 수정하려고 할 때
        if (mument.length===0) return constant.NO_MUMENT;

        //뮤멘트 수정사항 update
        const query2 = 'UPDATE mument SET is_first=?, content=?, is_private=? WHERE id=?;';

        // 뮤멘트 업데이트
        await connection.query(query2, [
            mumentUpdateDto.isFirst,
            mumentUpdateDto.content != undefined ? mumentUpdateDto.content : null,
            mumentUpdateDto.isPrivate != undefined ? mumentUpdateDto.isPrivate : 0,
            mumentId
        ]);

        // 뮤멘트 태그 업데이트 : 기존 태그 모두 삭제 후 새로 삽입
        const query3 = 'DELETE FROM mument_tag where mument_id = ?;';
        await connection.query(query3, [mumentId]);

        await mumentDB.mumentTagCreate(mumentUpdateDto.impressionTag, mumentUpdateDto.feelingTag, connection, mumentId);

        await connection.commit(); // query1, query2 모두 성공시 커밋(데이터 적용)

        const data = {
            _id: mumentId,
        };

        return data;
    } catch (error) {
        console.log(error);
        await connection.rollback(); // query1, query2 중 하나라도 에러시 롤백 (데이터 적용 원상복귀)
        throw error;
    } finally {
        connection.release(); // pool connection 회수
    }
};

/**
 * 뮤멘트 상세보기
 */
const getMument = async (mumentId: string, userId: string): Promise<MumentResponseDto | null | number> => {
    try {
        /**
        * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
        */       
        const mument = dummyData.mumentDummy;
        // const mument = await Mument.findById(mumentId);
        if (!mument) return null;

        const loginUser = dummyData.userDummy;
        // const loginUser = await User.findById(userId);
        if (!loginUser) return null;

        if (mument.isPrivate === true && mument.user._id.toString() !== userId) return constant.PRIVATE_MUMENT;

        const music = dummyData.musicDummy;
        // const music = await Music.findById(mument.music._id);
        if (!music) return null;

        const isLiked = false;
        // const isLiked = await Like.findOne({
        //     $and: [
        //         {
        //             mument: { $elemMatch: { _id: mumentId } },
        //         },
        //         {
        //             'user._id': { $eq: userId },
        //         },
        //     ],
        // });

        const historyCount = 0;
        // const historyCount = await Mument.countDocuments({
        //     $and: [
        //         {
        //             'music._id': { $eq: mument.music._id },
        //         },
        //         {
        //             'user._id': { $eq: mument.user._id },
        //         },
        //     ],
        // });

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

/** 
 * 뮤멘트 삭제하기
*/
const deleteMument = async (mumentId: string): Promise<void | null> => {
    try {
        /**
         * ✅몽고디비 연결 임시 주석처리
         */
        // 추가 - 이미 isDelted 된거면 오류 메시지
    
        // //Mument soft delete
        // await Mument.findByIdAndUpdate(mumentId, {
        //     $set: {
        //         isDeleted: true,
        //     },
        // });

        // //Like에서 Mument 제거
        // await Like.updateMany(
        //     {},
        //     {
        //         $pull: { mument: { _id: mumentId } },
        //     },
        // );
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 처음/다시 들어요 선택
 */
const getIsFirst = async (userId: string, musicId: string): Promise<IsFirstResponseDto | null> => {
    try {
        const query1 = 'SELECT * FROM mument WHERE user_id=? AND music_id=? AND is_deleted=0;';
        const result: any = await pools.queryValue(query1, [userId, musicId]);
        console.log(result);
        const userMument = result;

        if (userMument.length === 0) {
            // 뮤멘트 기록이 처음인 경우 
            return {
                isFirst: true,
                firstAvailable: true,
            };
        } else {
            // 뮤멘트중 '처음 들었어요' 기록이 하나라도 존재하는 경우 true 반환
            const firstMument = userMument.some((mument: any) => {
                return mument.is_first == true;
            });

            if (firstMument === false) {
                // '처음 들었어요' 기록이 존재하지 않는 경우 - 처음 선택 가능
                return {
                    isFirst: false,
                    firstAvailable: true,
                };
            } else {
                // '처음 들었어요' 기록이 존재하는 경우 - 처음 선택 불가
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

/**
 * 나의 히스토리
 */
const getMumentHistory = async (userId: string, musicId: string, isLatestOrder: boolean): Promise<MumentHistoryResponseDto | null> => {
    try {
        /**
         * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        // // 음악 정보 조회
        // const music = await Music.findById(musicId);

        // // 음악이 존재하지 않으면 null 리턴
        // if (!music) {
        //     return null;
        // }

        // let originalMumentList;

        // // 해당 유저가 쓴 뮤멘트 전부 조회
        // switch (isLatestOrder) {
        //     case true: {
        //         // 최신순 정렬
        //         originalMumentList = await Mument.find({
        //             'user._id': userId,
        //             'music._id': musicId,
        //             isDeleted: false,
        //         }).sort({
        //             createdAt: -1,
        //         });
        //         break;
        //     }
        //     case false: {
        //         // 오래된순 정렬
        //         originalMumentList = await Mument.find({
        //             'user._id': userId,
        //             'music._id': musicId,
        //             isDeleted: false,
        //         }).sort({
        //             createdAt: 1,
        //         });
        //         break;
        //     }
        // }

        // // 결과값이 없을 경우
        // if (originalMumentList.length === 0) {
        //     const data: MumentHistoryResponseDto = {
        //         music,
        //         mumentHistory: [],
        //     };

        //     return data;
        // }

        // // mumentId array 리턴
        // const mumentIdList = originalMumentList.map(mument => mument._id);

        // // 해당 유저아이디의 document에서 mumentIdList find
        // const likeList = await Like.find({
        //     'user._id': userId,
        //     'mument._id': { $in: mumentIdList },
        // });

        // // map 함수 사용을 위해 날짜 가공해주는 함수
        // const createDate = (createdAt: Date): string => {
        //     const date = dayjs(createdAt).format('D MMM, YYYY');
        //     return date;
        // };

        // // 최종 리턴될 data
        // const mumentHistory: MumentCardViewInterface[] = [];
        // originalMumentList.reduce((ac: MumentCardViewInterface[], cur, index) => {
        //     // 카드뷰 태그 리스트
        //     const cardTag: number[] = [];
        //     const impressionTagLength = cur.impressionTag.length;
        //     const feelingTagLength = cur.feelingTag.length;

        //     if (impressionTagLength >= 1 && feelingTagLength >= 1) {
        //         cardTag.push(cur.impressionTag[0], cur.feelingTag[0]);
        //     } else if (impressionTagLength >= 1 && feelingTagLength < 1) {
        //         cardTag.push(...cur.impressionTag.slice(0, 2));
        //     } else if (impressionTagLength < 1 && feelingTagLength >= 1) {
        //         cardTag.push(...cur.feelingTag.slice(0, 2));
        //     }

        //     mumentHistory[index] = {
        //         ...cur.toObject(),
        //         cardTag: cardTag,
        //         date: createDate(cur.createdAt),
        //         isLiked: Boolean(mumentIdList[index] in likeList),
        //     };
        //     return mumentHistory;
        // }, []);

        // const data: MumentHistoryResponseDto = {
        //     music,
        //     mumentHistory,
        // };
        const data: MumentHistoryResponseDto = dummyData.myHistoryDummy;
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 뮤멘트 좋아요 등록 
*/ 
const createLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    try {
        /**
         * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        // // 해당 뮤멘트의 likeCount를 +1 해주고, 업데이트 이후의 값을 리턴
        // const updatedMument = await Mument.findOneAndUpdate({ _id: mumentId }, { $inc: { likeCount: +1 } }, { returnDocument: 'after' });

        // // 업데이트에 문제가 생겼을 경우 return null
        // if (!updatedMument) {
        //     return null;
        // }

        // // like 콜렉션에 추가하기 위해 music 정보 조회
        // const music = await Music.findById(updatedMument.music._id);

        // // music 정보가 없으면 return NO_MUSIC
        // if (!music) {
        //     return constant.NO_MUSIC;
        // }

        // // like 콜렉션에 추가할 뮤멘트
        // const likedMument: LikeMumentInfo = {
        //     _id: updatedMument._id,
        //     user: {
        //         _id: updatedMument.user._id,
        //         name: updatedMument.user.name,
        //         image: updatedMument.user.image,
        //     },
        //     music: {
        //         name: music.name,
        //         artist: music.artist,
        //         image: music.image,
        //     },
        //     isFirst: updatedMument.isFirst,
        //     impressionTag: updatedMument.impressionTag,
        //     feelingTag: updatedMument.feelingTag,
        //     content: updatedMument.content,
        //     isPrivate: updatedMument.isPrivate,
        //     createdAt: updatedMument.createdAt,
        // };

        // // like 콜렉션에 해당 뮤멘트 추가
        // await Like.updateOne({ 'user._id': userId }, { $push: { mument: likedMument } }, { upsert: true });

        // // 리턴 데이터
        // const data: LikeCountResponeDto = {
        //     mumentId: updatedMument._id,
        //     likeCount: updatedMument.likeCount,
        // };
        const data: LikeCountResponeDto = {
            mumentId: dummyData.mumentDummy._id,
            likeCount: 0
        }

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

/**
 * 뮤멘트 좋아요 취소
 */
const deleteLike = async (mumentId: string, userId: string): Promise<LikeCountResponeDto | null | number> => {
    try {
        /**
         * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */
        // // 해당 뮤멘트의 likeCount를 -1 해주고, 업데이트 이후의 값을 리턴
        // const updatedMument = await Mument.findOneAndUpdate({ _id: mumentId }, { $inc: { likeCount: -1 } }, { returnDocument: 'after' });

        // // 업데이트에 문제가 생겼을 경우 return null
        // if (!updatedMument) {
        //     return null;
        // }

        // // like collection에서 해당 뮤멘트 삭제
        // await Like.updateOne({ 'user._id': userId }, { $pull: { mument: { _id: updatedMument._id } } });

        // // 리턴 데이터
        // const data: LikeCountResponeDto = {
        //     mumentId: updatedMument._id,
        //     likeCount: updatedMument.likeCount,
        // };
        const data: LikeCountResponeDto = {
            mumentId: dummyData.mumentDummy._id,
            likeCount: -1
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 랜덤 태그, 뮤멘트 조회
const getRandomMument = async (): Promise<RandomMumentResponseDto | null> => {
    try {
        // 난수 생성 함수
        const createRandomNum = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // 태그 종류 결정을 위해 1과 2 사이에서 난수 생성
        const tagSort: number = createRandomNum(1, 2);

        // 태그 종류에 따라 세부 태그 결정
        let detailTag = 0;
        switch (tagSort) {
            case 1: {
                // impressionTag
                detailTag = createRandomNum(100, 105);
                break;
            }
            case 2: {
                // feelingTag
                detailTag = createRandomNum(200, 215);
                break;
            }
        }

        if (detailTag === 0) {
            return null;
        }

        const tagTitle: string = tagRandomTitle[detailTag as keyof typeof tagRandomTitle];

        /**
         * ✅몽고디비 연결 임시 주석처리 + data 변수에 임시로 더미 넣어둠
         */
        // // 조건에 맞는 랜덤 뮤멘트 가져오기
        // const randomMumentList: RandomMumentInterface[] = await HomeCandidate.aggregate([
        //     { $match: { $and: [{ isDeleted: false }, { isPrivate: false }, { $or: [{ impressionTag: detailTag }, { feelingTag: detailTag }] }] } },
        //     { $sample: { size: 3 } },
        //     { $project: { _id: '$mumentId', music: { name: 1, artist: 1 }, user: { name: 1, image: 1 }, impressionTag: 1, feelingTag: 1, content: 1, createdAt: 1 } },
        // ]);
        // const data: RandomMumentResponseDto = {
        //     title: tagTitle,
        //     mumentList: randomMumentList,
        // };
        const data: RandomMumentResponseDto = {
            title: tagTitle,
            mumentList: []
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 오늘의 뮤멘트 조회
const getTodayMument = async (): Promise<TodayMumentResponseDto | number> => {
    try {
        dayjs.extend(utc);
        dayjs.extend(timezone);

        // 리퀘스트 받아온 시간 판단 후 당일 자정으로 수정
        const todayMidnight = dayjs().hour(0).minute(0).second(0).millisecond(0);
        const todayUtcDate = dayjs(todayMidnight).utc().format();
        const todayDate = dayjs(todayMidnight).format('YYYY-MM-DD');

        /**
         * ✅몽고디비 연결 임시 주석처리 + 변수에 임시로 더미 넣어둠
         */        
        // const todayMument = await TodaySelection.findOne({
        //     displayDate: todayUtcDate,
        // });

        // if (!todayMument) {
        //     return constant.NO_HOME_CONTENT;
        // }

        // const data: TodayMumentResponseDto = {
        //     todayDate,
        //     todayMument,
        // };
        const data: TodayMumentResponseDto = {
            todayDate: todayDate,
            todayMument: dummyData.todaySelectionDummy
        };

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 배너
const getBanner = async (): Promise<TodayBannerResponseDto | number> => {
    try {
        dayjs.extend(utc);

        // 날짜 비교를 위해 이번주 월요일 자정 날짜 받아오기
        const mondayMidnight = dayjs().day(1).hour(0).minute(0).second(0).millisecond(0).utc().format();

        const todayDate = dayjs().format('YYYY-MM-DD');

        /**
         * ✅몽고디비 연결 임시 주석처리 + data 변수에 임시로 더미 넣어둠
         */
        // const bannerList: BannerSelectionInfo[] = await BannerSelection.find({
        //     displayDate: mondayMidnight,
        // });

        // if (bannerList.length === 0) return constant.NO_HOME_CONTENT;

        // const data: TodayBannerResponseDto = {
        //     todayDate,
        //     bannerList,
        // };
        const data: TodayBannerResponseDto = {
            todayDate: todayDate,
            bannerList: []
        };
        
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// 다시 들은 곡의 뮤멘트 조회
const getAgainMument = async (): Promise<AgainMumentResponseDto | number> => {
    try {
        dayjs.extend(utc);

        // 리퀘스트 받아온 시간 판단 후 당일 자정으로 수정
        const todayMidnight = dayjs().hour(0).minute(0).second(0).millisecond(0);
        const todayUtcDate = dayjs(todayMidnight).utc().format();
        const todayDate = dayjs(todayMidnight).format('YYYY-MM-DD');

        /**
         * ✅몽고디비 연결 임시 주석처리 + data 변수에 임시로 더미 넣어둠
         */
        // const againMument: AgainSelectionInfo[] = await AgainSelection.find({
        //     displayDate: todayUtcDate,
        // });

        // if (!againMument) {
        //     return constant.NO_HOME_CONTENT;
        // }

        // const data: AgainMumentResponseDto = {
        //     todayDate,
        //     againMument,
        // };
        const data: AgainMumentResponseDto = {
            todayDate,
            againMument: []
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
    getRandomMument,
    getTodayMument,
    getBanner,
    getAgainMument,
};
